// Локальные напоминания — сценарии push-уведомлений из ТЗ, которые можно
// запланировать на самом телефоне, без сервера: приложение раскладывает их
// по датам при каждом изменении данных.

import type { Asset, Goal, RiskProfile } from '@/hooks/store/types';
import { monthNameToIndex } from '@/hooks/pdf/pdfCalculations';
import type { ChallengeProgress } from './gamification';

export interface Reminder {
  /** Стабильный ключ: одинаковые напоминания не дублируются при перепланировании. */
  key: string;
  title: string;
  body: string;
  date: Date;
  /** Экран, который откроется по нажатию. */
  screen: string;
}

export interface ReminderInput {
  incomes: Asset[];
  expences: Asset[];
  goals: Goal[];
  riskProfile: RiskProfile | null;
  challenges: ChallengeProgress[];
  now?: Date;
}

const DAY_MS = 24 * 60 * 60 * 1000;
/** iOS хранит не больше 64 запланированных уведомлений на приложение. */
export const MAX_REMINDERS = 20;

const at = (base: Date, hour: number) => new Date(base.getFullYear(), base.getMonth(), base.getDate(), hour, 0, 0, 0);
const addDays = (date: Date, days: number) => new Date(date.getTime() + days * DAY_MS);

const time = (value: unknown): number | null => {
  if (!value) return null;
  const t = new Date(value as string).getTime();
  return isNaN(t) ? null : t;
};

/** Срок цели как дата; null, если срок не выбран полностью. */
export function goalDeadline(goal: Goal): Date | null {
  const year = parseInt(goal.timeframe?.year ?? '', 10);
  const day = parseInt(goal.timeframe?.day ?? '', 10);
  if (isNaN(year) || isNaN(day) || !goal.timeframe?.month || goal.timeframe.month === 'Месяц') return null;
  return new Date(year, monthNameToIndex(goal.timeframe.month), day);
}

export function planReminders({ incomes, expences, goals, riskProfile, challenges, now = new Date() }: ReminderInput): Reminder[] {
  const reminders: Reminder[] = [];
  const add = (r: Reminder) => {
    if (r.date.getTime() > now.getTime() + 60_000) reminders.push(r);
  };

  // 1. Давно не вносил записи (ТЗ: «ничего не вводил 3 дня»).
  const lastRecord = Math.max(0, ...[...incomes, ...expences].map((r) => time(r.createdAt) ?? 0));
  const inactivityBase = lastRecord > 0 ? new Date(lastRecord) : now;
  let inactivityDate = at(addDays(inactivityBase, 3), 19);
  // Если три дня уже прошли, напоминаем завтра вечером — пока не появится запись.
  if (inactivityDate.getTime() <= now.getTime()) inactivityDate = at(addDays(now, 1), 19);
  add({
    key: 'inactivity',
    title: 'Ты давно не проверял баланс',
    body: 'Траты есть, учёта нет. Занесём хотя бы основные?',
    date: inactivityDate,
    screen: '/main/finance/expences/main',
  });

  // 2. Цели: дедлайн через 7 дней и завтра; давно не пополнялась.
  for (const goal of goals) {
    if ((Number(goal.progress) || 0) >= 100) continue;
    const deadline = goalDeadline(goal);
    if (deadline) {
      add({
        key: `goal-week-${goal.id}`,
        title: `До дедлайна по цели «${goal.name}» 7 дней`,
        body: 'Последний рывок? Проверь, всё ли по плану.',
        date: at(addDays(deadline, -7), 10),
        screen: '/main/goals/main',
      });
      add({
        key: `goal-tomorrow-${goal.id}`,
        title: `У цели «${goal.name}» завтра дедлайн`,
        body: 'Успеешь последний взнос?',
        date: at(addDays(deadline, -1), 10),
        screen: '/main/goals/main',
      });
    }
    const touched = time(goal.updatedAt) ?? time(goal.createdAt);
    if (touched) {
      add({
        key: `goal-idle-${goal.id}`,
        title: `Пора вернуться к цели «${goal.name}»`,
        body: 'Цель не пополнялась неделю. Она всё ещё актуальна?',
        date: at(addDays(new Date(touched), 7), 19),
        screen: '/main/goals/main',
      });
    }
  }

  // 3. Челлендж скоро закончится.
  for (const c of challenges) {
    if (c.status !== 'active' || c.daysLeft === null) continue;
    add({
      key: `challenge-${c.def.id}`,
      title: `⏰ Не забудь завершить челлендж «${c.def.title}»`,
      body: `Прогресс: ${c.current} из ${c.target}. Остался последний день!`,
      date: at(addDays(now, Math.max(0, c.daysLeft - 1)), 19),
      screen: '/main/profile/progress',
    });
  }

  // 4. Итоги месяца — в последний день месяца.
  add({
    key: 'month-summary',
    title: 'Самое время подвести итоги',
    body: 'Насколько ты приблизился к своим целям в этом месяце?',
    date: new Date(now.getFullYear(), now.getMonth() + 1, 0, 20, 0, 0, 0),
    screen: '/main/finance/analyze/main',
  });

  // 5. Тест на риск-профиль не пройден.
  if (!riskProfile) {
    add({
      key: 'risk-test',
      title: '🎓 Не знаешь, с чего начать инвестировать?',
      body: 'Пройди тест на риск-профиль — и мы подберём инструменты под тебя.',
      date: at(addDays(now, 2), 12),
      screen: '/main/invest',
    });
  }

  return reminders.sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, MAX_REMINDERS);
}
