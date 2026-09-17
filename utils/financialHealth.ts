// «Финансовое здоровье» из ТЗ: балл 0–100, цветовая градация, уровни и
// чек-лист «Как улучшить». Формула в ТЗ не задана — ниже пять понятных
// составляющих с весами; каждая даёт совет, если набрала не максимум.

import type { Asset, Goal, Wallet } from '@/hooks/store/types';
import { getCurrencyRatio } from '@/hooks/pdf/pdfCalculations';
import { completedToolsCount } from '@/constants/goalAnalysis';

export type HealthComponentId = 'budget' | 'cushion' | 'debt' | 'goals' | 'tracking';

export interface HealthComponent {
  id: HealthComponentId;
  title: string;
  points: number;
  max: number;
  /** Что показать сейчас: «Дельта 12% дохода». */
  summary: string;
  /** Совет, если балл не максимальный. */
  advice?: string;
  /** Экран, где это исправляется. */
  route: string;
}

export interface HealthLevel {
  title: string;
  color: string;
  /** Нижняя граница балла. */
  from: number;
}

/** Уровни из ТЗ; цвета — красный / жёлтый / зелёный. */
export const HEALTH_LEVELS: HealthLevel[] = [
  { title: 'Новичок', color: '#EF4444', from: 0 },
  { title: 'Ученик', color: '#F59E0B', from: 40 },
  { title: 'Эксперт', color: '#4CAF50', from: 70 },
  { title: 'Финансовый гуру', color: '#22C55E', from: 90 },
];

export interface FinancialHealth {
  score: number;
  level: HealthLevel;
  components: HealthComponent[];
}

export interface HealthInput {
  incomes: Asset[];
  expences: Asset[];
  passives: Asset[];
  wallets: Wallet[];
  goals: Goal[];
  /** Валюта учёта в приложении (₸ / $ / €). */
  currency: string;
  now?: Date;
}

const DAY_MS = 24 * 60 * 60 * 1000;

const sum = (records: Asset[], field: 'amount' | 'additional' = 'amount') =>
  records.reduce((total, r) => total + (Number(r[field]) || 0), 0);

const createdWithin = (record: Asset, now: Date, days: number) => {
  if (!record.createdAt) return false;
  const time = new Date(record.createdAt).getTime();
  return !isNaN(time) && now.getTime() - time <= days * DAY_MS && time <= now.getTime();
};

/**
 * Доходы и расходы за месяц: записи за последние 30 дней. Если за этот срок
 * записей нет (учёт вели раньше), берём все — иначе балл обнулялся бы
 * у тех, кто просто давно не заходил.
 */
