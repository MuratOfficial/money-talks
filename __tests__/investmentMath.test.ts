import { growthMultiplier, simulateContributions } from '@/utils/investmentMath';

describe('simulateContributions', () => {
  it('без доходности портфель равен вложенному', () => {
    const result = simulateContributions({ monthly: 50_000, years: 3, annualRatePercent: 0 });
    expect(result.invested).toBe(1_800_000);
    expect(result.value).toBe(1_800_000);
    expect(result.profit).toBe(0);
  });

  it('считает точку на каждый год плюс нулевую', () => {
    const result = simulateContributions({ monthly: 10_000, years: 5, annualRatePercent: 10 });
    expect(result.points).toHaveLength(6);
    expect(result.points[0]).toEqual({ year: 0, invested: 0, value: 0 });
    expect(result.points[5].value).toBe(result.value);
  });

  it('доходность увеличивает портфель сверх вложенного', () => {
    const result = simulateContributions({ monthly: 50_000, years: 10, annualRatePercent: 12 });
    expect(result.invested).toBe(6_000_000);
    expect(result.value).toBeGreaterThan(result.invested);
    expect(result.profit).toBe(result.value - result.invested);
  });

  it('учитывает стартовую сумму', () => {
    const withStart = simulateContributions({ monthly: 0, years: 1, annualRatePercent: 12, initial: 1_000_000 });
    // 12% годовых с ежемесячной капитализацией дают чуть больше 12%.
    expect(withStart.value).toBe(1_126_825);
    expect(withStart.invested).toBe(1_000_000);
  });

  it('отрицательные и дробные вводы не ломают расчёт', () => {
    const result = simulateContributions({ monthly: -100, years: 2.7, annualRatePercent: 10 });
    expect(result.invested).toBe(0);
    expect(result.value).toBe(0);
    // 2.7 года — это два полных года точек плюс нулевая.
    expect(result.points).toHaveLength(3);
  });
});

describe('growthMultiplier', () => {
  it('показывает, во сколько раз выросли вложения', () => {
    const result = simulateContributions({ monthly: 50_000, years: 20, annualRatePercent: 12 });
    expect(growthMultiplier(result)).toBeGreaterThan(2);
  });

  it('без вложений сравнивать нечего', () => {
    expect(growthMultiplier(simulateContributions({ monthly: 0, years: 5, annualRatePercent: 10 }))).toBeNull();
  });
});
