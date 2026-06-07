import { AppState, PersonalFinancialPlan, SliceCreator } from './types';
import { createDefaultPFP } from './initialData';

type PfpSlice = Pick<
  AppState,
  | 'personalFinancialPlan'
  | 'initializePersonalFinancialPlan'
  | 'updatePersonalFinancialPlan'
  | 'resetPersonalFinancialPlan'
  | 'clearPersonalFinancialPlan'
  | 'getPersonalFinancialPlan'
>;

export const createPfpSlice: SliceCreator<PfpSlice> = (set, get) => ({
  personalFinancialPlan: null,

  initializePersonalFinancialPlan: (userData?: Partial<PersonalFinancialPlan>): string => {
    const state = get();
    const newPFP = createDefaultPFP(state.generateId, {
      fio: state.user?.name || '',
      ...userData,
    });

    set({ personalFinancialPlan: newPFP });
    return newPFP.id;
  },

  updatePersonalFinancialPlan: (updates: Partial<PersonalFinancialPlan>): boolean => {
    const { personalFinancialPlan, generateId } = get();

    if (!personalFinancialPlan) {
      const newPFP = createDefaultPFP(generateId, { ...updates, updatedAt: new Date() });
      set({ personalFinancialPlan: newPFP });
      return true;
    }

    const updatedPFP: PersonalFinancialPlan = {
      ...personalFinancialPlan,
      ...updates,
      updatedAt: new Date(),
    };

    set({ personalFinancialPlan: updatedPFP });
    return true;
  },

  resetPersonalFinancialPlan: () => {
    const { generateId, user } = get();
    const defaultPFP = createDefaultPFP(generateId, { fio: user?.name || '' });
    set({ personalFinancialPlan: defaultPFP });
  },

  clearPersonalFinancialPlan: () => set({ personalFinancialPlan: null }),

  getPersonalFinancialPlan: (): PersonalFinancialPlan | null => get().personalFinancialPlan,
});
