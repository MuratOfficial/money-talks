import { FinancialCategory, PersonalFinancialPlan } from './types';

export const initialCategories: FinancialCategory[] = [
  {
    id: 'income',
    title: 'Доходы',
    balance: '1 050 000 ₸',
    items: [
      { id: 'salary', name: 'Зарплата', amount: '600 000 ₸', color: '#4FC3F7', icon: 'wallet' },
      { id: 'bank-income', name: 'Банк', amount: '50 000 ₸', color: '#66BB6A', icon: 'business' },
      { id: 'crypto', name: 'Криптовалюта', amount: '200 000 ₸', color: '#7986CB', icon: 'logo-bitcoin' },
      { id: 'pension-income', name: 'Пенсия', amount: '200 000 ₸', color: '#FFB74D', icon: 'card' },
    ],
  },
  {
    id: 'expence',
    title: 'Расходы',
    balance: '79 500 ₸',
    items: [
      { id: 'payments', name: 'Покупки', amount: '40 000 ₸', color: '#4FC3F7', icon: 'bag' },
      { id: 'education', name: 'Образование', amount: '8 000 ₸', color: '#66BB6A', icon: 'school' },
      { id: 'tech', name: 'Техника', amount: '6 000 ₸', color: '#E91E63', icon: 'phone-portrait' },
      { id: 'entertainment', name: 'Развлечения', amount: '1 300 ₸', color: '#FF9800', icon: 'game-controller' },
    ],
  },
];

// Функция для создания дефолтного ЛФП
export const createDefaultPFP = (
  generateId: () => string,
  userData?: Partial<PersonalFinancialPlan>
): PersonalFinancialPlan => ({
  id: generateId(),
  fio: '',
  birthDate: { day: 'День', month: 'Месяц', year: 'Год' },
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
  ...userData,
});

/** Парсит строку суммы в число, сохраняя дробную часть */
export const parseStoredAmount = (str: string | undefined): number => {
  if (!str) return 0;
  const cleanStr = str.toString().replace(/[^\d.,]/g, '').replace(',', '.');
  return parseFloat(cleanStr) || 0;
};
