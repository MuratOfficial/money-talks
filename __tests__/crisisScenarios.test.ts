import {
  CRISIS_SCENARIOS,
  CrisisInput,
  buildStrategies,
  evaluateScenario,
  hasCrisisData,
  resilienceLevel,
} from '@/utils/crisisScenarios';

const scenario = (id: string) => CRISIS_SCENARIOS.find((s) => s.id === id)!;

const base: CrisisInput = {
  monthlyIncome: 500_000,
  monthlyExpense: 400_000,
  requiredExpense: 300_000,
  liquidSavings: 900_000,
  monthlyDebtPayment: 0,
};

const money = (value: number) => `${Math.round(value)} ₸`;

describe('evaluateScenario', () => {
  it('при падении дохода на 20% дефицита ещё нет', () => {
    const result = evaluateScenario(base, scenario('income-20'));
    expect(result.income).toBe(400_000);
    expect(result.delta).toBe(0);
    expect(result.gap).toBe(0);
    expect(result.monthsCovered).toBeNull();
    expect(result.level).toBe('safe');
  });

  it('при падении дохода вдвое считает, на сколько хватит накоплений', () => {
    const result = evaluateScenario(base, scenario('income-50'));
    // 250 000 дохода против 400 000 расходов — дефицит 150 000 в месяц.
    expect(result.gap).toBe(150_000);
    expect(result.monthsCovered).toBe(6);
    expect(result.level).toBe('safe');
  });

  it('при потере работы доход обнуляется', () => {
    const result = evaluateScenario(base, scenario('job-loss'));
    expect(result.income).toBe(0);
    expect(result.gap).toBe(400_000);
    expect(result.monthsCovered).toBe(2.3);
    expect(result.level).toBe('danger');
    expect(result.summary).toContain('2,3');
  });

  it('рост расходов на 15% учитывается в расходах, а не в доходе', () => {
    const result = evaluateScenario(base, scenario('expenses-15'));
    expect(result.income).toBe(500_000);
    expect(result.expense).toBe(460_000);
    expect(result.monthsCovered).toBeNull();
  });

  it('без накоплений сообщает, что не хватит и на месяц', () => {
    const result = evaluateScenario({ ...base, liquidSavings: 0 }, scenario('job-loss'));
    expect(result.monthsCovered).toBe(0);
    expect(result.summary).toContain('даже на месяц');
  });
});

describe('resilienceLevel', () => {
  it('делит шкалу по трём и шести месяцам', () => {
    expect(resilienceLevel(2.9)).toBe('danger');
    expect(resilienceLevel(3)).toBe('warning');
    expect(resilienceLevel(5.9)).toBe('warning');
    expect(resilienceLevel(6)).toBe('safe');
    expect(resilienceLevel(null)).toBe('safe');
  });
});

describe('buildStrategies', () => {
  it('предлагает срезать необязательные траты и считает новый срок', () => {
    const result = evaluateScenario(base, scenario('job-loss'));
    const cut = buildStrategies(base, result, money).find((s) => s.id === 'cut-optional')!;
    // Необязательных 100 000, срезаем половину → дефицит 350 000, хватит на 2.6 мес.
    expect(cut.detail).toContain('2,6');
  });

  it('не предлагает резать траты, если необязательных нет', () => {
    const tight: CrisisInput = { ...base, requiredExpense: base.monthlyExpense };
    const result = evaluateScenario(tight, scenario('job-loss'));
    expect(buildStrategies(tight, result, money).some((s) => s.id === 'cut-optional')).toBe(false);
  });

  it('говорит о долгах только при заметной нагрузке', () => {
    const withDebt: CrisisInput = { ...base, monthlyDebtPayment: 120_000 };
    const result = evaluateScenario(withDebt, scenario('income-50'));
    const debt = buildStrategies(withDebt, result, money).find((s) => s.id === 'refinance');
    // 120 000 от 250 000 дохода — 48%.
    expect(debt?.detail).toContain('48%');

    const light: CrisisInput = { ...base, monthlyDebtPayment: 10_000 };
    const lightResult = evaluateScenario(light, scenario('income-50'));
    expect(buildStrategies(light, lightResult, money).some((s) => s.id === 'refinance')).toBe(false);
  });

  it('не советует копить подушку, когда она уже собрана', () => {
    const rich: CrisisInput = { ...base, liquidSavings: 300_000 * 6 };
    const result = evaluateScenario(rich, scenario('income-20'));
    expect(buildStrategies(rich, result, money).some((s) => s.id === 'cushion')).toBe(false);
  });

  it('в спокойном сценарии не пугает страховкой', () => {
    const result = evaluateScenario(base, scenario('income-20'));
    expect(buildStrategies(base, result, money).some((s) => s.id === 'insurance')).toBe(false);
  });
});

describe('hasCrisisData', () => {
  it('пустой профиль блок не показывает', () => {
    expect(hasCrisisData({ monthlyIncome: 0, monthlyExpense: 0, requiredExpense: 0, liquidSavings: 0, monthlyDebtPayment: 0 })).toBe(false);
    expect(hasCrisisData(base)).toBe(true);
  });
});
