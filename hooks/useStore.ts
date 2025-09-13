import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  icon?: string;
  color?: string;
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

  // Настройки
  theme: 'light' | 'dark';
  language: 'ru' | 'en' | 'kz';
  currency: '₸' | '$' | '€';
  
  // Действия с пользователем
  setUser: (user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  updateUserProfile: (updates: Partial<User>) => void;
  
  // Действия с финансами
  setCategories: (categories: FinancialCategory[]) => void;
  addCategory: (category: Omit<FinancialCategory, 'id'>) => void;
  updateCategory: (categoryId: string, updates: Partial<FinancialCategory>) => void;
  deleteCategory: (categoryId: string) => void;

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

  // Действия с настройками
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: 'ru' | 'en' | 'kz') => void;
  setCurrency: (currency: '₸' | '$' | '€') => void;

  // Редактирование ассета
  setCurrentAsset: (asset: Asset) => void;
  
  // Утилиты
  formatAmount: (amount: number) => string;
  generateId: () => string;

  // Цели
  setGoalFilter: (type: string) => void;
  pickEditGoal: (id:string) => void;
  addGoal: (goalData: GoalFormData) => string; // returns new goal id
  updateGoal: (id: string, goalData: Partial<GoalFormData>) => boolean;
  deleteGoal: (id: string) => boolean;
  getGoalById: (id: string) => Goal | undefined;
  getGoalsByType: (type: 'short' | 'medium' | 'long') => Goal[];
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

// Создание Zustand Store с персистентностью
export const useFinancialStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Начальное состояние
      user: {name:"Uknown", password:"password", email:"user12@gamil.com", id:"initial"},
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
      goals: [], // Добавлено состояние для целей
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

      updateUserProfile: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null
      })),

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

      // Расходы
      addExpences: (expence) => set((state) => {
        const newExpence: Asset = {
          ...expence,
          id: state.generateId()
        };

        const newExpences = [...state.expences, newExpence];
        const totalAmount = newExpences.reduce((sum, asset) => sum + asset.amount, 0);

        // ИСПРАВЛЕНИЕ: Обновляем категорию через прямое изменение state
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

      // Редактирование текущего ассета
      setCurrentAsset:(asset)=>set((state) => {
        const changed: Asset = {
          ...asset
        };

 
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
        goals: state.goals, // Добавлено в persist
        theme: state.theme,
        language: state.language,
        currency: state.currency
      })
    }
  )
);

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

// Новые селекторы для целей
export const useGoals = () => useFinancialStore((state) => state.goals);
export const useGoalActions = () => useFinancialStore((state) => ({
  addGoal: state.addGoal,
  updateGoal: state.updateGoal,
  deleteGoal: state.deleteGoal,
  getGoalById: state.getGoalById,
  getGoalsByType: state.getGoalsByType
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