function monthlyTotals(incomes: Asset[], expences: Asset[], now: Date) {
  const recentIncomes = incomes.filter((r) => createdWithin(r, now, 30));
  const recentExpences = expences.filter((r) => createdWithin(r, now, 30));
  const useRecent = recentIncomes.length > 0 || recentExpences.length > 0;
  return {
    income: sum(useRecent ? recentIncomes : incomes),
    expense: sum(useRecent ? recentExpences : expences),
  };
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const round1 = (value: number) => Math.round(value * 10) / 10;

export function levelForScore(score: number): HealthLevel {
  return [...HEALTH_LEVELS].reverse().find((l) => score >= l.from) ?? HEALTH_LEVELS[0];
}

export function computeFinancialHealth({
  incomes,
  expences,
  passives,
  wallets,
  goals,
  currency,
  now = new Date(),
}: HealthInput): FinancialHealth {
  const { income, expense } = monthlyTotals(incomes, expences, now);
  const components: HealthComponent[] = [];

  // 1. Бюджет: доля дохода, которая остаётся (дельта). Цель — от 20%.
  {
    const max = 30;
    if (income <= 0) {
      components.push({
        id: 'budget',
        title: 'Контроль бюджета',
        points: 0,
        max,
        summary: 'Нет данных о доходах',
        advice: 'Внесите доходы и расходы — так рассчитается ваша дельта.',
        route: '/main/finance/incomes/main',
      });
    } else {
      const deltaShare = (income - expense) / income;
      const points = deltaShare < 0 ? 0 : Math.round(clamp(5 + (25 * deltaShare) / 0.2, 0, max));
      const percent = Math.round(deltaShare * 100);
      components.push({
        id: 'budget',
        title: 'Контроль бюджета',
        points,
        max,
        summary: `Дельта ${percent}% дохода`,
        advice:
          deltaShare < 0
            ? 'Расходы превышают доходы — сократите необязательные траты или найдите дополнительный доход.'
            : points < max
              ? `Старайтесь откладывать от 20% дохода — сейчас остаётся ${percent}%.`
              : undefined,
        route: '/main/finance/expences/main',
      });
    }
  }

  // 2. Подушка безопасности: на сколько месяцев расходов хватит денег на счетах.
  {
    const max = 25;
    const ratio = getCurrencyRatio(currency).kzt;
    const savings = wallets
      .filter((w) => !w.excludeFromBalance)
      .reduce((total, w) => total + ((Number(w.summ) || 0) * getCurrencyRatio(w.currency).kzt) / ratio, 0);

    if (expense <= 0) {
      components.push({
        id: 'cushion',
        title: 'Подушка безопасности',
        points: 0,
        max,
        summary: 'Нет данных о расходах',
        advice: 'Внесите расходы — тогда станет видно, на сколько месяцев хватит сбережений.',
        route: '/main/finance/expences/main',
      });
    } else {
      const months = savings / expense;
      const points = Math.round(clamp((max * months) / 6, 0, max));
      components.push({
        id: 'cushion',
        title: 'Подушка безопасности',
        points,
        max,
        summary: `Хватит на ${round1(months)} мес. расходов`,
        advice: points < max ? 'Сформируйте подушку безопасности на 6 месяцев расходов.' : undefined,
        route: '/main',
      });
    }
  }

  // 3. Долговая нагрузка: расходы на пассивы в месяц к доходу. Здоровый уровень — до 20%.
  {
    const max = 20;
    const monthlyPassives = sum(passives, 'additional') / 12;
    if (monthlyPassives <= 0) {
      components.push({
        id: 'debt',
        title: 'Долговая нагрузка',
        points: max,
        max,
        summary: passives.length ? 'Пассивы без ежемесячных расходов' : 'Пассивов нет',
        route: '/main/finance/passives/main',
      });
    } else if (income <= 0) {
      components.push({
        id: 'debt',
        title: 'Долговая нагрузка',
        points: 0,
        max,
        summary: 'Нет данных о доходах',
        advice: 'Внесите доходы, чтобы оценить нагрузку от пассивов.',
        route: '/main/finance/incomes/main',
      });
    } else {
      const share = monthlyPassives / income;
      const points = Math.round(share <= 0.2 ? max : clamp((max * (0.5 - share)) / 0.3, 0, max));
      components.push({
        id: 'debt',
        title: 'Долговая нагрузка',
        points,
        max,
        summary: `Пассивы забирают ${Math.round(share * 100)}% дохода`,
        advice:
          points < max
            ? 'Нагрузка выше 20% дохода — рассмотрите рефинансирование или отказ от самых затратных пассивов.'
            : undefined,
        route: '/main/finance/passives/main',
      });
    }
  }

  // 4. Цели: поставлена, пополняется, проработана.
  {
    const max = 15;
    const hasGoal = goals.length > 0;
    const hasProgress = goals.some((g) => (Number(g.progress) || 0) > 0);
    const analyzed = goals.some((g) => completedToolsCount(g.analysis) > 0);
    const points = (hasGoal ? 5 : 0) + (hasProgress ? 5 : 0) + (analyzed ? 5 : 0);
    components.push({
      id: 'goals',
      title: 'Финансовые цели',
      points,
      max,
      summary: hasGoal ? `Целей: ${goals.length}` : 'Целей нет',
      advice: !hasGoal
        ? 'Поставьте первую финансовую цель — например, подушку безопасности.'
        : !hasProgress
          ? 'Пополните цель — даже небольшой взнос запускает движение.'
          : !analyzed
            ? 'Проработайте цель по SMARTER или «5 Почему» — так выше шанс её достичь.'
            : undefined,
      route: '/main/goals/main',
    });
  }

  // 5. Регулярный учёт.
  {
    const max = 10;
    const records = [...incomes, ...expences];
    const week = records.some((r) => createdWithin(r, now, 7));
    const month = records.some((r) => createdWithin(r, now, 30));
    const points = week ? max : month ? 5 : 0;
    components.push({
      id: 'tracking',
      title: 'Регулярный учёт',
      points,
      max,
      summary: week ? 'Есть записи за неделю' : month ? 'Последние записи — в этом месяце' : 'Давно не было записей',
      advice: points < max ? 'Вносите доходы и расходы хотя бы раз в неделю.' : undefined,
      route: '/main/finance/expences/main',
    });
  }

  const score = components.reduce((total, c) => total + c.points, 0);
  return { score, level: levelForScore(score), components };
}

/** Подсказка в стиле ТЗ для самой слабой составляющей. */
export function weakestHint(health: FinancialHealth): string | null {
  const weakest = [...health.components]
    .filter((c) => c.advice)
    .sort((a, b) => a.points / a.max - b.points / b.max)[0];
  return weakest ? `У тебя низкий балл по блоку «${weakest.title}». ${weakest.advice}` : null;
}
