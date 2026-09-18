// Кризисные сценарии ЛФП из ТЗ: «предложить варианты поведения в кризисной
// ситуации (падение дохода, потеря работы)» и «возможность вносить сценарии
// („если доход упадёт на 20%“)».
//
// Считаем только по тем данным, которые пользователь уже внёс: доходы,
// расходы, деньги на счетах и платежи по пассивам. Ничего не спрашиваем
// дополнительно — иначе блок останется пустым у большинства.

import type { Asset, Wallet } from '@/hooks/store/types';
import { getCurrencyRatio } from '@/hooks/pdf/pdfCalculations';

export interface CrisisInput {
  /** Доход в месяц. */
  monthlyIncome: number;
  /** Все расходы в месяц. */
  monthlyExpense: number;
  /** Обязательные (регулярные) расходы — их в кризис не срезать. */
  requiredExpense: number;
  /** Деньги на счетах: то, что можно потратить завтра. */
  liquidSavings: number;
  /** Ежемесячные платежи по пассивам (кредиты, рассрочки). */
  monthlyDebtPayment: number;
}

export type ScenarioId = 'income-20' | 'income-50' | 'job-loss' | 'expenses-15';

export interface CrisisScenario {
  id: ScenarioId;
  /** Короткая подпись для чипа. */
  title: string;
  /** Что именно произошло — одной строкой. */
  description: string;
  /** Во что превращается доход: 0.8 — падение на 20%. */
  incomeFactor: number;
  /** Во что превращаются расходы: 1.15 — рост на 15%. */
  expenseFactor: number;
}

export const CRISIS_SCENARIOS: CrisisScenario[] = [
  {
    id: 'income-20',
    title: 'Доход −20%',
    description: 'Премии нет, часть заказов ушла — доход упал на пятую часть.',
    incomeFactor: 0.8,
    expenseFactor: 1,
  },
  {
    id: 'income-50',
    title: 'Доход −50%',
    description: 'Доход упал вдвое: сокращённая ставка или долгий простой.',
    incomeFactor: 0.5,
    expenseFactor: 1,
  },
  {
    id: 'job-loss',
    title: 'Потеря работы',
    description: 'Дохода нет совсем — живём только на накопления.',
    incomeFactor: 0,
    expenseFactor: 1,
  },
  {
    id: 'expenses-15',
    title: 'Расходы +15%',
    description: 'Инфляция и рост цен: расходы выросли на 15%.',
    incomeFactor: 1,
    expenseFactor: 1.15,
  },
];

export type ResilienceLevel = 'danger' | 'warning' | 'safe';

export interface ScenarioResult {
  scenario: CrisisScenario;
  /** Доход в этом сценарии. */
  income: number;
  /** Расходы в этом сценарии. */
  expense: number;
  /** Доход минус расходы; отрицательная — проедаем накопления. */
  delta: number;
  /** Сколько не хватает каждый месяц (0, если дельта неотрицательная). */
  gap: number;
  /**
   * На сколько месяцев хватит денег на счетах.
   * null — дефицита нет, накопления не расходуются.
   */
  monthsCovered: number | null;
  level: ResilienceLevel;
  /** Одна строка о положении дел. */
  summary: string;
}

const round1 = (value: number) => Math.round(value * 10) / 10;

/** «2,4» вместо «2.4»: в русском тексте разделитель — запятая. */
export const formatMonths = (value: number): string => String(value).replace('.', ',');

/** Ниже 3 месяцев — красная зона, 3–6 — жёлтая, дальше зелёная. */
export function resilienceLevel(monthsCovered: number | null): ResilienceLevel {
  if (monthsCovered === null) return 'safe';
  if (monthsCovered < 3) return 'danger';
  if (monthsCovered < 6) return 'warning';
  return 'safe';
}

export const LEVEL_COLORS: Record<ResilienceLevel, string> = {
  danger: '#EF4444',
  warning: '#F59E0B',
  safe: '#4CAF50',
};

export function evaluateScenario(input: CrisisInput, scenario: CrisisScenario): ScenarioResult {
  // Округляем до целых: доли тиына в документе и на экране не нужны, а без
  // округления множители вроде 1.15 дают «459999.99999999994».
  const income = Math.round(Math.max(0, input.monthlyIncome * scenario.incomeFactor));
  const expense = Math.round(Math.max(0, input.monthlyExpense * scenario.expenseFactor));
  const delta = income - expense;
  const gap = Math.max(0, -delta);
  // Дефицита нет — накопления не трогаем, и срок «до нуля» не считается.
  const monthsCovered = gap > 0 ? round1(input.liquidSavings / gap) : null;
  const level = resilienceLevel(monthsCovered);

  const summary =
    monthsCovered === null
      ? 'Дохода хватает: накопления не расходуются.'
      : monthsCovered >= 1
        ? `Накоплений хватит на ${formatMonths(monthsCovered)} мес. такой жизни.`
        : 'Накоплений не хватит даже на месяц.';

  return { scenario, income, expense, delta, gap, monthsCovered, level, summary };
}

export function evaluateAllScenarios(input: CrisisInput): ScenarioResult[] {
  return CRISIS_SCENARIOS.map((scenario) => evaluateScenario(input, scenario));
}

export interface CrisisStrategy {
  id: string;
  title: string;
  detail: string;
}

