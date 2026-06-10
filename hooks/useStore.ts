import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { secureStorage } from '@/lib/secureStorage';

import { AppState, GoalFormData } from './store/types';
import { createAuthSlice } from './store/authSlice';
import { createSettingsSlice } from './store/settingsSlice';
import { createFinanceSlice } from './store/financeSlice';
import { createGoalsSlice } from './store/goalsSlice';
import { createPfpSlice } from './store/pfpSlice';

// Реэкспорт типов для обратной совместимости (импорты вида `import { Asset } from '@/hooks/useStore'`)
export type {
  Goal,
  AuthResponse,
  VerifyOtpParams,
  UpdatePasswordParams,
  GoalFormData,
  FinancialItem,
  FinancialCategory,
  User,
  Wallet,
  Asset,
  PersonalFinancialPlan,
  AppState,
} from './store/types';

/**
 * Единый стор приложения, собранный из логических слайсов:
 * auth, settings (+ фильтры/утилиты), finance, goals, pfp.
 * Форма состояния и persist полностью совместимы с прежней реализацией.
 */
export const useFinancialStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...createSettingsSlice(set, get),
      ...createAuthSlice(set, get),
      ...createFinanceSlice(set, get),
      ...createGoalsSlice(set, get),
      ...createPfpSlice(set, get),
    }),
    {
      name: 'financial-app-storage',
      // Шифрованное хранилище: данные лежат в AsyncStorage в зашифрованном виде,
      // ключ — в Keychain/Keystore через expo-secure-store. См. lib/secureStorage.
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        user: state.user,
        categories: state.categories,
        wallets: state.wallets,
        expences: state.expences,
        incomes: state.incomes,
        actives: state.actives,
        passives: state.passives,
        goals: state.goals,
        personalFinancialPlan: state.personalFinancialPlan,
        theme: state.theme,
        language: state.language,
        currency: state.currency,
        biometricEnabled: state.biometricEnabled,
        lastSyncHash: state.lastSyncHash,
      }),
    }
  )
);

export const appStore = useFinancialStore;

// Селекторы для удобства
export const useUser = () => useFinancialStore((state) => state.user);
export const useAuth = () =>
  useFinancialStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
  }));
export const useCategories = () => useFinancialStore((state) => state.categories);
export const useSettings = () =>
  useFinancialStore((state) => ({
    theme: state.theme,
    language: state.language,
    currency: state.currency,
  }));

export const useGoals = () => useFinancialStore((state) => state.goals);
export const useGoalActions = () =>
  useFinancialStore((state) => ({
    addGoal: state.addGoal,
    updateGoal: state.updateGoal,
    deleteGoal: state.deleteGoal,
    getGoalById: state.getGoalById,
    getGoalsByType: state.getGoalsByType,
  }));

export const usePersonalFinancialPlan = () =>
  useFinancialStore((state) => state.personalFinancialPlan);
export const usePFPActions = () =>
  useFinancialStore((state) => ({
    initializePersonalFinancialPlan: state.initializePersonalFinancialPlan,
    updatePersonalFinancialPlan: state.updatePersonalFinancialPlan,
    resetPersonalFinancialPlan: state.resetPersonalFinancialPlan,
    clearPersonalFinancialPlan: state.clearPersonalFinancialPlan,
    getPersonalFinancialPlan: state.getPersonalFinancialPlan,
  }));

// Хелпер для конвертации данных формы цели
export const convertFormDataToGoal = (
  formData: any,
  selectedDay: string,
  selectedMonth: string,
  selectedYear: string
): GoalFormData => ({
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
});

export default useFinancialStore;
