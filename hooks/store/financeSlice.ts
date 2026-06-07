import { AppState, Asset, FinancialCategory, FinancialItem, SliceCreator, Wallet } from './types';
import { initialCategories, parseStoredAmount } from './initialData';

type FinanceSlice = Pick<
  AppState,
  | 'categories'
  | 'expences'
  | 'incomes'
  | 'actives'
  | 'passives'
  | 'currentAsset'
  | 'totalBalance'
  | 'walletBalance'
  | 'walletBalanceUSD'
  | 'walletBalanceEUR'
  | 'wallets'
  | 'currentEditWalletId'
  | 'setCategories'
  | 'addCategory'
  | 'updateCategory'
  | 'deleteCategory'
  | 'resetCategory'
  | 'setWallets'
  | 'addWallet'
  | 'updateWallet'
  | 'deleteWallet'
  | 'pickEditWallet'
  | 'getWalletById'
  | 'addFinancialItem'
  | 'updateFinancialItem'
  | 'deleteFinancialItem'
  | 'getTotalBalance'
  | 'getCategoryBalance'
  | 'getWalletBalance'
  | 'addExpences'
  | 'addIncomes'
  | 'addActives'
  | 'addPassives'
  | 'updateExpences'
  | 'updateIncomes'
  | 'updateActives'
  | 'updatePassives'
  | 'setCurrentAsset'
>;

/** Преобразует список ассетов в элементы категории */
const assetsToItems = (assets: Asset[], fallbackColor: string): FinancialItem[] =>
  assets.map((x) => ({
    id: x.id,
    icon: x.icon || 'bag',
    name: x.name,
    amount: `${x.amount} ₸`,
    color: x?.color || fallbackColor,
  }));

