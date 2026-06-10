import { AppState } from '@/hooks/useStore';
import axios from 'axios';
import { API_BASE_URL } from './apiConfig';
import { getStaticTips } from '@/constants/staticTips';
import { supabase } from '@/lib/supabase';

// Базовый URL вычисляется в ./apiConfig:
//   - в разработке (__DEV__) — локальный dev-сервер (с авто-определением IP машины);
//   - в продакшне — EXPO_PUBLIC_API_BASE_PRODUCTION.

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Текущий access-token пользователя из сессии Supabase.
 * Бэкенд проверяет его и определяет владельца данных (модель ExternalUser),
 * поэтому защищённые эндпоинты требуют заголовок `Authorization: Bearer ...`.
 */
const getAccessToken = async (): Promise<string | null> => {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  } catch {
    return null;
  }
};

// Прокидываем токен в каждый запрос axios (синхронизация данных пользователя).
api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Таймаут по умолчанию для нативных fetch-запросов (мс)
const FETCH_TIMEOUT_MS = 15000;

/**
 * Обёртка над fetch с таймаутом через AbortController.
 * Без неё native fetch может висеть бесконечно на плохой сети.
 */
const fetchWithTimeout = async (
  input: RequestInfo,
  init: RequestInit = {},
  timeoutMs: number = FETCH_TIMEOUT_MS
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      throw new Error('Превышено время ожидания ответа сервера');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  order: number;
}

export interface TestResult {
  userId?: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  answers: Array<{
    questionId: string;
    selectedAnswer: number;
    isCorrect: boolean;
  }>;
}

export interface Tip {
  id: string;
  title: string;
  content: string;
  page: string;
  order: number;
  isActive: boolean;
  /** URL видеоурока (готовый: абсолютный S3 или относительный /api/media/...). */
  videoUrl?: string | null;
  /** Подпись к видео. */
  videoTitle?: string | null;
}

export interface ChatGPTMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatGPTRequest {
  message: string;
  context?: string;
  conversationHistory?: ChatGPTMessage[];
}

export interface ChatGPTResponse {
  response: string;
  conversationId?: string;
  messageId?: string;
  tokenUsage?: number;
}

// Типы для синхронизации данных пользователя
export interface UserData {
  userId: string;
  categories?: any[];
  wallets?: any[];
  expences?: any[];
  incomes?: any[];
  actives?: any[];
  passives?: any[];
  goals?: any[];
  personalFinancialPlan?: any;
  theme?: string;
  language?: string;
  currency?: string;
  lastSyncedAt?: string;
}

export interface SyncResponse {
  success: boolean;
  data?: UserData;
  message?: string;
}

// ========== Лёгкий in-memory кэш ==========
// Серверный контент (вопросы теста, подсказки) меняется редко, поэтому держим
// его в памяти процесса. Это убирает полноэкранную «загрузку» при каждом
// переходе на экран — данные уже есть, а сеть дёргаем максимум раз в TTL.

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 минут

interface CacheEntry<T> {
  data: T;
  ts: number;
}

const questionsCache: { current: CacheEntry<Question[]> | null } = { current: null };
const tipsCache: Record<string, CacheEntry<Tip[]>> = {};

const isFresh = (entry: CacheEntry<unknown> | null | undefined): boolean =>
  !!entry && Date.now() - entry.ts < CACHE_TTL_MS;

/** Синхронно вернуть уже загруженные вопросы (или null), чтобы отрисовать экран без ожидания. */
export const getCachedQuestions = (): Question[] | null =>
  questionsCache.current ? questionsCache.current.data : null;

/** Синхронно вернуть уже загруженные подсказки для страницы (или null). */
export const getCachedTips = (page?: string): Tip[] | null => {
  const entry = tipsCache[page || '__all__'];
  return entry ? entry.data : null;
};

// ========== Функции с единым стилем fetch ==========

export const fetchQuestions = async (force = false): Promise<Question[]> => {
  // Свежий кэш — отдаём мгновенно, без сетевого запроса.
  if (!force && isFresh(questionsCache.current)) {
    return questionsCache.current!.data;
  }

  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/public/questions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = (await response.json()) as Question[];
    questionsCache.current = { data, ts: Date.now() };
    return data;
  } catch (error) {
    console.error('Error fetching questions:', error);
    // На ошибке отдаём прошлый кэш (даже устаревший), если он есть.
    if (questionsCache.current) return questionsCache.current.data;
    throw error;
  }
};

export const fetchTips = async (page?: string, force = false): Promise<Tip[]> => {
  const cacheKey = page || '__all__';

  // Свежий кэш — отдаём мгновенно.
  if (!force && isFresh(tipsCache[cacheKey])) {
    return tipsCache[cacheKey].data;
  }

  try {
    const url = page
      ? `${API_BASE_URL}/api/public/tips?page=${encodeURIComponent(page)}`
      : `${API_BASE_URL}/api/public/tips`;

    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = (await response.json()) as Tip[];

    // Если БД вернула пустой список — используем статичный резерв,
    // чтобы подсказка в приложении не оставалась пустой.
    const result = (!Array.isArray(data) || data.length === 0) ? getStaticTips(page) : data;
    tipsCache[cacheKey] = { data: result, ts: Date.now() };
    return result;
  } catch (error) {
    // Сеть/сервер недоступны — отдаём прошлый кэш, иначе статичные подсказки.
    console.warn('fetchTips: используем статичные подсказки (fallback):', error);
    if (tipsCache[cacheKey]) return tipsCache[cacheKey].data;
    return getStaticTips(page);
  }
};

export const sendChatGPTMessage = async (request: ChatGPTRequest): Promise<ChatGPTResponse> => {
  try {
    const token = await getAccessToken();
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/public/chat/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        message: request.message,
        context: request.context,
        // Имя поля должно совпадать с тем, что ждёт сервер.
        conversationHistory: request.conversationHistory,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Сервер возвращает { success, response, tokensUsed }.
    return {
      response: data.response,
      tokenUsage: data.tokensUsed,
    };
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

/**
 * Отправка все данные пользователя на сервер
 */
export const syncUserDataToServer = async (
  userId: string,
  storeData: Partial<AppState>
): Promise<SyncResponse> => {
  try {
    const userData: UserData = {
      userId,
      categories: storeData.categories,
      wallets: storeData.wallets,
      expences: storeData.expences,
      incomes: storeData.incomes,
      actives: storeData.actives,
      passives: storeData.passives,
      goals: storeData.goals,
      personalFinancialPlan: storeData.personalFinancialPlan,
      theme: storeData.theme,
      language: storeData.language,
      currency: storeData.currency,
      lastSyncedAt: new Date().toISOString(),
    };

    const response = await api.post('/api/public/user-data/sync', userData);
    return response.data;
  } catch (error) {
    console.error('Error syncing user data to server:', error);
    throw error;
  }
};

/**
 * Получить данные пользователя с сервера
 */
export const fetchUserDataFromServer = async (
  userId: string
): Promise<UserData | null> => {
  try {
    const response = await api.get(`/api/public/user-data/${userId}`);
    return response.data;
  } catch (error: any) {
    // Если пользователь не найден (404), возвращаем null
    if (error.response?.status === 404) {
      return null;
    }
    console.error('Error fetching user data from server:', error);
    throw error;
  }
};

/**
 * Удалить все данные пользователя с сервера
 */
export const deleteUserDataFromServer = async (
  userId: string
): Promise<SyncResponse> => {
  try {
    const response = await api.delete(`/api/public/user-data/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting user data from server:', error);
    throw error;
  }
};

export default api;