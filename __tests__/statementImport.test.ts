import {
  buildRows,
  categorize,
  recordName,
  summarize,
  toRecords,
  type StatementResult,
  type StatementTransaction,
} from '@/utils/statementImport';
import type { Asset } from '@/hooks/store/types';

const tx = (overrides: Partial<StatementTransaction>): StatementTransaction => ({
  date: '2026-08-02',
  amount: -1000,
  currency: 'KZT',
  description: '',
  operation: '',
  kind: 'purchase',
  ...overrides,
});

const statement = (transactions: StatementTransaction[]): StatementResult => ({
  bank: 'kaspi',
  bankName: 'Kaspi Bank',
  parser: 'kaspi',
  confidence: 'high',
  period: null,
  openingBalance: null,
  closingBalance: null,
  checks: [],
  transactions,
  warnings: [],
});

describe('categorize', () => {
  it('узнаёт магазины и сервисы Казахстана', () => {
    expect(categorize(tx({ description: 'MAGNUM CASH&CARRY' }))).toEqual({ kind: 'expence', category: 'food', subcategory: 'groceries' });
    expect(categorize(tx({ description: 'Yandex.Go' }))).toEqual({ kind: 'expence', category: 'transport', subcategory: 'taxi' });
    expect(categorize(tx({ description: 'GLOVO ALMATY' }))).toEqual({ kind: 'expence', category: 'food', subcategory: 'delivery' });
    expect(categorize(tx({ description: 'OPENAI *CHATGPT SUBSCR' }))).toMatchObject({ category: 'entertainment', subcategory: 'subscriptions' });
    expect(categorize(tx({ description: 'Kcell' }))).toMatchObject({ category: 'connection', subcategory: 'phone' });
  });

  it('не принимает «STUDENT» за стоматологию', () => {
    expect(categorize(tx({ description: 'STUDENT CARD' })).category).toBe('other');
  });

  it('комиссии банка — в «Кредиты · Банк / карта»', () => {
    expect(categorize(tx({ kind: 'fee', operation: 'Разное' }))).toEqual({ kind: 'expence', category: 'loans', subcategory: 'bank-fees' });
  });

  it('поступления: зарплата, кешбэк, перевод от человека', () => {
    expect(categorize(tx({ amount: 250000, kind: 'topup', description: 'Зачисление заработной платы' })).category).toBe('salary');
    expect(categorize(tx({ amount: 450, kind: 'topup', description: 'Кешбэк' })).category).toBe('cashback');
    expect(categorize(tx({ amount: 5000, kind: 'topup', description: 'Айгерим С.' }))).toEqual({
      kind: 'income',
      category: 'transfers',
      subcategory: 'card',
    });
  });
});

describe('recordName', () => {
  it('подписывает переводы людям', () => {
    expect(recordName(tx({ amount: -15000, kind: 'transfer', description: 'Айгерим С.' }))).toBe('Перевод: Айгерим С.');
    expect(recordName(tx({ amount: 15000, kind: 'topup', description: 'Айгерим С.' }))).toBe('Перевод от Айгерим С.');
  });

  it('обрезает длинные описания', () => {
    const name = recordName(tx({ description: 'Плата за услугу SMS-информирования по карте Kaspi Gold за август 2026 года' }));
    expect(name.length).toBeLessThanOrEqual(60);
    expect(name.endsWith('…')).toBe(true);
  });
});

describe('buildRows', () => {
  it('не отмечает переводы между своими счетами, возвраты, наличные и чужую валюту', () => {
    const rows = buildRows(
      statement([
        tx({ description: 'MAGNUM' }),
        tx({ kind: 'own_transfer', operation: 'Перевод на свой счет', amount: -294000 }),
        tx({ kind: 'refund', amount: 3400, description: 'KASPI.KZ MAGAZIN' }),
        tx({ kind: 'cash', amount: -20000, description: 'Банкомат' }),
        tx({ currency: 'USD', amount: -5 }),
      ]),
      { incomes: [], expences: [] },
      '₸'
    );
    expect(rows.map((row) => row.selected)).toEqual([true, false, false, false, false]);
    expect(rows[1].note).toContain('своими счетами');
    expect(rows[4].note).toContain('USD');
  });

  it('пополнение с карты другого банка по умолчанию не считает доходом', () => {
    const rows = buildRows(statement([tx({ kind: 'topup', amount: 750000, description: 'С карты другого банка' })]), { incomes: [], expences: [] }, '₸');
    expect(rows[0]).toMatchObject({ selected: false, note: 'Если это ваша карта в другом банке — это не доход' });
  });

  it('помечает вероятный дубль уже внесённой записи', () => {
    const existing = [{ id: '1', name: 'Magnum', amount: 11470.08, createdAt: new Date(2026, 7, 2, 18, 30) } as Asset];
    const rows = buildRows(statement([tx({ amount: -11470.08, description: 'MAGNUM' })]), { incomes: [], expences: existing }, '₸');
    expect(rows[0]).toMatchObject({ selected: false, note: 'Похоже, эта операция уже есть в приложении' });
  });
});

describe('toRecords', () => {
  it('сохраняет дату операции и раскладывает по доходам и расходам', () => {
    const rows = buildRows(
      statement([
        tx({ date: '2026-08-02', amount: -11470.08, description: 'MAGNUM' }),
        tx({ date: '2026-08-05', amount: 250000, kind: 'topup', description: 'Зачисление заработной платы' }),
      ]),
      { incomes: [], expences: [] },
      '₸'
    );
    const { incomes, expences } = toRecords(rows);

    expect(expences).toHaveLength(1);
    expect(expences[0]).toMatchObject({ amount: 11470.08, category: 'food', subcategory: 'groceries', categoryTab: 'required', regularity: 'irregular' });
    expect((expences[0].createdAt as Date).getDate()).toBe(2);
    expect((expences[0].createdAt as Date).getMonth()).toBe(7);

    expect(incomes[0]).toMatchObject({ amount: 250000, category: 'salary', categoryTab: 'active', regularity: 'regular' });
    expect(summarize(rows)).toEqual({ count: 2, income: 250000, expense: 11470.08 });
  });
});
