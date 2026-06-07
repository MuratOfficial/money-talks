import { AppState, Goal, GoalFormData, SliceCreator } from './types';
import { parseStoredAmount } from './initialData';

type GoalsSlice = Pick<
  AppState,
  | 'goals'
  | 'currentGoalType'
  | 'currentGoalChangeId'
  | 'setGoalFilter'
  | 'pickEditGoal'
  | 'addGoal'
  | 'updateGoal'
  | 'deleteGoal'
  | 'getGoalById'
  | 'getGoalsByType'
>;

const calcProgress = (amount: number, collected: number): number =>
  amount > 0 ? (collected / amount) * 100 : 0;

export const createGoalsSlice: SliceCreator<GoalsSlice> = (set, get) => ({
  goals: [],
  currentGoalType: 'Краткосрочные',
  currentGoalChangeId: '',

  setGoalFilter: (type) => set({ currentGoalType: type }),

  pickEditGoal: (id: string) => set({ currentGoalChangeId: id }),

  addGoal: (goalData: GoalFormData): string => {
    const state = get();
    const amount = parseStoredAmount(goalData.amount);
    const collected = parseStoredAmount(goalData.collected || '0');

    const newGoal: Goal = {
      id: state.generateId(),
      ...goalData,
      progress: calcProgress(amount, collected),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    set((prevState) => ({ goals: [...prevState.goals, newGoal] }));
    return newGoal.id;
  },

  updateGoal: (id: string, goalData: Partial<GoalFormData>): boolean => {
    const { goals } = get();
    const goalIndex = goals.findIndex((goal: Goal) => goal.id === id);
    if (goalIndex === -1) return false;

    const currentGoal = goals[goalIndex];
    const amountStr = goalData.amount !== undefined ? goalData.amount : currentGoal.amount;
    const collectedStr =
      goalData.collected !== undefined ? goalData.collected : currentGoal.collected || '0';

    const amount = parseStoredAmount(amountStr);
    const collected = parseStoredAmount(collectedStr);

    const updatedGoal: Goal = {
      ...currentGoal,
      ...goalData,
      progress: calcProgress(amount, collected),
      updatedAt: new Date(),
    };

    set((state) => ({
      goals: state.goals.map((goal: Goal, index: number) =>
        index === goalIndex ? updatedGoal : goal
      ),
    }));

    return true;
  },

  deleteGoal: (id: string): boolean => {
    const { goals } = get();
    if (!goals.some((goal: Goal) => goal.id === id)) return false;

    set((state) => ({ goals: state.goals.filter((goal: Goal) => goal.id !== id) }));
    return true;
  },

  getGoalById: (id: string): Goal | undefined => get().goals.find((goal: Goal) => goal.id === id),

  getGoalsByType: (type: 'short' | 'medium' | 'long'): Goal[] =>
    get().goals.filter((goal: Goal) => goal.type === type),
});
