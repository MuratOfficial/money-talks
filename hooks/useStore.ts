import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { Platform } from 'react-native';

// Типы данных
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
  progress?:number;
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
  progress?:number;
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
}

export interface FinancialCategory {
  id: string;
  title: string;
  balance: string;
  items: FinancialItem[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  avatar?: string | null;
  riskProfile?: 'conservative' | 'moderate' | 'aggressive';
}

export interface Wallet {
  id: string;
  name: string;
  type: string;
  summ: number;
  currency: string;
  icon?: string;
  color?: string;
}

export interface Asset {
  id: string;
  name: string;
  amount: number;
  yield?: number;
  additional?:number;
  icon?: string;
  color?: string;
}

// Новый интерфейс для ЛФП данных
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

  // Редактирование ассет
  currentAsset: Asset | null;
 
  totalBalance: string;
  walletBalance: string;
  wallets: Wallet[];

  // ЛФП данные
  personalFinancialPlan: PersonalFinancialPlan | null;

  // Настройки
  theme: 'light' | 'dark';
  language: 'ru' | 'en' | 'kz';
  currency: '₸' | '$' | '€';
  
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

  // Действия с кошелком
  setWallets: (wallets: Wallet[]) => void;
  addWallet: (wallet: Omit<Wallet, 'id'>) => void;
  updateWallet: (walletId: string, updates: Partial<Wallet>) => void;
  
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
  pickEditGoal: (id:string) => void;
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

// Начальные данные
const initialCategories: FinancialCategory[] = [
  {
    id: 'income',
    title: 'Доходы',
    balance: '1 050 000 ₸',
    items: [
      { 
        id: 'salary', 
        name: 'Зарплата', 
        amount: '600 000 ₸', 
        color: '#4FC3F7', 
        icon: 'wallet' 
      },
      { 
        id: 'bank-income', 
        name: 'Банк', 
        amount: '50 000 ₸', 
        color: '#66BB6A', 
        icon: 'business' 
      },
      { 
        id: 'crypto', 
        name: 'Криптовалюта', 
        amount: '200 000 ₸', 
        color: '#7986CB', 
        icon: 'logo-bitcoin' 
      },
      { 
        id: 'pension-income', 
        name: 'Пенсия', 
        amount: '200 000 ₸', 
        color: '#FFB74D', 
        icon: 'card' 
      }
    ]
  },
  {
    id: 'expence',
    title: 'Расходы',
    balance: '79 500 ₸',
    items: [
      { id: 'payments', name: 'Покупки', amount: '40 000 ₸', color: '#4FC3F7', icon: 'bag' },
      { id: 'education', name: 'Образование', amount: '8 000 ₸', color: '#66BB6A', icon: 'school' },
      { id: 'tech', name: 'Техника', amount: '6 000 ₸', color: '#E91E63', icon: 'phone-portrait' },
      { id: 'entertainment', name: 'Развлечения', amount: '1 300 ₸', color: '#FF9800', icon: 'game-controller' }
    ]
  },
];

// Функция для создания дефолтного ЛФП
const createDefaultPFP = (generateId: () => string, userData?: Partial<PersonalFinancialPlan>): PersonalFinancialPlan => ({
  id: generateId(),
  fio: '',
  birthDate: {
    day: 'День',
    month: 'Месяц',
    year: 'Год',
  },
  activity: '',
  financialDependents: '',
  securityPillow: '1 000 000 ₸',
  insurance: {
    life: '500 000 ₸',
    disability: '600 000 ₸',
    medical: '600 000 ₸',
  },
  riskProfile: 'Агрессивный',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...userData
});

// Создание Zustand Store с персистентностью
export const useFinancialStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Начальное состояние
      user: {name:"Unknown", password:"password", email:"", id:"initial"},
      isAuthenticated: false,
      currentGoalType:"Краткосрочные",
      isLoading: false,
      categories: initialCategories,
      totalBalance: '1 990 000 ₸',
      currentGoalChangeId:"",
      walletBalance: '0 ₸',
      theme: 'dark',
      language: 'ru',
      currency: '₸',
      wallets: [],
      expences: [],
      incomes: [],
      actives: [],
      passives:[],
      currentAsset:null,
      goals: [],
      personalFinancialPlan: null, // Добавлено состояние для ЛФП
      
      // Утилиты
      generateId: () => Date.now().toString() + Math.random().toString(36).substr(2, 9),
      
      formatAmount: (amount: number) => {
        const { currency } = get();
        return new Intl.NumberFormat('ru-RU').format(amount) + ' ' + currency;
      },

