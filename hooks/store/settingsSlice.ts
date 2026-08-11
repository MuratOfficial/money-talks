import { AppState, SliceCreator } from './types';

type SettingsSlice = Pick<
  AppState,
  | 'theme'
  | 'language'
  | 'currency'
  | 'setTheme'
  | 'setLanguage'
  | 'setCurrency'
  | 'biometricEnabled'
  | 'setBiometricEnabled'
  | 'riskProfile'
  | 'setRiskProfile'
  | 'lastSyncHash'
  | 'setLastSyncHash'
  | 'currentCategoryOption'
  | 'currentRegOption'
  | 'setCategoryOption'
  | 'setRegOption'
  | 'generateId'
  | 'formatAmount'
>;

export const createSettingsSlice: SliceCreator<SettingsSlice> = (set, get) => ({
  theme: 'dark',
  language: 'ru',
  currency: '₸',

  setTheme: (theme) => set({ theme }),
  setLanguage: (language) => set({ language }),
  setCurrency: (currency) => set({ currency }),

  biometricEnabled: false,
  setBiometricEnabled: (enabled) => set({ biometricEnabled: enabled }),

  riskProfile: null,
  setRiskProfile: (profile) => set({ riskProfile: profile }),

  lastSyncHash: null,
  setLastSyncHash: (hash) => set({ lastSyncHash: hash }),

  // Фильтры
  currentCategoryOption: '',
  currentRegOption: 'regular',
  setCategoryOption: (opt) => set({ currentCategoryOption: opt }),
  setRegOption: (opt) => set({ currentRegOption: opt }),

  // Утилиты
  generateId: () => Date.now().toString() + Math.random().toString(36).substr(2, 9),

  formatAmount: (amount: number) => {
    const { currency } = get();
    return new Intl.NumberFormat('ru-RU').format(amount) + ' ' + currency;
  },
});
