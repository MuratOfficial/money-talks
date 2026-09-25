import { AppState } from '@/hooks/useStore';
import axios from 'axios';
import { API_BASE_URL } from './apiConfig';
import type { StatementResult } from '@/utils/statementImport';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStaticTips } from '@/constants/staticTips';
import { AppSettings, DEFAULT_APP_SETTINGS, mergeAppSettings } from '@/constants/appSettings';
import { APP_SETTINGS_KEY } from '@/constants/storageKeys';
import { FALLBACK_PORTFOLIO_TEMPLATES, PortfolioTemplate } from '@/constants/portfolioTemplates';
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
/** Загрузка и разбор выписки на много страниц на медленном интернете — дольше обычного запроса. */
const STATEMENT_TIMEOUT_MS = 60000;

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
  /** Валюта пользователя — чтобы ИИ считал в ней, а не в рублях. */
  currency?: string;
}

/** Расход вопросов к ИИ за сегодня. remaining === null — лимит не задан. */
export interface ChatUsage {
  used: number;
  limit: number;
  remaining: number | null;
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
  riskProfile?: any;
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

// ========== Контент раздела «Инвестиции» ==========

/** Брокер из справочника админки. */
export interface Broker {
  id: string;
  name: string;
  license?: string | null;
  minAmount?: string | null;
  commission?: string | null;
  description?: string | null;
  url?: string | null;
}

export interface InvestContent {
  templates: PortfolioTemplate[];
  brokers: Broker[];
}

let investCache: CacheEntry<InvestContent> | null = null;

/** Синхронно вернуть уже загруженный контент инвестиций (или null). */
export const getCachedInvestContent = (): InvestContent | null => (investCache ? investCache.data : null);

/**
 * Шаблоны портфелей и справочник брокеров.
 *
 * Шаблонов без сети всё равно не должно быть пусто — подставляем встроенные
 * (constants/portfolioTemplates). Справочник брокеров придумывать нельзя,
 * поэтому при ошибке он остаётся пустым, а экран показывает это честно.
 */
export const fetchInvestContent = async (force = false): Promise<InvestContent> => {
  if (!force && isFresh(investCache)) {
    return investCache!.data;
  }

  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/public/invest`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    const templates: PortfolioTemplate[] = Array.isArray(data?.templates) && data.templates.length > 0
      ? data.templates
      : FALLBACK_PORTFOLIO_TEMPLATES;
    const brokers: Broker[] = Array.isArray(data?.brokers) ? data.brokers : [];

    investCache = { data: { templates, brokers }, ts: Date.now() };
    return investCache.data;
  } catch (error) {
    console.warn('fetchInvestContent: используем встроенные шаблоны:', error);
    if (investCache) return investCache.data;
    return { templates: FALLBACK_PORTFOLIO_TEMPLATES, brokers: [] };
  }
};

// ========== Тексты из админки ==========

/**
 * Тексты приложения, которые правит админ (сейчас — подпись в PDF с ЛФП).
 *
 * Кэш двухслойный: в памяти на время сессии и в AsyncStorage между запусками.
 * Выгрузка PDF не должна зависеть от сети, поэтому при любой ошибке отдаём
 * последнее, что знаем, а если не знаем ничего — значения по умолчанию.
 */
let appSettingsCache: CacheEntry<AppSettings> | null = null;

export const fetchAppSettings = async (force = false): Promise<AppSettings> => {
  if (!force && isFresh(appSettingsCache)) {
    return appSettingsCache!.data;
  }

  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/public/settings`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const settings = mergeAppSettings(await response.json());
    appSettingsCache = { data: settings, ts: Date.now() };
    // Сохраняем для офлайна; ошибку записи глотаем — это всего лишь кэш.
    AsyncStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(settings)).catch(() => {});
    return settings;
  } catch (error) {
    console.warn('fetchAppSettings: используем сохранённые тексты:', error);
    if (appSettingsCache) return appSettingsCache.data;

    try {
      const stored = await AsyncStorage.getItem(APP_SETTINGS_KEY);
      if (stored) {
        const settings = mergeAppSettings(JSON.parse(stored));
        appSettingsCache = { data: settings, ts: Date.now() };
        return settings;
      }
    } catch {
      /* кэш повреждён — ниже вернём умолчания */
    }

    return DEFAULT_APP_SETTINGS;
  }
};

/**
 * Сколько вопросов к ИИ осталось сегодня. Ошибку не пробрасываем: счётчик —
 * приятная мелочь, из-за него чат открываться не должен.
 */
export const fetchChatUsage = async (): Promise<ChatUsage | null> => {
  try {
    const token = await getAccessToken();
    if (!token) return null;

    const response = await fetchWithTimeout(`${API_BASE_URL}/api/public/chat/usage`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return null;

    const data = await response.json();
    if (typeof data?.used !== 'number') return null;
    return {
      used: data.used,
      limit: typeof data.limit === 'number' ? data.limit : 0,
      remaining: typeof data.remaining === 'number' ? data.remaining : null,
    };
  } catch (error) {
    console.warn('fetchChatUsage:', error);
    return null;
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
        currency: request.currency,
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
      riskProfile: storeData.riskProfile,
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

/** Выбранный PDF: на телефоне — uri, в вебе ещё и сам File. */
export interface StatementFile {
  uri: string;
  name: string;
  mimeType?: string | null;
  file?: File;
}

/**
 * Отправляет PDF-выписку на разбор. Файл нужен серверу только на время
 * разбора и не сохраняется. Ошибки сервера уже на русском — отдаём их как есть.
 */
export const parseStatementPdf = async (file: StatementFile): Promise<StatementResult> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Войдите в приложение, чтобы загрузить выписку.');

  const form = new FormData();
  if (file.file) {
    form.append('file', file.file, file.name);
  } else {
    // React Native отправляет файл по uri в таком виде.
    form.append('file', { uri: file.uri, name: file.name, type: file.mimeType || 'application/pdf' } as unknown as Blob);
  }

  let response: Response;
  try {
    response = await fetchWithTimeout(
      `${API_BASE_URL}/api/public/statements/parse`,
      { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form },
      STATEMENT_TIMEOUT_MS
    );
  } catch (error: any) {
    throw new Error(error?.message?.includes('время ожидания') ? error.message : 'Нет связи с сервером. Проверьте интернет и попробуйте снова.');
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error || 'Не получилось разобрать выписку. Попробуйте ещё раз.');
  }
  return data as StatementResult;
};

export default api;