      // Пользователь
      setUser: (user) => set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false 
      }),

      logout: () => set({ 
        user: null, 
        isAuthenticated: false 
      }),

      setLoading: (isLoading) => set({ isLoading }),

      signUp: async (email: string, password: string, name: string) => {
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name,
              },
            },
          });

          if (error) throw error;

          if (data.user) {
            const user: User = {
              id: data.user.id,
              email: data.user.email!,
              name: name,
              password: '', 
              avatar: null,
            };

            set({ user, isAuthenticated: true });
            return { success: true };
          }

          return { success: false, error: 'Не удалось создать пользователя' };
        } catch (error: any) {
          return { success: false, error: error.message };
        }
      },

      signIn: async (email: string, password: string) => {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          if (data.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single();

            const user: User = {
              id: data.user.id,
              email: data.user.email!,
              name: data.user.user_metadata?.full_name || data.user.email!,
              password: '',
              avatar: profile?.avatar || null,
              riskProfile: profile?.risk_profile,
            };

            set({ user, isAuthenticated: true });
            return { success: true };
          }

          return { success: false, error: 'Не удалось войти' };
        } catch (error: any) {
          return { success: false, error: error.message };
        }
      },

      signOut: async () => {
        try {
          await supabase.auth.signOut();
          set({ 
            user: null, 
            isAuthenticated: false,
            goals: [],
            categories: [],
            wallets: [],
            personalFinancialPlan: null
          });
        } catch (error) {
          console.error('Ошибка при выходе:', error);
        }
      },

        resetPassword: async (email: string): Promise<AuthResponse> => {
        try {
          // Отправляем код восстановления без redirect_to
          const { data, error } = await supabase.auth.resetPasswordForEmail(email);

          if (error) {
            console.error('Ошибка отправки кода:', error);
            return { 
              success: false, 
              error: error.message 
            };
          }

          return { 
            success: true, 
            data 
          };
        } catch (error: any) {
          console.error('Ошибка resetPassword:', error);
          return { 
            success: false, 
            error: error.message || 'Произошла неизвестная ошибка' 
          };
        }
      },

      verifyOtp: async ({ email, token, type }: VerifyOtpParams): Promise<AuthResponse> => {
        try {
          const { data, error } = await supabase.auth.verifyOtp({
            email,
            token,
            type
          });

          if (error) {
            console.error('Ошибка проверки OTP:', error);
            return { 
              success: false, 
              error: error.message 
            };
          }

          return { 
            success: true, 
            data 
          };
        } catch (error: any) {
          console.error('Ошибка verifyOtp:', error);
          return { 
            success: false, 
            error: error.message || 'Произошла неизвестная ошибка' 
          };
        }
      },

      updatePassword: async ({  newPassword }: UpdatePasswordParams): Promise<AuthResponse> => {
        try {


          // Если верификация прошла успешно, обновляем пароль
          const { data, error } = await supabase.auth.updateUser({
            password: newPassword
          });

          if (error) {
            console.error('Ошибка обновления пароля:', error);
            return { 
              success: false, 
              error: error.message 
            };
          }

          return { 
            success: true, 
            data 
          };
        } catch (error: any) {
          console.error('Ошибка updatePassword:', error);
          return { 
            success: false, 
            error: error.message || 'Произошла неизвестная ошибка' 
          };
        }
      },

      verifyResetCode: async (email: string, code: string) => {
        try {
    
          return { success: true };
        } catch (error: any) {
          return { success: false, error: error.message };
        }
      },



      updateUserProfile: async (updates: Partial<User>) => {
        const { user } = get();
        if (!user) return;

        try {
          const { error } = await supabase
            .from('profiles')
            .update({
              name: updates.name,
              avatar: updates.avatar,
              risk_profile: updates.riskProfile,
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);

          if (error) throw error;

          // Обновляем локальное состояние
          set((state) => ({
            user: state.user ? { ...state.user, ...updates } : null,
          }));
        } catch (error) {
          console.error('Ошибка при обновлении профиля:', error);
        }
      },

      // Цели
      setGoalFilter:(type) => set((state)=> { 
        return {
          currentGoalType: type
        }
       }),

      // Новые функции для работы с целями
      addGoal: (goalData: GoalFormData): string => {
        const state = get();
        const newGoal: Goal = {
          id: state.generateId(),
          ...goalData,
          progress:0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((prevState) => ({
          goals: [...prevState.goals, newGoal]
        }));

        return newGoal.id;
      },

      pickEditGoal: (id:string)=>{
        set((prevState) => ({
          currentGoalChangeId: id,
        }));
      },

      updateGoal: (id: string, goalData: Partial<GoalFormData>): boolean => {
        const { goals } = get();
        const goalIndex = goals.findIndex((goal: Goal) => goal.id === id);
        
        if (goalIndex === -1) {
          return false;
        }

        const updatedGoal: Goal = {
          ...goals[goalIndex],
          ...goalData,
          updatedAt: new Date(),
        };

        set((state) => ({
          goals: state.goals.map((goal: Goal, index: number) =>
            index === goalIndex ? updatedGoal : goal
          )
        }));

        return true;
      },

      deleteGoal: (id: string): boolean => {
        const { goals } = get();
        const goalExists = goals.some((goal: Goal) => goal.id === id);
        
        if (!goalExists) {
          return false;
        }

        set((state) => ({
          goals: state.goals.filter((goal: Goal) => goal.id !== id)
        }));

        return true;
      },

      getGoalById: (id: string): Goal | undefined => {
        const { goals } = get();
        return goals.find((goal: Goal) => goal.id === id);
      },

      getGoalsByType: (type: 'short' | 'medium' | 'long'): Goal[] => {
        const { goals } = get();
        return goals.filter((goal: Goal) => goal.type === type);
      },

      initializePersonalFinancialPlan: (userData?: Partial<PersonalFinancialPlan>): string => {
        const state = get();
        const newPFP = createDefaultPFP(state.generateId, {
          fio: state.user?.name || '',
          ...userData
        });

        set({
          personalFinancialPlan: newPFP
        });

        return newPFP.id;
      },

      updatePersonalFinancialPlan: (updates: Partial<PersonalFinancialPlan>): boolean => {
        const { personalFinancialPlan, generateId } = get();
        
        // Если ЛФП не существует, создаем новый
        if (!personalFinancialPlan) {
          const newPFP = createDefaultPFP(generateId, {
            ...updates,
            updatedAt: new Date()
          });
          
          set({
            personalFinancialPlan: newPFP
          });
          
          return true;
        }

        // Обновляем существующий ЛФП
        const updatedPFP: PersonalFinancialPlan = {
          ...personalFinancialPlan,
          ...updates,
          updatedAt: new Date(),
        };

        set({
          personalFinancialPlan: updatedPFP
        });

        return true;
      },

      resetPersonalFinancialPlan: () => {
        const { generateId, user } = get();
        const defaultPFP = createDefaultPFP(generateId, {
          fio: user?.name || '',
        });

        set({
          personalFinancialPlan: defaultPFP
        });
      },

      clearPersonalFinancialPlan: () => {
        set({
          personalFinancialPlan: null
        });
      },

      getPersonalFinancialPlan: (): PersonalFinancialPlan | null => {
        const { personalFinancialPlan } = get();
        return personalFinancialPlan;
      },

      // Финансы - Категории
      setCategories: (categories) => set({ categories }),

      addCategory: (categoryData) => set((state) => {
        const newCategory: FinancialCategory = {
          ...categoryData,
          id: state.generateId()
        };
        return {
          categories: [...state.categories, newCategory]
        };
      }),

      updateCategory: (categoryId, updates) => set((state) => ({
        categories: state.categories.map(category => 
          category.id === categoryId 
            ? { ...category, ...updates }
            : category
        )
      })),

      deleteCategory: (categoryId) => set((state) => ({
        categories: state.categories.filter(category => category.id !== categoryId)
      })),

      resetCategory:()=>set((state)=>({
        categories: initialCategories
      })),

      // Расходы
      addExpences: (expence) => set((state) => {
        const newExpence: Asset = {
          ...expence,
          id: state.generateId()
        };

        const newExpences = [...state.expences, newExpence];
        const totalAmount = newExpences.reduce((sum, asset) => sum + asset.amount, 0);

        const updatedCategories = state.categories.map(category => 
          category.id === 'expence' 
            ? {
                ...category,
                title: 'Расходы',
                balance: `${totalAmount} ₸`,
                items: newExpences.map(x => ({
                  id: x.id,
                  icon: x.icon || "bag",
                  name: x.name, 
                  amount: `${x.amount} ₸`, 
                  color: x?.color || "#E91E63"
                }))
              }
            : category
        );
        
        return {
          expences: newExpences,
          categories: updatedCategories
        };
      }),

      setCurrentAsset:(asset)=>set((state) => {
        let changed:Asset | null
        if(asset!==null){
          changed = {
          ...asset
        };
        }else{
          changed = null
        }
        

        return {
          currentAsset: changed
        };
      }),



      // Активы
      addActives: (active) => set((state) => {
        const newActive: Asset = {
          ...active,
          id: state.generateId()
        };

        const newActives = [...state.actives, newActive];
        
        return {
          actives: newActives
        };
      }),

      addPassives: (passive)=>set((state)=>{
        const newPassive: Asset = {
          ...passive,
          id: state.generateId()
        };

        const newPassives = [...state.passives, newPassive];
        
        return {
          passives: newPassives
        };
      }),

      // Доходы
      addIncomes: (income) => set((state) => {
        const newIncome: Asset = {
          ...income,
          id: state.generateId()
        };

        const newIncomes = [...state.incomes, newIncome];
        const totalAmount = newIncomes.reduce((sum, asset) => sum + asset.amount, 0);

        const updatedCategories = state.categories.map(category => 
          category.id === 'income' 
            ? {
                ...category,
                title: 'Доходы',
                balance: `${totalAmount} ₸`,
                items: newIncomes.map(x => ({
                  id: x.id,
                  icon: x.icon || "bag",
                  name: x.name, 
                  amount: `${x.amount} ₸`, 
                  color: x?.color || "#E91E63"
                }))
              }
            : category
        );
        
        return {
          incomes: newIncomes,
          categories: updatedCategories
        };
      }),

      // Обновление
      updateExpences: (id, expence) => set((state) => {
        const updatedExpences = state.expences.map(item =>
          item.id === id ? { ...item, ...expence } : item
        );
        
        const totalAmount = updatedExpences.reduce((sum, asset) => sum + asset.amount, 0);
        
        const updatedCategories = state.categories.map(category =>
          category.id === 'expense'
            ? {
                ...category,
                title: 'Расходы',
                balance: `${totalAmount} ₸`,
                items: updatedExpences.map(x => ({
                  id: x.id,
                  icon: x.icon || "bag",
                  name: x.name,
                  amount: `${x.amount} ₸`,
                  color: x?.color || "#F44336"
                }))
              }
            : category
        );
        
        return {
          expences: updatedExpences,
          categories: updatedCategories
        };
      }),

      updateIncomes: (id, income) => set((state) => {
        const updatedIncomes = state.incomes.map(item =>
          item.id === id ? { ...item, ...income } : item
        );
        
        const totalAmount = updatedIncomes.reduce((sum, asset) => sum + asset.amount, 0);
        
        const updatedCategories = state.categories.map(category =>
          category.id === 'income'
            ? {
                ...category,
                title: 'Доходы',
                balance: `${totalAmount} ₸`,
                items: updatedIncomes.map(x => ({
                  id: x.id,
                  icon: x.icon || "bag",
                  name: x.name,
                  amount: `${x.amount} ₸`,
                  color: x?.color || "#E91E63"
                }))
              }
            : category
        );
        
        return {
          incomes: updatedIncomes,
          categories: updatedCategories
        };
      }),

      updateActives: (id, active) => set((state) => {
        const updatedActives = state.actives.map(item =>
          item.id === id ? { ...item, ...active } : item
        );
        
        return {
          actives: updatedActives
        };
      }),

      updatePassives: (id, passive) => set((state) => {
        const updatedPassives = state.passives.map(item =>
          item.id === id ? { ...item, ...passive } : item
        );
        
        return {
          passives: updatedPassives
        };
      }),

      // Кошельки
      setWallets: (wallets) => set({ wallets }),

      addWallet: (walletData) => set((state) => {
        const newWallet: Wallet = {
          ...walletData,
          id: state.generateId()
        };
        
        return {
          wallets: [...state.wallets, newWallet]
        };
      }),

      updateWallet: (walletId, updates) => set((state) => ({
        wallets: state.wallets.map(wallet => 
          wallet.id === walletId 
            ? { ...wallet, ...updates }
            : wallet
        )
      })),

      // Финансы - Элементы
      addFinancialItem: (categoryId, itemData) => set((state) => {
        const newItem: FinancialItem = {
          ...itemData,
          id: state.generateId()
        };
        
        return {
          categories: state.categories.map(category => 
            category.id === categoryId 
              ? { ...category, items: [...category.items, newItem] }
              : category
          )
        };
      }),

      updateFinancialItem: (categoryId, itemId, updates) => set((state) => ({
        categories: state.categories.map(category => 
          category.id === categoryId 
            ? {
                ...category,
                items: category.items.map(item => 
                  item.id === itemId ? { ...item, ...updates } : item
                )
              }
            : category
        )
      })),

      deleteFinancialItem: (categoryId, itemId) => set((state) => ({
        categories: state.categories.map(category => 
          category.id === categoryId 
            ? {
                ...category,
                items: category.items.filter(item => item.id !== itemId)
              }
            : category
        )
      })),

      // Вычисления
      getTotalBalance: () => {
        const { categories } = get();
        return categories.reduce((total, category) => {
          const categoryTotal = category.items.reduce((sum, item) => {
            const amount = parseInt(item.amount.replace(/[^\d]/g, ''));
            return sum + (isNaN(amount) ? 0 : amount);
          }, 0);
          return total + categoryTotal;
        }, 0);
      },

      getCategoryBalance: (categoryId) => {
        const { categories } = get();
        const category = categories.find(cat => cat.id === categoryId);
        if (!category) return 0;
        
        return category.items.reduce((sum, item) => {
          const amount = parseInt(item.amount.replace(/[^\d]/g, ''));
          return sum + (isNaN(amount) ? 0 : amount);
        }, 0);
      },

      getWalletBalance: () => {
        const { wallets } = get();
        const filtered = wallets.filter(x => x.currency.includes('₸'));
        
        if (!filtered || filtered.length === 0) {
          set({ walletBalance: "0 ₸" });
          return;
        }
        
        const allSumm = wallets.reduce((sum, item) => {
          return sum + item.summ;
        }, 0);

        set({ walletBalance: `${allSumm} ₸` });
      },

      // Настройки
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setCurrency: (currency) => set({ currency }),

    }),
    {
      name: 'financial-app-storage',
      storage: createJSONStorage(() => ({
        getItem: async (name) => {
          try {
            return await AsyncStorage.getItem(name);
          } catch (error) {
            console.error('Error getting item from AsyncStorage:', error);
            return null;
          }
        },
        setItem: async (name, value) => {
          try {
            await AsyncStorage.setItem(name, value);
          } catch (error) {
            console.error('Error setting item to AsyncStorage:', error);
          }
        },
        removeItem: async (name) => {
          try {
            await AsyncStorage.removeItem(name);
          } catch (error) {
            console.error('Error removing item from AsyncStorage:', error);
          }
        }
      })),
      partialize: (state) => ({
        user: state.user,
        categories: state.categories,
        wallets: state.wallets,
        expences: state.expences,
        incomes: state.incomes,
        actives: state.actives,
        passives: state.passives,
        goals: state.goals,
        personalFinancialPlan: state.personalFinancialPlan, // Добавлено в persist
        theme: state.theme,
        language: state.language,
        currency: state.currency
      })
    }
  )
);

