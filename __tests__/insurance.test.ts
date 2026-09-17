import { ageFromBirthDate, computeInsurancePlan } from '@/utils/insurance';
import type { Asset, PersonalFinancialPlan } from '@/hooks/store/types';

const now = new Date(2026, 8, 17);

const plan = (fields: Partial<PersonalFinancialPlan> = {}): PersonalFinancialPlan => ({
  id: 'p',
  fio: '',
  birthDate: { day: '10', month: 'Октябрь', year: '1990' },
  activity: '',
  financialDependents: '0',
  securityPillow: '',
  insurance: { life: '0', disability: '0', medical: '0' },
  riskProfile: '',
  createdAt: now,
  updatedAt: now,
  ...fields,
});

const asset = (amount: number): Asset => ({ id: String(amount), name: 'a', amount });
const rec = (p: ReturnType<typeof computeInsurancePlan>, kind: string) => p.recommendations.find((r) => r.kind === kind)!;

describe('ageFromBirthDate', () => {
  it('учитывает, был ли уже день рождения в этом году', () => {
    expect(ageFromBirthDate({ day: '10', month: 'Октябрь', year: '1990' }, now)).toBe(35);
    expect(ageFromBirthDate({ day: '10', month: 'Сентябрь', year: '1990' }, now)).toBe(36);
  });

  it('без выбранного года — null', () => {
    expect(ageFromBirthDate({ day: 'День', month: 'Месяц', year: 'Год' }, now)).toBeNull();
  });
});

describe('computeInsurancePlan', () => {
  const base = { monthlyIncome: 500_000, monthlyExpense: 300_000, actives: [], passives: [], now };

  it('срок страхования — до 82 лет', () => {
    const p = computeInsurancePlan({ ...base, plan: plan() });
    expect(p).toMatchObject({ age: 35, yearsLeft: 47 });
  });

  it('жизнь: 5 лет дохода + год на зависимого (не больше 10) + долги', () => {
    const passives = [asset(2_000_000)];
    expect(rec(computeInsurancePlan({ ...base, passives, plan: plan({ financialDependents: '2' }) }), 'life').recommended).toBe(
      6_000_000 * 7 + 2_000_000
    );
    expect(rec(computeInsurancePlan({ ...base, plan: plan({ financialDependents: '9' }) }), 'life').recommended).toBe(6_000_000 * 10);
    expect(rec(computeInsurancePlan({ ...base, passives, plan: plan() }), 'life').recommended).toBe(2_000_000);
  });

  it('близко к 82 годам срок защиты сокращается', () => {
    const p = computeInsurancePlan({ ...base, plan: plan({ birthDate: { day: '1', month: 'Январь', year: '1946' }, financialDependents: '3' }) });
    expect(p.yearsLeft).toBe(2);
    expect(rec(p, 'life').recommended).toBe(6_000_000 * 2);
    expect(rec(p, 'disability').recommended).toBe(6_000_000 * 2);
  });

  it('покрытие считается по введённым суммам, в том числе с пробелами и валютой', () => {
    const p = computeInsurancePlan({ ...base, plan: plan({ insurance: { life: '0', disability: '15 000 000 ₸', medical: '1800000' } }) });
    expect(rec(p, 'disability').coverage).toBe(50);
    expect(rec(p, 'medical')).toMatchObject({ recommended: 1_800_000, coverage: 100 });
  });

  it('подсказки ФинГида по ситуации', () => {
    const hints = computeInsurancePlan({
      ...base,
      plan: plan({ financialDependents: '1' }),
      actives: [asset(20_000_000)],
      passives: [asset(1_000_000)],
    }).hints;
    expect(hints.join('\n')).toMatch(/нет активной защиты/);
    expect(hints.join('\n')).toMatch(/зависит от тебя/);
    expect(hints.join('\n')).toMatch(/оставить долги близким/);
    expect(hints.join('\n')).toMatch(/активы требуют защиты/);
  });
});
