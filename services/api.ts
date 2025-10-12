import axios from 'axios';

const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api/public' 
  : 'https://your-domain.com/api/public'; 

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
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

// Получить все вопросы
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

export interface Tip {
  id: string;
  title: string;
  content: string; 
  page: string;
  order: number;
  isActive: boolean;
}

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


export default api;