/** Сколько месяцев продержимся, если дефицит станет меньше на `saved`. */
function monthsWithSaving(input: CrisisInput, result: ScenarioResult, saved: number): number | null {
  const gap = Math.max(0, result.gap - saved);
  return gap > 0 ? round1(input.liquidSavings / gap) : null;
}

/**
 * Альтернативные стратегии на правилах: что конкретно сделать, чтобы
 * продержаться дольше. Суммы форматирует вызывающий код (в приложении —
 * formatAmount из стора, в PDF — свой форматтер).
 */
export function buildStrategies(
  input: CrisisInput,
  result: ScenarioResult,
  formatAmount: (value: number) => string
): CrisisStrategy[] {
  const strategies: CrisisStrategy[] = [];
  const optional = Math.max(0, input.monthlyExpense - input.requiredExpense);

  // 1. Срезать необязательные траты — самый быстрый рычаг.
  if (result.gap > 0 && optional > 0) {
    const saved = optional / 2;
    const after = monthsWithSaving(input, result, saved);
    strategies.push({
      id: 'cut-optional',
      title: 'Сократите необязательные траты вдвое',
      detail:
        after === null
          ? `Необязательных трат на ${formatAmount(optional)} в месяц. Срезав половину (${formatAmount(saved)}), вы закрываете дефицит полностью.`
          : `Необязательных трат на ${formatAmount(optional)} в месяц. Срезав половину (${formatAmount(saved)}), вы растянете накопления с ${formatMonths(result.monthsCovered ?? 0)} до ${formatMonths(after)} мес.`,
    });
  }

  // 2. Обязательные расходы не режутся — значит нужен доход.
  if (result.gap > 0) {
    const target = Math.max(0, result.gap - input.liquidSavings / 6);
    strategies.push({
      id: 'extra-income',
      title: 'Найдите дополнительный доход',
      detail:
        target > 0
          ? `Подработка на ${formatAmount(target)} в месяц растянет накопления минимум на полгода — этого обычно хватает на поиск работы.`
          : 'Даже небольшая подработка полностью закроет дефицит в этом сценарии.',
    });
  }

  // 3. Долговая нагрузка: платежи по пассивам съедают доход в кризис особенно больно.
  if (input.monthlyDebtPayment > 0 && result.income > 0) {
    const share = Math.round((input.monthlyDebtPayment / result.income) * 100);
    if (share >= 20) {
      strategies.push({
        id: 'refinance',
        title: 'Пересоберите долги',
        detail: `В этом сценарии платежи по пассивам забирают ${share}% дохода (${formatAmount(input.monthlyDebtPayment)} в месяц). Рефинансирование или досрочное погашение самого дорогого кредита освободит эти деньги.`,
      });
    }
  }

  // 4. Подушка: целимся в 6 месяцев обязательных расходов.
  const cushionTarget = input.requiredExpense * 6;
  if (input.requiredExpense > 0 && input.liquidSavings < cushionTarget) {
    strategies.push({
      id: 'cushion',
      title: 'Доведите подушку до 6 месяцев',
      detail: `Обязательные расходы — ${formatAmount(input.requiredExpense)} в месяц, значит подушка должна быть ${formatAmount(cushionTarget)}. Не хватает ${formatAmount(cushionTarget - input.liquidSavings)}. Пополняйте её раньше, чем инвестируете.`,
    });
  }

  // 5. Страховка закрывает то, что не закрывают накопления.
  if (result.level !== 'safe') {
    strategies.push({
      id: 'insurance',
      title: 'Проверьте страховую защиту',
      detail:
        'Потеря дохода из-за болезни или травмы — единственный кризис, который закрывается не накоплениями, а полисом. Суммы рассчитаны в блоке «Защита жизни, здоровья и капитала» выше.',
    });
  }

  return strategies;
}

const sum = (items: Asset[], field: 'amount' | 'additional' = 'amount') =>
  items.reduce((total, item) => total + (Number(item[field]) || 0), 0);

/**
 * Собирает входные данные сценариев из стора.
 * Суммы на счетах приводятся к валюте приложения — иначе доллары и тенге
 * сложились бы как одинаковые числа.
 */
export function buildCrisisInput({
  incomes,
  expences,
  passives,
  wallets,
  currency = '₸',
}: {
  incomes: Asset[];
  expences: Asset[];
  passives: Asset[];
  wallets: Wallet[];
  currency?: string;
}): CrisisInput {
  const ratio = getCurrencyRatio(currency).kzt;
  const liquidSavings = wallets
    .filter((w) => !w.excludeFromBalance)
    .reduce((total, w) => total + ((Number(w.summ) || 0) * getCurrencyRatio(w.currency).kzt) / ratio, 0);

  return {
    monthlyIncome: sum(incomes),
    monthlyExpense: sum(expences),
    requiredExpense: sum(expences.filter((item) => item.regularity === 'regular')),
    liquidSavings,
    // В пассивах `additional` — расход за год (как в «Финансовом здоровье»).
    monthlyDebtPayment: sum(passives, 'additional') / 12,
  };
}

/** Хватает ли данных, чтобы блок имел смысл. */
export function hasCrisisData(input: CrisisInput): boolean {
  return input.monthlyIncome > 0 || input.monthlyExpense > 0;
}
