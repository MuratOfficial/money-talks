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
  context?: string; // Контекст из текущего урока
  conversationHistory?: ChatGPTMessage[];
}

export interface ChatGPTResponse {
  response: string;
  conversationId?: string;
}

export const fetchQuestions = async (): Promise<Question[]> => {
  try {
    const response = await api.get('/questions');
    return response.data;
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
};

// Сохранить результат теста
export const saveTestResult = async (result: TestResult): Promise<void> => {
  try {
    await api.post('/results', result);
  } catch (error) {
    console.error('Error saving test result:', error);
    throw error;
  }
};

// Получить советы
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

// ChatGPT интеграция
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

export default api;