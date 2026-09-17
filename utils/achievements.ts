// Достижения из ТЗ (вкладка «Достижения» в Figma): условия получения и прогресс.
// Считаются на лету из данных пользователя, поэтому после синхронизации на
// новом устройстве достижения восстанавливаются сами.

import type { Asset, Goal, Wallet } from '@/hooks/store/types';

export type AchievementId = 'first-steps' | 'discipline' | 'month-control' | 'optimizer' | 'saver' | 'first-goal';

export interface Achievement {
  id: AchievementId;
  title: string;
  description: string;
  unlocked: boolean;
  /** Текущее значение и цель прогресса, например 3 из 7 дней. */
  current: number;
  target: number;
  /** Подпись прогресса: «3 из 7 дней подряд». */
  progressLabel: string;
}

export interface AchievementInput {
  incomes: Asset[];
  expences: Asset[];
  wallets: Wallet[];
  goals: Goal[];
  now?: Date;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Номер календарного дня в локальном времени — чтобы полночь не ломала серию. */
const dayNumber = (date: Date) =>
  Math.round(new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() / DAY_MS);

const validDate = (value: unknown): Date | null => {
  if (!value) return null;
  const date = new Date(value as string);
  return isNaN(date.getTime()) ? null : date;
};

/** Самая длинная серия дней подряд, в каждый из которых была хотя бы одна запись. */
export function longestStreak(records: Asset[]): number {
  const days = [...new Set(records.map((r) => validDate(r.createdAt)).filter((d): d is Date => !!d).map(dayNumber))].sort(
    (a, b) => a - b
  );

  let best = 0;
  let run = 0;
  for (let i = 0; i < days.length; i++) {
    run = i > 0 && days[i] - days[i - 1] === 1 ? run + 1 : 1;
    best = Math.max(best, run);
  }
  return best;
}

/** Сумма расходов за календарный месяц со сдвигом offset от текущего (-1 — прошлый). */
export function monthTotal(expences: Asset[], now: Date, offset: number): number {
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 1);
  return expences.reduce((sum, e) => {
    const date = validDate(e.createdAt);
    return date && date >= start && date < end ? sum + (Number(e.amount) || 0) : sum;
  }, 0);
}

const plural = (n: number, forms: [string, string, string]) => {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1];
  return forms[2];
};

const days = (n: number) => `${n} ${plural(n, ['день', 'дня', 'дней'])}`;

export const DISCIPLINE_DAYS = 7;
export const MONTH_CONTROL_DAYS = 30;
export const SAVER_PERCENT = 50;

export function computeAchievements({ incomes, expences, wallets, goals, now = new Date() }: AchievementInput): Achievement[] {
  const records = [...incomes, ...expences];
  const streak = longestStreak(records);
  const firstStepsDone = records.length > 0 || wallets.length > 0;

  const lastMonth = monthTotal(expences, now, -1);
  const monthBefore = monthTotal(expences, now, -2);
  const optimized = monthBefore > 0 && lastMonth > 0 && lastMonth < monthBefore;
  const reduction = monthBefore > 0 ? Math.max(0, Math.round((1 - lastMonth / monthBefore) * 100)) : 0;

  const bestGoalProgress = goals.reduce((max, g) => Math.max(max, Number(g.progress) || 0), 0);
  const completedGoals = goals.filter((g) => (Number(g.progress) || 0) >= 100).length;

  return [
    {
      id: 'first-steps',
      title: 'Первые шаги',
      description: 'Добавьте первый доход, расход или кошелёк.',
      unlocked: firstStepsDone,
      current: firstStepsDone ? 1 : 0,
      target: 1,
      progressLabel: firstStepsDone ? 'Выполнено' : 'Пока нет записей',
    },
    {
      id: 'discipline',
      title: 'Дисциплина',
      description: `Вносите доходы или расходы ${DISCIPLINE_DAYS} дней подряд.`,
      unlocked: streak >= DISCIPLINE_DAYS,
      current: Math.min(streak, DISCIPLINE_DAYS),
      target: DISCIPLINE_DAYS,
      progressLabel: `Лучшая серия: ${days(streak)}`,
    },
    {
      id: 'month-control',
      title: 'Месяц контроля',
      description: `Ведите учёт ${MONTH_CONTROL_DAYS} дней подряд без пропусков.`,
      unlocked: streak >= MONTH_CONTROL_DAYS,
      current: Math.min(streak, MONTH_CONTROL_DAYS),
      target: MONTH_CONTROL_DAYS,
      progressLabel: `Лучшая серия: ${days(streak)} из ${MONTH_CONTROL_DAYS}`,
    },
    {
      id: 'optimizer',
      title: 'Оптимизатор',
      description: 'Потратьте за прошлый месяц меньше, чем за позапрошлый.',
      unlocked: optimized,
      current: optimized ? 1 : 0,
      target: 1,
      progressLabel: optimized
        ? `Расходы снизились на ${reduction}%`
        : monthBefore > 0 && lastMonth > 0
          ? 'Расходы не снизились'
          : 'Нужны расходы за два полных месяца',
    },
    {
      id: 'saver',
      title: 'Накопитель',
      description: `Накопите ${SAVER_PERCENT}% суммы любой цели.`,
      unlocked: bestGoalProgress >= SAVER_PERCENT,
      current: Math.min(Math.floor(bestGoalProgress), SAVER_PERCENT),
      target: SAVER_PERCENT,
      progressLabel: goals.length ? `Лучший прогресс по цели: ${Math.floor(bestGoalProgress)}%` : 'Пока нет целей',
    },
    {
      id: 'first-goal',
      title: 'Первая цель',
      description: 'Полностью накопите сумму одной из целей.',
      unlocked: completedGoals > 0,
      current: Math.min(Math.floor(bestGoalProgress), 100),
      target: 100,
      progressLabel: completedGoals > 0 ? `Достигнуто целей: ${completedGoals}` : `Лучший прогресс: ${Math.floor(bestGoalProgress)}%`,
    },
  ];
}
