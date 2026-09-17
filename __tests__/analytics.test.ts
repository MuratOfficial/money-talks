import {
  buildPeriods,
  buildTrends,
  forecastGoals,
  negativeDeltaTwoMonths,
  percentChange,
  sumByPeriod,
  totalAtPeriodEnd,
} from '@/utils/analytics';
import type { Asset, Goal } from '@/hooks/store/types';

const now = new Date(2026, 8, 17); // 17 сентября 2026
let seq = 0;
const rec = (amount: number, createdAt?: Date): Asset => ({ id: String(seq++), name: 'x', amount, createdAt });

describe('buildPeriods', () => {
  it('месяцы от старых к новым, заканчивая текущим', () => {
    expect(buildPeriods('month', 3, now).map((p) => p.label)).toEqual(['июл', 'авг', 'сен']);
  });

  it('кварталы переходят через год', () => {
    const q = buildPeriods('quarter', 4, now);
    expect(q.map((p) => p.label)).toEqual(['4 кв 25', '1 кв 26', '2 кв 26', '3 кв 26']);
    expect(q[3].start).toEqual(new Date(2026, 6, 1));
    expect(q[3].end).toEqual(new Date(2026, 9, 1));
  });
});

describe('суммы по периодам', () => {
  const periods = buildPeriods('month', 3, now);

  it('потоки считаются внутри периода, записи без даты пропускаются', () => {
    expect(sumByPeriod([rec(10, new Date(2026, 6, 31, 23)), rec(5, new Date(2026, 7, 1)), rec(99)], periods)).toEqual([10, 5, 0]);
  });

  it('активы и пассивы накапливаются, записи без даты есть всегда', () => {
    expect(totalAtPeriodEnd([rec(100, new Date(2026, 7, 10)), rec(1)], periods)).toEqual([1, 101, 101]);
  });

  it('дельта и чистый капитал', () => {
    const t = buildTrends(
      {
        incomes: [rec(1000, new Date(2026, 8, 1))],
        expences: [rec(400, new Date(2026, 8, 2))],
        actives: [rec(5000, new Date(2026, 3, 1))],
        passives: [rec(2000, new Date(2026, 8, 5))],
      },
      'month',
      now
    );
    expect(t.deltas.at(-1)).toBe(600);
    expect(t.netCapital.slice(-2)).toEqual([5000, 3000]);
  });
});

describe('percentChange', () => {
  it('без базы не считает', () => {
    expect(percentChange(120, 100)).toBe(20);
    expect(percentChange(5, 0)).toBeNull();
  });
});

describe('negativeDeltaTwoMonths', () => {
  it('тревога только если минус оба завершённых месяца', () => {
    const july = new Date(2026, 6, 10);
    const aug = new Date(2026, 7, 10);
    expect(negativeDeltaTwoMonths({ incomes: [rec(100, july), rec(100, aug)], expences: [rec(150, july), rec(120, aug)] }, now)).toBe(true);
    expect(negativeDeltaTwoMonths({ incomes: [rec(100, july), rec(200, aug)], expences: [rec(150, july), rec(120, aug)] }, now)).toBe(false);
    expect(negativeDeltaTwoMonths({ incomes: [], expences: [] }, now)).toBe(false);
  });
});

describe('forecastGoals', () => {
  const goal = (fields: Partial<Goal>) => ({ id: 'g', name: 'Цель', progress: 10, currency: 'KZT', ...fields }) as Goal;
  const data = {
    // июнь, июль, август: дельта 100 000 в среднем
    incomes: [rec(300_000, new Date(2026, 5, 5)), rec(300_000, new Date(2026, 6, 5)), rec(300_000, new Date(2026, 7, 5))],
    expences: [rec(200_000, new Date(2026, 5, 6)), rec(200_000, new Date(2026, 6, 6)), rec(200_000, new Date(2026, 7, 6))],
  };

  it('делит остаток на среднюю дельту трёх завершённых месяцев', () => {
    const { averageDelta, forecasts } = forecastGoals([goal({ amount: '1 000 000', collected: '250000' })], data, '₸', now);
    expect(averageDelta).toBe(100_000);
    expect(forecasts[0]).toMatchObject({ remaining: 750_000, months: 8 });
  });

  it('переводит цель в долларах в тенге', () => {
    const { forecasts } = forecastGoals([goal({ amount: '1000', collected: '0', currency: 'USD' })], data, '₸', now);
    expect(forecasts[0]).toMatchObject({ remaining: 470_000, months: 5 });
  });

  it('при неположительной дельте цель не достигается, завершённые цели пропускаются', () => {
    const { forecasts } = forecastGoals(
      [goal({ amount: '1000', collected: '0' }), goal({ id: 'done', progress: 100, amount: '1', collected: '1' })],
      { incomes: [], expences: [rec(10, new Date(2026, 7, 1))] },
      '₸',
      now
    );
    expect(forecasts).toHaveLength(1);
    expect(forecasts[0].months).toBeNull();
  });
});
