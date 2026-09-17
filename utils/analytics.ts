// Динамика для раздела «Анализ» (ТЗ): доходы, расходы и дельта по месяцам или
// кварталам, рост чистого капитала, тревога при минусовой дельте и прогноз
// достижения целей при текущей дельте.

import type { Asset, Goal } from '@/hooks/store/types';
import { getCurrencyRatio } from '@/hooks/pdf/pdfCalculations';

export type PeriodKind = 'month' | 'quarter';

export interface Period {
  label: string;
  start: Date;
  end: Date;
}

const MONTHS_SHORT = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

/** Последние `count` периодов, заканчивая текущим, от старых к новым. */
export function buildPeriods(kind: PeriodKind, count: number, now = new Date()): Period[] {
  const step = kind === 'month' ? 1 : 3;
  // Начало текущего периода: месяц или первый месяц квартала.
  const currentStartMonth = kind === 'month' ? now.getMonth() : now.getMonth() - (now.getMonth() % 3);
  const periods: Period[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const start = new Date(now.getFullYear(), currentStartMonth - i * step, 1);
    const end = new Date(start.getFullYear(), start.getMonth() + step, 1);
    const label =
      kind === 'month'
        ? MONTHS_SHORT[start.getMonth()]
        : `${Math.floor(start.getMonth() / 3) + 1} кв ${String(start.getFullYear()).slice(2)}`;
    periods.push({ label, start, end });
  }
  return periods;
}

const createdTime = (record: Asset): number | null => {
  if (!record.createdAt) return null;
  const t = new Date(record.createdAt).getTime();
  return isNaN(t) ? null : t;
};

/** Сумма записей, созданных внутри каждого периода. */
export function sumByPeriod(records: Asset[], periods: Period[]): number[] {
  return periods.map(({ start, end }) =>
    records.reduce((total, r) => {
      const t = createdTime(r);
      return t !== null && t >= start.getTime() && t < end.getTime() ? total + (Number(r.amount) || 0) : total;
    }, 0)
  );
}

/**
 * Сумма записей на конец каждого периода. Активы и пассивы — это состояние,
 * а не поток: актив, добавленный в марте, есть и в апреле. Записи без даты
 * считаем существующими всегда.
 */
export function totalAtPeriodEnd(records: Asset[], periods: Period[]): number[] {
  return periods.map(({ end }) =>
    records.reduce((total, r) => {
      const t = createdTime(r);
      return t === null || t < end.getTime() ? total + (Number(r.amount) || 0) : total;
    }, 0)
  );
}

export interface TrendData {
  periods: Period[];
  incomes: number[];
  expences: number[];
  deltas: number[];
  actives: number[];
  passives: number[];
  netCapital: number[];
}

export function buildTrends(
  data: { incomes: Asset[]; expences: Asset[]; actives: Asset[]; passives: Asset[] },
  kind: PeriodKind,
  now = new Date()
): TrendData {
  const periods = buildPeriods(kind, kind === 'month' ? 6 : 4, now);
  const incomes = sumByPeriod(data.incomes, periods);
  const expences = sumByPeriod(data.expences, periods);
  const actives = totalAtPeriodEnd(data.actives, periods);
  const passives = totalAtPeriodEnd(data.passives, periods);
  return {
    periods,
    incomes,
    expences,
    deltas: incomes.map((v, i) => v - expences[i]),
    actives,
    passives,
    netCapital: actives.map((v, i) => v - passives[i]),
  };
}

/** Изменение в % к предыдущему значению; null, если сравнивать не с чем. */
export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return Math.round(((current - previous) / Math.abs(previous)) * 100);
}

/**
 * ТЗ: «индикатор тревоги, если дельта уходит в минус 2 месяца подряд».
 * Смотрим два последних завершённых месяца — текущий ещё не закончился.
 */
export function negativeDeltaTwoMonths(data: { incomes: Asset[]; expences: Asset[] }, now = new Date()): boolean {
  const periods = buildPeriods('month', 3, now).slice(0, 2);
  const incomes = sumByPeriod(data.incomes, periods);
  const expences = sumByPeriod(data.expences, periods);
  return periods.every((_, i) => incomes[i] + expences[i] > 0 && incomes[i] - expences[i] < 0);
}

export interface GoalForecast {
  goalId: string;
  name: string;
  remaining: number;
  /** null — при текущей дельте цель не достигается. */
  months: number | null;
}

/**
 * Через сколько месяцев цель будет накоплена, если откладывать всю среднюю
 * дельту последних трёх завершённых месяцев. Сумма цели — в её валюте,
 * дельта — в валюте приложения, поэтому переводим через тенге.
 */
export function forecastGoals(
  goals: Goal[],
  data: { incomes: Asset[]; expences: Asset[] },
  appCurrency: string,
  now = new Date()
): { averageDelta: number; forecasts: GoalForecast[] } {
  const periods = buildPeriods('month', 4, now).slice(0, 3);
  const incomes = sumByPeriod(data.incomes, periods);
  const expences = sumByPeriod(data.expences, periods);
  const averageDelta = incomes.reduce((s, v, i) => s + v - expences[i], 0) / periods.length;

  const toApp = getCurrencyRatio(appCurrency).kzt;
  const forecasts = goals
    .filter((g) => (Number(g.progress) || 0) < 100)
    .map((g) => {
      const parse = (v: string | undefined) => Number(String(v ?? '').replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
      const rate = getCurrencyRatio(g.currency).kzt / toApp;
      const remaining = Math.max(0, parse(g.amount) - parse(g.collected)) * rate;
      return {
        goalId: g.id,
        name: g.name,
        remaining,
        months: averageDelta > 0 ? Math.ceil(remaining / averageDelta) : null,
      };
    });

  return { averageDelta, forecasts };
}
