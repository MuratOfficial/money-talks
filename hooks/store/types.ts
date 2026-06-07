// Типы данных стора
export interface Goal {
  id: string;
  name: string;
  type: 'short' | 'medium' | 'long';
  timeframe: {
    day: string;
    month: string;
    year: string;
  };
  currency: 'KZT' | 'USD';
  amount: string;
  collected?: string;
  progress?: number;
  inflationRate: string;
  returnRate: string;
  monthlyInvestment: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export interface VerifyOtpParams {
  email: string;
  token: string;
  type: 'recovery' | 'signup' | 'email_change';
}

export interface UpdatePasswordParams {
  newPassword: string;
}

export interface GoalFormData {
  name: string;
  type: 'short' | 'medium' | 'long';
  timeframe: {
    day: string;
    month: string;
    year: string;
  };
  collected?: string;
  progress?: number;
  currency: 'KZT' | 'USD';
  amount: string;
  inflationRate: string;
  returnRate: string;
  monthlyInvestment: string;
}

export interface FinancialItem {
  id: string;
  name: string;
  amount: string;
  color: string;
  icon: string;
  iconType?: string;
}

export interface FinancialCategory {
  id: string;
  title: string;
  balance: string;
  balanceUSD?: string;
  balanceEUR?: string;
  items: FinancialItem[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  riskProfile?: 'conservative' | 'moderate' | 'aggressive';
}

export interface Wallet {
  id: string;
  name: string;
  type: string;
  summ: number;
  summUSD?: number;
  summEUR?: number;
  currency: string;
  icon?: string;
  color?: string;
}

export interface Asset {
  id: string;
  name: string;
  amount: number;
  yield?: number;
  additional?: number;
  icon?: string;
  iconType?: string;
  color?: string;
  regularity?: string;
  categoryTab?: string;
  createdAt?: Date;
}

export interface PersonalFinancialPlan {
  id: string;
  fio: string;
  birthDate: {
    day: string;
    month: string;
    year: string;
  };
  activity: string;
  financialDependents: string;
  securityPillow: string;
  insurance: {
    life: string;
    disability: string;
    medical: string;
  };
  riskProfile: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppState {
  // Пользователь
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Финансовые данные
  categories: FinancialCategory[];
  expences: Asset[];
  incomes: Asset[];
  actives: Asset[];
  passives: Asset[];
  currentGoalType: string;

  // Цели
  goals: Goal[];
  currentGoalChangeId: string;
  currentEditWalletId: string;

  // Редактирование ассет
  currentAsset: Asset | null;

  totalBalance: string;
  walletBalance: string;
  walletBalanceUSD: string;
  walletBalanceEUR: string;
  wallets: Wallet[];

  // ЛФП данные
  personalFinancialPlan: PersonalFinancialPlan | null;

  // Настройки
  theme: 'light' | 'dark';
  language: 'ru' | 'en' | 'kz';
  currency: '₸' | '$' | '€';

  // Выборы в фильтрах
  currentCategoryOption: string;
  currentRegOption: string;
  setRegOption: (opt: string) => void;
  setCategoryOption: (opt: string) => void;

  // Действия с пользователем
  setUser: (user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  updateUserProfile: (updates: Partial<User>) => void;

  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  verifyResetCode: (email: string, code: string) => Promise<{ success: boolean; error?: string }>;

  resetPassword: (email: string) => Promise<AuthResponse>;
  verifyOtp: (params: VerifyOtpParams) => Promise<AuthResponse>;
  updatePassword: (params: UpdatePasswordParams) => Promise<AuthResponse>;

  // Действия с финансами
  setCategories: (categories: FinancialCategory[]) => void;
  addCategory: (category: Omit<FinancialCategory, 'id'>) => void;
  updateCategory: (categoryId: string, updates: Partial<FinancialCategory>) => void;
  deleteCategory: (categoryId: string) => void;
  resetCategory: () => void;

  // Действия с кошельком
  setWallets: (wallets: Wallet[]) => void;
  addWallet: (wallet: Omit<Wallet, 'id'>) => void;
  updateWallet: (walletId: string, updates: Partial<Wallet>) => void;
  deleteWallet: (id: string) => void;
  pickEditWallet: (id: string) => void;
  getWalletById: (id: string) => Wallet | undefined;

  addFinancialItem: (categoryId: string, item: Omit<FinancialItem, 'id'>) => void;
  updateFinancialItem: (categoryId: string, itemId: string, updates: Partial<FinancialItem>) => void;
  deleteFinancialItem: (categoryId: string, itemId: string) => void;

  // Вычисляемые значения
  getTotalBalance: () => number;
  getCategoryBalance: (categoryId: string) => number;
  getWalletBalance: () => void;

  // Расходы Доходы
  addExpences: (expence: Omit<Asset, 'id'>) => void;
  addIncomes: (income: Omit<Asset, 'id'>) => void;

  // Активы
  addActives: (active: Omit<Asset, 'id'>) => void;

  // Пассивы
  addPassives: (active: Omit<Asset, 'id'>) => void;

  // Функции для обновления
  updateExpences: (id: string, expence: Partial<Omit<Asset, 'id'>>) => void;
  updateIncomes: (id: string, income: Partial<Omit<Asset, 'id'>>) => void;
  updateActives: (id: string, active: Partial<Omit<Asset, 'id'>>) => void;
  updatePassives: (id: string, passive: Partial<Omit<Asset, 'id'>>) => void;

  // Действия с настройками
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: 'ru' | 'en' | 'kz') => void;
  setCurrency: (currency: '₸' | '$' | '€') => void;

  // Редактирование ассета
  setCurrentAsset: (asset: Asset | null) => void;

  // Утилиты
  formatAmount: (amount: number) => string;
  generateId: () => string;

  // Цели
  setGoalFilter: (type: string) => void;
  pickEditGoal: (id: string) => void;
  addGoal: (goalData: GoalFormData) => string;
  updateGoal: (id: string, goalData: Partial<GoalFormData>) => boolean;
  deleteGoal: (id: string) => boolean;
  getGoalById: (id: string) => Goal | undefined;
  getGoalsByType: (type: 'short' | 'medium' | 'long') => Goal[];

  // Новые действия с ЛФП
  initializePersonalFinancialPlan: (userData?: Partial<PersonalFinancialPlan>) => string;
  updatePersonalFinancialPlan: (updates: Partial<PersonalFinancialPlan>) => boolean;
  resetPersonalFinancialPlan: () => void;
  clearPersonalFinancialPlan: () => void;
  getPersonalFinancialPlan: () => PersonalFinancialPlan | null;
}

/** Тип создателя слайса для общего стора */
export type SliceCreator<T> = (
  set: (partial: Partial<AppState> | ((state: AppState) => Partial<AppState>)) => void,
  get: () => AppState
) => T;
