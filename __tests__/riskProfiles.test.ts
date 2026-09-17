import { RISK_PROFILES, allocationText, riskProfileByPercentage } from '@/constants/riskProfiles';

describe('riskProfileByPercentage', () => {
  it('делит шкалу на пять профилей из ТЗ', () => {
    expect(RISK_PROFILES.map((p) => p.title)).toEqual([
      'Консервативный',
      'Умеренно-консервативный',
      'Умеренный',
      'Умеренно-агрессивный',
      'Агрессивный',
    ]);
    expect([0, 19, 20, 39, 40, 59, 60, 79, 80, 100].map((p) => riskProfileByPercentage(p).title)).toEqual([
      'Консервативный',
      'Консервативный',
      'Умеренно-консервативный',
      'Умеренно-консервативный',
      'Умеренный',
      'Умеренный',
      'Умеренно-агрессивный',
      'Умеренно-агрессивный',
      'Агрессивный',
      'Агрессивный',
    ]);
  });

  it('не падает на мусоре', () => {
    expect(riskProfileByPercentage(NaN).title).toBe('Консервативный');
    expect(riskProfileByPercentage(250).title).toBe('Агрессивный');
  });

  it('распределение как в таблице ТЗ', () => {
    expect(allocationText(RISK_PROFILES[0])).toBe('80% — депозиты, облигации, НСЖ; 20% — индексные ETF, золото');
  });
});
