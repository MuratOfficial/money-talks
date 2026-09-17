// Калькулятор страховой защиты для ЛФП (ТЗ: «Интеграция темы страхования в
// раздел ЛФП»). По ТЗ страхование доступно до 82 лет включительно — это срок
// полиса. Сумм в ТЗ нет, поэтому используются распространённые ориентиры:
//   • уход из жизни — годовой доход × (5 лет + 1 год на каждого зависимого,
//     но не больше 10 лет) + долги, чтобы они не легли на близких;
//     без зависимых — только долги;
//   • инвалидность — 5 годовых доходов (замена дохода);
//   • больничный лист — 6 месяцев расходов.

import type { Asset, PersonalFinancialPlan } from '@/hooks/store/types';
import { monthNameToIndex } from '@/hooks/pdf/pdfCalculations';

export const MAX_INSURED_AGE = 82;

export type InsuranceKind = 'life' | 'disability' | 'medical';

export interface InsuranceRecommendation {
  kind: InsuranceKind;
  recommended: number;
  current: number;
  /** Доля рекомендуемой суммы, которая уже покрыта, 0–100. */
  coverage: number;
  /** Как получено число — показываем пользователю. */
  explanation: string;
}

export interface InsurancePlan {
  age: number | null;
  /** Сколько лет ещё можно быть застрахованным (до 82 лет включительно). */
  yearsLeft: number | null;
  recommendations: InsuranceRecommendation[];
  /** Подсказки ФинГида из ТЗ по ситуации пользователя. */
  hints: string[];
}

export interface InsuranceInput {
  plan: PersonalFinancialPlan | null;
  monthlyIncome: number;
  monthlyExpense: number;
  actives: Asset[];
  passives: Asset[];
  now?: Date;
}

/** Возраст по дате рождения из ЛФП; null, если дата не выбрана. */
export function ageFromBirthDate(birthDate: PersonalFinancialPlan['birthDate'] | undefined, now = new Date()): number | null {
  const year = parseInt(birthDate?.year ?? '', 10);
  if (isNaN(year)) return null;
  const month = birthDate?.month && birthDate.month !== 'Месяц' ? monthNameToIndex(birthDate.month) : 0;
  const day = parseInt(birthDate?.day ?? '', 10) || 1;

  let age = now.getFullYear() - year;
  if (now.getMonth() < month || (now.getMonth() === month && now.getDate() < day)) age--;
  return age >= 0 && age < 130 ? age : null;
}

/** «1 200 000» / «1 200 000 ₸» → 1200000 */
const parseSum = (value: string | undefined) => Number(String(value ?? '').replace(/[^\d.,]/g, '').replace(',', '.')) || 0;

const total = (records: Asset[]) => records.reduce((s, r) => s + (Number(r.amount) || 0), 0);

export const ASSETS_NEED_PROTECTION = 10_000_000;

export function computeInsurancePlan({ plan, monthlyIncome, monthlyExpense, actives, passives, now = new Date() }: InsuranceInput): InsurancePlan {
  const age = ageFromBirthDate(plan?.birthDate, now);
  const yearsLeft = age === null ? null : Math.max(0, MAX_INSURED_AGE - age);
  const dependents = Math.max(0, parseInt(plan?.financialDependents ?? '', 10) || 0);
  const annualIncome = monthlyIncome * 12;
  const debts = total(passives);
  const assets = total(actives);

  const coverage = (current: number, recommended: number) =>
    recommended > 0 ? Math.min(100, Math.round((current / recommended) * 100)) : current > 0 ? 100 : 0;

  // Защищаем не дольше, чем человек может быть застрахован.
  const incomeYears = dependents > 0 ? Math.min(10, 5 + dependents) : 0;
  const lifeYears = yearsLeft === null ? incomeYears : Math.min(incomeYears, yearsLeft);
  const disabilityYears = yearsLeft === null ? 5 : Math.min(5, yearsLeft);

  const life = annualIncome * lifeYears + debts;
  const disability = annualIncome * disabilityYears;
  const medical = monthlyExpense * 6;

  const current = {
    life: parseSum(plan?.insurance?.life),
    disability: parseSum(plan?.insurance?.disability),
    medical: parseSum(plan?.insurance?.medical),
  };

  const recommendations: InsuranceRecommendation[] = [
    {
      kind: 'life',
      recommended: Math.round(life),
      current: current.life,
      coverage: coverage(current.life, life),
      explanation:
        dependents > 0
          ? `Доход за ${lifeYears} ${lifeYears === 1 ? 'год' : lifeYears < 5 ? 'года' : 'лет'} для ${dependents} ${dependents === 1 ? 'зависимого' : 'зависимых'}${debts > 0 ? ' + долги' : ''}`
          : debts > 0
            ? 'Долги, чтобы они не перешли к близким'
            : 'Без зависимых и долгов страхование жизни не обязательно',
    },
    {
      kind: 'disability',
      recommended: Math.round(disability),
      current: current.disability,
      coverage: coverage(current.disability, disability),
      explanation: `Доход за ${disabilityYears} ${disabilityYears === 1 ? 'год' : disabilityYears < 5 ? 'года' : 'лет'} на случай потери трудоспособности`,
    },
    {
      kind: 'medical',
      recommended: Math.round(medical),
      current: current.medical,
      coverage: coverage(current.medical, medical),
      explanation: 'Расходы за 6 месяцев на время болезни',
    },
  ];

  const hasAnyPolicy = current.life + current.disability + current.medical > 0;
  const hints: string[] = [];
  if (yearsLeft === 0) {
    hints.push(`Страхование доступно до ${MAX_INSURED_AGE} лет — пересмотрите защиту капитала другими инструментами.`);
  }
  if (!hasAnyPolicy) {
    hints.push('У тебя пока нет активной защиты жизни и доходов. Это значит, что при форс-мажоре твои цели окажутся под угрозой.');
  }
  if (dependents > 0) {
    hints.push('У тебя есть те, кто зависит от тебя. Обеспечь их защитой — оформи страхование жизни.');
  }
  if (debts > 0 && current.life === 0) {
    hints.push('Ты рискуешь оставить долги близким. Накопительное страхование поможет обезопасить семью.');
  }
  if (assets > debts && assets > 0) {
    hints.push(
      assets > ASSETS_NEED_PROTECTION && !hasAnyPolicy
        ? 'Твои активы требуют защиты. Страхование капитала — это не опция, а необходимость.'
        : 'Ты уже формируешь капитал. Защити его от непредвиденных событий — добавь страховку.'
    );
  }

  return { age, yearsLeft, recommendations, hints };
}