export const appStore = useFinancialStore;

// Селекторы для удобства
export const useUser = () => useFinancialStore((state) => state.user);
export const useAuth = () => useFinancialStore((state) => ({ 
  isAuthenticated: state.isAuthenticated, 
  isLoading: state.isLoading 
}));
export const useCategories = () => useFinancialStore((state) => state.categories);
export const useSettings = () => useFinancialStore((state) => ({ 
  theme: state.theme, 
  language: state.language, 
  currency: state.currency 
}));

// Селекторы для целей
export const useGoals = () => useFinancialStore((state) => state.goals);
export const useGoalActions = () => useFinancialStore((state) => ({
  addGoal: state.addGoal,
  updateGoal: state.updateGoal,
  deleteGoal: state.deleteGoal,
  getGoalById: state.getGoalById,
  getGoalsByType: state.getGoalsByType
}));

// Новые селекторы для ЛФП
export const usePersonalFinancialPlan = () => useFinancialStore((state) => state.personalFinancialPlan);
export const usePFPActions = () => useFinancialStore((state) => ({
  initializePersonalFinancialPlan: state.initializePersonalFinancialPlan,
  updatePersonalFinancialPlan: state.updatePersonalFinancialPlan,
  resetPersonalFinancialPlan: state.resetPersonalFinancialPlan,
  clearPersonalFinancialPlan: state.clearPersonalFinancialPlan,
  getPersonalFinancialPlan: state.getPersonalFinancialPlan
}));

// Хелпер функция для конвертации данных формы
export const convertFormDataToGoal = (
  formData: any,
  selectedDay: string,
  selectedMonth: string,
  selectedYear: string
): GoalFormData => {
  return {
    name: formData.name,
    type: formData.type,
    timeframe: {
      day: selectedDay,
      month: selectedMonth,
      year: selectedYear,
    },
    currency: formData.currency,
    amount: formData.amount,
    inflationRate: formData.inflationRate,
    returnRate: formData.returnRate,
    monthlyInvestment: formData.monthlyInvestment,
  };
};

export default useFinancialStore;