import { computeAchievements, longestStreak, monthTotal } from '@/utils/achievements';
import type { Asset, Goal } from '@/hooks/store/types';

let seq = 0;
const record = (createdAt: Date | string, amount = 100): Asset => ({ id: String(seq++), name: 'x', amount, createdAt: createdAt as Date });
const goal = (progress: number): Goal =>
  ({ id: String(seq++), name: 'g', progress, timeframe: { day: '1', month: 'Январь', year: '2030' } }) as Goal;

const byId = (list: ReturnType<typeof computeAchievements>, id: string) => list.find((a) => a.id === id)!;

describe('longestStreak', () => {
  it('считает дни подряд, а не записи, и переживает строки из синхронизации', () => {
    expect(
      longestStreak([
        record(new Date(2026, 8, 1, 9)),
        record(new Date(2026, 8, 1, 23)),
        record('2026-09-02T12:00:00'),
        record(new Date(2026, 8, 3)),
        record(new Date(2026, 8, 5)),
      ])
    ).toBe(3);
  });

  it('пропускает записи без даты', () => {
    expect(longestStreak([{ id: '1', name: 'x', amount: 1 }])).toBe(0);
  });
});

describe('monthTotal', () => {
  it('суммирует расходы за календарный месяц', () => {
    const now = new Date(2026, 8, 17);
    const expences = [record(new Date(2026, 7, 1), 10), record(new Date(2026, 7, 31, 23), 5), record(new Date(2026, 8, 1), 99)];
    expect(monthTotal(expences, now, -1)).toBe(15);
    expect(monthTotal(expences, now, 0)).toBe(99);
  });
});

describe('computeAchievements', () => {
  const now = new Date(2026, 8, 17);
  const empty = { incomes: [], expences: [], wallets: [], goals: [], now };

  it('у нового пользователя ничего не открыто', () => {
    expect(computeAchievements(empty).some((a) => a.unlocked)).toBe(false);
  });

  it('открывает дисциплину за 7 дней подряд, но не месяц контроля', () => {
    const expences = Array.from({ length: 7 }, (_, i) => record(new Date(2026, 8, 1 + i)));
    const list = computeAchievements({ ...empty, expences });
    expect(byId(list, 'first-steps').unlocked).toBe(true);
    expect(byId(list, 'discipline').unlocked).toBe(true);
    expect(byId(list, 'month-control')).toMatchObject({ unlocked: false, current: 7, target: 30 });
  });

  it('оптимизатор — прошлый месяц дешевле позапрошлого', () => {
    const expences = [record(new Date(2026, 6, 10), 1000), record(new Date(2026, 7, 10), 800)];
    expect(byId(computeAchievements({ ...empty, expences }), 'optimizer')).toMatchObject({
      unlocked: true,
      progressLabel: 'Расходы снизились на 20%',
    });
  });

  it('накопитель с 50%, первая цель со 100%', () => {
    let list = computeAchievements({ ...empty, goals: [goal(60)] });
    expect(byId(list, 'saver').unlocked).toBe(true);
    expect(byId(list, 'first-goal').unlocked).toBe(false);

    list = computeAchievements({ ...empty, goals: [goal(60), goal(100)] });
    expect(byId(list, 'first-goal').unlocked).toBe(true);
  });
});
