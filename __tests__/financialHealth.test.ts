import { computeFinancialHealth, levelForScore, weakestHint } from '@/utils/financialHealth';
import type { Asset, Goal, Wallet } from '@/hooks/store/types';

const now = new Date(2026, 8, 17, 12);
const daysAgo = (n: number) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000);

let seq = 0;
const rec = (amount: number, createdAt: Date = daysAgo(1), extra: Partial<Asset> = {}): Asset => ({
  id: String(seq++),
  name: 'x',
  amount,
  createdAt,
  ...extra,
});
const wallet = (summ: number, currency = '₸', extra: Partial<Wallet> = {}): Wallet => ({
  id: String(seq++),
  name: 'w',
  type: 'card',
  summ,
  currency,
  ...extra,
});

const base = { incomes: [], expences: [], passives: [], wallets: [], goals: [], currency: '₸', now };
const part = (h: ReturnType<typeof computeFinancialHealth>, id: string) => h.components.find((c) => c.id === id)!;

describe('computeFinancialHealth', () => {
  it('без данных — новичок, но пассивов нет и за них не штрафуем', () => {
    const h = computeFinancialHealth(base);
    expect(h.score).toBe(20);
    expect(h.level.title).toBe('Новичок');
    expect(part(h, 'budget').advice).toMatch(/доходы и расходы/);
  });

  it('бюджет: 20% дельты и больше — максимум, минус — ноль', () => {
    expect(part(computeFinancialHealth({ ...base, incomes: [rec(1000)], expences: [rec(800)] }), 'budget').points).toBe(30);
    expect(part(computeFinancialHealth({ ...base, incomes: [rec(1000)], expences: [rec(1200)] }), 'budget').points).toBe(0);
    expect(part(computeFinancialHealth({ ...base, incomes: [rec(1000)], expences: [rec(900)] }), 'budget').points).toBe(18);
  });

  it('подушка считает счета в долларах в тенге и не учитывает скрытые счета', () => {
    const h = computeFinancialHealth({
      ...base,
      expences: [rec(100_000)],
      // 1 000 $ × 470 = 470 000 ₸ → 4,7 мес.; скрытые 10 млн не считаются
      wallets: [wallet(1000, '$'), wallet(10_000_000, '₸', { excludeFromBalance: true })],
    });
    expect(part(h, 'cushion')).toMatchObject({ points: 20, summary: 'Хватит на 4.7 мес. расходов' });
  });

  it('долговая нагрузка: годовой расход на пассивы делится на 12', () => {
    const passives = [rec(5_000_000, daysAgo(100), { additional: 1_200_000 })]; // 100 000 в месяц
    expect(part(computeFinancialHealth({ ...base, incomes: [rec(1_000_000)], passives }), 'debt').points).toBe(20);
    expect(part(computeFinancialHealth({ ...base, incomes: [rec(400_000)], passives }), 'debt').points).toBe(17);
    expect(part(computeFinancialHealth({ ...base, incomes: [rec(150_000)], passives }), 'debt').points).toBe(0);
  });

  it('берёт все записи, если за последние 30 дней ничего нет', () => {
    const h = computeFinancialHealth({ ...base, incomes: [rec(1000, daysAgo(90))], expences: [rec(700, daysAgo(90))] });
    expect(part(h, 'budget').summary).toBe('Дельта 30% дохода');
    expect(part(h, 'tracking').points).toBe(0);
  });

  it('цели и учёт', () => {
    const goals = [{ id: 'g', progress: 10, analysis: { whys: ['1', '2', '3', '4', '5'] } } as unknown as Goal];
    const h = computeFinancialHealth({ ...base, goals, expences: [rec(1, daysAgo(3))] });
    expect(part(h, 'goals').points).toBe(15);
    expect(part(h, 'tracking').points).toBe(10);
  });
});

describe('levelForScore', () => {
  it('границы уровней', () => {
    expect([0, 39, 40, 69, 70, 89, 90, 100].map((s) => levelForScore(s).title)).toEqual([
      'Новичок', 'Новичок', 'Ученик', 'Ученик', 'Эксперт', 'Эксперт', 'Финансовый гуру', 'Финансовый гуру',
    ]);
  });
});

describe('weakestHint', () => {
  it('подсказывает по самому слабому блоку', () => {
    const h = computeFinancialHealth({ ...base, incomes: [rec(1000)], expences: [rec(1200)], goals: [] });
    expect(weakestHint(h)).toMatch(/^У тебя низкий балл по блоку «Контроль бюджета»/);
  });
});
