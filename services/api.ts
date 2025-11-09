import { AppState } from '@/hooks/useStore';
import axios from 'axios';

const API_BASE_URL = 'https://moneytalks-admin.netlify.app/api/public'; 

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, 
  headers: {
    'Content-Type': 'application/json',
  },
});

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
}

export interface ChatGPTMessage {
  role: 'user' | 'assistant' | 'system';
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

// ========== Существующие функции ==========

export const fetchQuestions = async (): Promise<Question[]> => {
  try {
    const response = await api.get('/questions');
    return response.data;
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
};

export const saveTestResult = async (result: TestResult): Promise<void> => {
  try {
    await api.post('/results', result);
  } catch (error) {
    console.error('Error saving test result:', error);
    throw error;
  }
};

export const fetchTips = async (page?: string): Promise<Tip[]> => {
  try {
    const url = page ? `/tips?page=${encodeURIComponent(page)}` : '/tips';
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching tips:', error);
    throw error;
  }
};

export const sendChatGPTMessage = async (
  request: ChatGPTRequest
): Promise<ChatGPTResponse> => {
  try {
    const response = await api.post('/chatgpt', request);
    return response.data;
  } catch (error) {
    console.error('Error calling ChatGPT:', error);
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

    const response = await api.post('/user-data/sync', userData);
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
    const response = await api.get(`/user-data/${userId}`);
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
 * Обновление конкретной части данных пользователя
 */
export const updateUserDataPartial = async (
  userId: string,
  dataType: 'categories' | 'wallets' | 'expences' | 'incomes' | 'actives' | 'passives' | 'goals' | 'personalFinancialPlan',
  data: any
): Promise<SyncResponse> => {
  try {
    const response = await api.patch(`/user-data/${userId}/${dataType}`, { data });
    return response.data;
  } catch (error) {
    console.error(`Error updating ${dataType}:`, error);
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
    const response = await api.delete(`/user-data/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting user data from server:', error);
    throw error;
  }
};

/**
 * Проверить, нужна ли синхронизация (сравнение timestamp)
 */
export const checkSyncStatus = async (
  userId: string,
  localLastSyncedAt?: string
): Promise<{ needsSync: boolean; serverTimestamp?: string }> => {
  try {
    const response = await api.get(`/user-data/${userId}/sync-status`, {
      params: { localTimestamp: localLastSyncedAt }
    });
    return response.data;
  } catch (error) {
    console.error('Error checking sync status:', error);
    throw error;
  }
};

export default api;