export const createFinanceSlice: SliceCreator<FinanceSlice> = (set, get) => ({
  categories: initialCategories,
  expences: [],
  incomes: [],
  actives: [],
  passives: [],
  currentAsset: null,
  totalBalance: '1 990 000 ₸',
  walletBalance: '0 ₸',
  walletBalanceEUR: '0 $',
  walletBalanceUSD: '0 €',
  wallets: [],
  currentEditWalletId: '',

  // Категории
  setCategories: (categories) => set({ categories }),

  addCategory: (categoryData) =>
    set((state) => ({
      categories: [...state.categories, { ...categoryData, id: state.generateId() }],
    })),

  updateCategory: (categoryId, updates) =>
    set((state) => ({
      categories: state.categories.map((category) =>
        category.id === categoryId ? { ...category, ...updates } : category
      ),
    })),

  deleteCategory: (categoryId) =>
    set((state) => ({
      categories: state.categories.filter((category) => category.id !== categoryId),
    })),

  resetCategory: () => set({ categories: initialCategories }),

  // Расходы
  addExpences: (expence) =>
    set((state) => {
      const newExpence: Asset = { ...expence, id: state.generateId(), createdAt: new Date() };
      const newExpences = [...state.expences, newExpence];
      const totalAmount = newExpences.reduce((sum, asset) => sum + asset.amount, 0);

      const updatedCategories = state.categories.map((category) =>
        category.id === 'expence'
          ? {
              ...category,
              title: 'Расходы',
              balance: `${totalAmount} ₸`,
              items: assetsToItems(newExpences, '#E91E63'),
            }
          : category
      );

      return { expences: newExpences, categories: updatedCategories };
    }),

  setCurrentAsset: (asset) => set({ currentAsset: asset ? { ...asset } : null }),

  // Активы
  addActives: (active) =>
    set((state) => ({
      actives: [...state.actives, { ...active, id: state.generateId(), createdAt: new Date() }],
    })),

  // Пассивы
  addPassives: (passive) =>
    set((state) => ({
      passives: [...state.passives, { ...passive, id: state.generateId(), createdAt: new Date() }],
    })),

  // Доходы
  addIncomes: (income) =>
    set((state) => {
      const newIncome: Asset = { ...income, id: state.generateId(), createdAt: new Date() };
      const newIncomes = [...state.incomes, newIncome];
      const totalAmount = newIncomes.reduce((sum, asset) => sum + asset.amount, 0);

      const updatedCategories = state.categories.map((category) =>
        category.id === 'income'
          ? {
              ...category,
              title: 'Доходы',
              balance: `${totalAmount} ₸`,
              items: assetsToItems(newIncomes, '#E91E63'),
            }
          : category
      );

      return { incomes: newIncomes, categories: updatedCategories };
    }),

  // Обновление
  updateExpences: (id, expence) =>
    set((state) => {
      const updatedExpences = state.expences.map((item) =>
        item.id === id ? { ...item, ...expence } : item
      );
      const totalAmount = updatedExpences.reduce((sum, asset) => sum + asset.amount, 0);

      const updatedCategories = state.categories.map((category) =>
        category.id === 'expence'
          ? {
              ...category,
              title: 'Расходы',
              balance: `${totalAmount} ₸`,
              items: assetsToItems(updatedExpences, '#F44336'),
            }
          : category
      );

      return { expences: updatedExpences, categories: updatedCategories };
    }),

  updateIncomes: (id, income) =>
    set((state) => {
      const updatedIncomes = state.incomes.map((item) =>
        item.id === id ? { ...item, ...income } : item
      );
      const totalAmount = updatedIncomes.reduce((sum, asset) => sum + asset.amount, 0);

      const updatedCategories = state.categories.map((category) =>
        category.id === 'income'
          ? {
              ...category,
              title: 'Доходы',
              balance: `${totalAmount} ₸`,
              items: assetsToItems(updatedIncomes, '#E91E63'),
            }
          : category
      );

      return { incomes: updatedIncomes, categories: updatedCategories };
    }),

  updateActives: (id, active) =>
    set((state) => ({
      actives: state.actives.map((item) => (item.id === id ? { ...item, ...active } : item)),
    })),

  updatePassives: (id, passive) =>
    set((state) => ({
      passives: state.passives.map((item) => (item.id === id ? { ...item, ...passive } : item)),
    })),

  // Кошельки
  setWallets: (wallets) => set({ wallets }),

  addWallet: (walletData) =>
    set((state) => ({
      wallets: [...state.wallets, { ...walletData, id: state.generateId() }],
    })),

  updateWallet: (walletId, updates) =>
    set((state) => ({
      wallets: state.wallets.map((wallet) =>
        wallet.id === walletId ? { ...wallet, ...updates } : wallet
      ),
    })),

  deleteWallet: (id: string) =>
    set((state) => ({ wallets: state.wallets.filter((wallet) => wallet.id !== id) })),

  pickEditWallet: (id: string) => set({ currentEditWalletId: id }),

  getWalletById: (id: string): Wallet | undefined => get().wallets.find((wallet) => wallet.id === id),

  // Элементы категорий
  addFinancialItem: (categoryId, itemData) =>
    set((state) => ({
      categories: state.categories.map((category) =>
        category.id === categoryId
          ? { ...category, items: [...category.items, { ...itemData, id: state.generateId() }] }
          : category
      ),
    })),

  updateFinancialItem: (categoryId, itemId, updates) =>
    set((state) => ({
      categories: state.categories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              items: category.items.map((item) =>
                item.id === itemId ? { ...item, ...updates } : item
              ),
            }
          : category
      ),
    })),

  deleteFinancialItem: (categoryId, itemId) =>
    set((state) => ({
      categories: state.categories.map((category) =>
        category.id === categoryId
          ? { ...category, items: category.items.filter((item) => item.id !== itemId) }
          : category
      ),
    })),

  // Вычисления
  getTotalBalance: () =>
    get().categories.reduce(
      (total, category) =>
        total +
        category.items.reduce((sum, item) => sum + parseStoredAmount(item.amount), 0),
      0
    ),

  getCategoryBalance: (categoryId) => {
    const category = get().categories.find((cat) => cat.id === categoryId);
    if (!category) return 0;
    return category.items.reduce((sum, item) => sum + parseStoredAmount(item.amount), 0);
  },

  getWalletBalance: () => {
    const { wallets } = get();
    const sumBy = (predicate: (w: Wallet) => boolean) =>
      wallets.filter(predicate).reduce((sum, item) => sum + item.summ, 0);

    const allSumm = sumBy((x) => x.currency.includes('₸'));
    const allSummUSD = sumBy((x) => x.currency.includes('$'));
    const allSummEUR = sumBy((x) => x.currency.includes('€'));

    set({
      walletBalance: `${allSumm} ₸`,
      walletBalanceUSD: `${allSummUSD} $`,
      walletBalanceEUR: `${allSummEUR} €`,
    });
  },
});
