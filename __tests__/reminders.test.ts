import { MAX_REMINDERS, goalDeadline, planReminders } from '@/utils/reminders';
import type { Goal } from '@/hooks/store/types';
import type { ChallengeProgress } from '@/utils/gamification';

const now = new Date(2026, 8, 17, 12); // 17 сентября, 12:00
const base = { incomes: [], expences: [], goals: [], riskProfile: null, challenges: [], now };
const goal = (fields: Partial<Goal>) =>
  ({ id: 'g', name: 'Отпуск', progress: 20, timeframe: { day: '30', month: 'Сентябрь', year: '2026' }, ...fields }) as Goal;
const byKey = (list: ReturnType<typeof planReminders>, key: string) => list.find((r) => r.key === key);

describe('planReminders', () => {
  it('напоминает через 3 дня после последней записи в 19:00', () => {
    const r = byKey(planReminders({ ...base, expences: [{ id: '1', name: 'x', amount: 1, createdAt: new Date(2026, 8, 16, 9) }] }), 'inactivity');
    expect(r?.date).toEqual(new Date(2026, 8, 19, 19));
  });

  it('не планирует напоминания в прошлом', () => {
    const r = planReminders({ ...base, expences: [{ id: '1', name: 'x', amount: 1, createdAt: new Date(2026, 5, 1) }] });
    // три дня давно прошли — напоминаем завтра вечером
    expect(byKey(r, 'inactivity')?.date).toEqual(new Date(2026, 8, 18, 19));
    expect(r.every((x) => x.date.getTime() > now.getTime())).toBe(true);
  });

  it('дедлайн цели: за неделю и накануне; достигнутые цели пропускает', () => {
    const r = planReminders({ ...base, goals: [goal({}), goal({ id: 'done', progress: 100 })] });
    expect(byKey(r, 'goal-week-g')?.date).toEqual(new Date(2026, 8, 23, 10));
    expect(byKey(r, 'goal-tomorrow-g')?.date).toEqual(new Date(2026, 8, 29, 10));
    expect(r.some((x) => x.key.endsWith('-done'))).toBe(false);
  });

  it('итоги месяца в последний день месяца и тест риск-профиля, если не пройден', () => {
    const r = planReminders(base);
    expect(byKey(r, 'month-summary')?.date).toEqual(new Date(2026, 8, 30, 20));
    expect(byKey(r, 'risk-test')).toBeDefined();
    expect(byKey(planReminders({ ...base, riskProfile: { title: 'x', percentage: 1, score: 1, totalQuestions: 1, completedAt: '' } }), 'risk-test')).toBeUndefined();
  });

  it('напоминает о челлендже накануне окончания', () => {
    const challenge = { def: { id: 'findetox', title: 'Финдетокс' }, status: 'active', current: 4, target: 7, daysLeft: 3 } as unknown as ChallengeProgress;
    expect(byKey(planReminders({ ...base, challenges: [challenge] }), 'challenge-findetox')?.date).toEqual(new Date(2026, 8, 19, 19));
  });

  it('не больше лимита', () => {
    const goals = Array.from({ length: 30 }, (_, i) => goal({ id: String(i), timeframe: { day: '1', month: 'Декабрь', year: '2026' }, updatedAt: now }));
    expect(planReminders({ ...base, goals }).length).toBe(MAX_REMINDERS);
  });

  it('срок цели без выбранного месяца — не дата', () => {
    expect(goalDeadline(goal({ timeframe: { day: '1', month: 'Месяц', year: '2026' } }))).toBeNull();
  });
});
