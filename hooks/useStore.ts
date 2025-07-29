import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Типы данных
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
  avatar?: string;
  riskProfile?: 'conservative' | 'moderate' | 'aggressive';
}

export interface Wallet {
    id:string;
    name:string;
    type: string;
    summ: number;
    currency: string;
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
  totalBalance: string;
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
  
  // Действия с настройками
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: 'ru' | 'en' | 'kz') => void;
  setCurrency: (currency: '₸' | '$' | '€') => void;
  
  // Утилиты
  formatAmount: (amount: number) => string;
  generateId: () => string;
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
  {id:'expence',
      title: 'Расходы',
      balance: '79 500 ₸',
      items: [
        {id:'payments', name: 'Покупки', amount: '40 000 ₸', color: '#4FC3F7', icon: 'bag' },
        {id:'education', name: 'Образование', amount: '8 000 ₸', color: '#66BB6A', icon: 'school' },
        {id:'tech', name: 'Техника', amount: '6 000 ₸', color: '#E91E63', icon: 'phone-portrait' },
        { name: 'Развлечения', amount: '1 300 ₸', color: '#FF9800', icon: 'game-controller', id:'entertainment' }
      ]
    },
];

// Создание Zustand Store с персистентностью
export const useFinancialStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Начальное состояние
      user: null,
      isAuthenticated: false,
      isLoading: false,
      categories: initialCategories,
      totalBalance: '1 990 000 ₸',
      theme: 'dark',
      language: 'ru',
      currency: '₸',
        wallets:[],
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

      // Wallet

      setWallets: (wallets) => set({ wallets }),

      addWallet: (walletData) => set((state) => {
        const newwallet: Wallet = {
          ...walletData,
          id: state.generateId()
        };
        
        return {
          wallets: [...state.wallets, newwallet]
        };
      }),

      updateWallet: (walletId, updates) => set((state) => ({
        categories: state.categories.map(wallet => 
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

      // Настройки
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setCurrency: (currency) => set({ currency })
    }),
    {
      name: 'financial-app-storage', // имя в storage
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          // В React Native используйте AsyncStorage
          // import AsyncStorage from '@react-native-async-storage/async-storage';
          // return AsyncStorage.getItem(name);
          
          // Для примера используем localStorage (только для веб)
          return localStorage.getItem(name);
        },
        setItem: (name, value) => {
          // return AsyncStorage.setItem(name, value);
          localStorage.setItem(name, value);
        },
        removeItem: (name) => {
          // return AsyncStorage.removeItem(name);
          localStorage.removeItem(name);
        }
      })),
      partialize: (state) => ({
        user: state.user,
        categories: state.categories,
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

// // Пример использования в компоненте
// export const FinancialDashboard: React.FC = () => {
//   const { 
//     categories, 
//     addFinancialItem, 
//     updateFinancialItem, 
//     deleteFinancialItem,
//     getTotalBalance,
//     formatAmount 
//   } = useFinancialStore();

//   const handleAddItem = () => {
//     addFinancialItem('wallet', {
//       name: 'Новый счет',
//       amount: '50 000 ₸',
//       color: '#4FC3F7',
//       icon: 'card'
//     });
//   };

//   const handleUpdateItem = (categoryId: string, itemId: string) => {
//     updateFinancialItem(categoryId, itemId, {
//       amount: '100 000 ₸'
//     });
//   };

//   const totalBalance = getTotalBalance();

//   return (
//     <View className="p-4">
//       <Text className="text-white text-xl mb-4">
//         Общий баланс: {formatAmount(totalBalance)}
//       </Text>
      
//       {categories.map((category) => (
//         <View key={category.id} className="mb-6">
//           <Text className="text-white text-lg font-bold mb-2">
//             {category.title} - {category.balance}
//           </Text>
          
//           {category.items.map((item) => (
//             <View key={item.id} className="flex-row justify-between p-3 bg-gray-800 rounded mb-2">
//               <Text className="text-white">{item.name}</Text>
//               <Text className="text-white">{item.amount}</Text>
//             </View>
//           ))}
//         </View>
//       ))}
      
//       <TouchableOpacity 
//         onPress={handleAddItem}
//         className="bg-green-600 p-3 rounded"
//       >
//         <Text className="text-white text-center">Добавить счет</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

export default useFinancialStore;