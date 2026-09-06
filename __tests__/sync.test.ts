import { hasSyncableData } from '@/constants/sync';
import { initialCategories } from '@/hooks/store/initialData';

/**
 * Состояние стора сразу после установки и после выхода из аккаунта:
 * пользовательских данных нет, но categories заполнены стартовым набором.
 */
const freshState = () => ({
  categories: initialCategories,
  wallets: [],
  expences: [],
  incomes: [],
  actives: [],
  passives: [],
  goals: [],
  personalFinancialPlan: null,
});

describe('hasSyncableData', () => {
  it('не считает данными стартовое состояние (иначе вход затирает сервер)', () => {
    // Регрессия: categories со стартовым набором учитывались как данные
    // пользователя, useSync решал, что на устройстве есть несинхронизированные
    // правки, и отправлял пустышку на сервер поверх реальных данных.
    expect(hasSyncableData(freshState())).toBe(false);
  });

  it('видит данные, если пользователь добавил кошелёк', () => {
    expect(hasSyncableData({ ...freshState(), wallets: [{ id: '1' }] })).toBe(true);
  });

  it('видит данные, если пользователь добавил цель', () => {
    expect(hasSyncableData({ ...freshState(), goals: [{ id: '1' }] })).toBe(true);
  });

  it('видит данные, если пользователь заполнил ЛФП', () => {
    expect(hasSyncableData({ ...freshState(), personalFinancialPlan: { id: '1' } })).toBe(true);
  });

  it('видит изменённые категории, но не стартовые', () => {
    const custom = [...initialCategories, { id: 'own', title: 'Своя', items: [] }];
    expect(hasSyncableData({ ...freshState(), categories: custom })).toBe(true);
  });

  it('пустые категории тоже считает изменением', () => {
    expect(hasSyncableData({ ...freshState(), categories: [] })).toBe(true);
  });
});
