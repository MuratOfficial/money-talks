// Мокаем supabase, чтобы импорт стора не требовал реального клиента/env
jest.mock('@/lib/supabase', () => ({ supabase: {} }));
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

import { useFinancialStore } from '@/hooks/useStore';

const reset = () => {
  useFinancialStore.setState({
    goals: [],
    expences: [],
    incomes: [],
    wallets: [],
  });
};

describe('addGoal', () => {
  beforeEach(reset);

  it('считает прогресс из collected/amount с учётом дробей', () => {
    const id = useFinancialStore.getState().addGoal({
      name: 'Цель',
      type: 'short',
      timeframe: { day: '1', month: 'Январь', year: '2030' },
      currency: 'KZT',
      amount: '1 000',
      collected: '250,5',
      inflationRate: '3',
      returnRate: '8',
      monthlyInvestment: '',
    });
    const goal = useFinancialStore.getState().getGoalById(id);
    expect(goal).toBeDefined();
    expect(goal!.progress).toBeCloseTo(25.05, 2);
  });
});

describe('addExpences', () => {
  beforeEach(reset);

  it('обновляет категорию с id "expence" (не "expense")', () => {
    useFinancialStore.getState().addExpences({
      name: 'Кофе',
      amount: 1500,
    });
    const expenceCat = useFinancialStore
      .getState()
      .categories.find((c) => c.id === 'expence');
    expect(expenceCat).toBeDefined();
    expect(expenceCat!.items.some((i) => i.name === 'Кофе')).toBe(true);
  });

  it('updateExpences отражает изменение в категории расходов', () => {
    useFinancialStore.getState().addExpences({ name: 'Кофе', amount: 1500 });
    const added = useFinancialStore.getState().expences[0];
    useFinancialStore.getState().updateExpences(added.id, { amount: 2000 });
    const cat = useFinancialStore
      .getState()
      .categories.find((c) => c.id === 'expence');
    expect(cat!.items.find((i) => i.id === added.id)?.amount).toBe('2000 ₸');
  });
});

describe('getWalletBalance', () => {
  beforeEach(reset);

  it('суммирует только тенговые кошельки в walletBalance', () => {
    useFinancialStore.setState({
      wallets: [
        { id: '1', name: 'A', type: 'cash', summ: 1000, currency: '₸' },
        { id: '2', name: 'B', type: 'cash', summ: 500, currency: '₸' },
        { id: '3', name: 'C', type: 'cash', summ: 999, currency: '$' },
      ],
    });
    useFinancialStore.getState().getWalletBalance();
    expect(useFinancialStore.getState().walletBalance).toBe('1500 ₸');
  });
});
