import {
  GameData,
  availableBoxes,
  challengeProgress,
  computeCoins,
  computeXp,
  freshGamificationState,
  levelForXp,
  rollLootbox,
} from '@/utils/gamification';
import type { Asset, Goal } from '@/hooks/store/types';

const now = new Date(2026, 8, 17, 12);
const daysAgo = (n: number) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000);
let seq = 0;
const rec = (createdAt: Date, extra: Partial<Asset> = {}): Asset => ({ id: String(seq++), name: 'x', amount: 100, createdAt, ...extra });

const empty: GameData = {
  incomes: [],
  expences: [],
  actives: [],
  passives: [],
  wallets: [],
  goals: [],
  riskProfile: null,
  personalFinancialPlan: null,
  achievementsUnlocked: 0,
};

const find = (list: ReturnType<typeof challengeProgress>, id: string) => list.find((c) => c.def.id === id)!;

describe('уровни', () => {
  it('таблица прогрессии из ТЗ', () => {
    expect(levelForXp(0).level.title).toBe('Новичок');
    expect(levelForXp(299)).toMatchObject({ level: { title: 'Новичок' }, next: { title: 'Пользователь' } });
    expect(levelForXp(1000).level.title).toBe('ФинГерой');
    expect(levelForXp(9999)).toMatchObject({ level: { title: 'Мастер' }, next: null, progress: 1 });
    expect(levelForXp(650).progress).toBeCloseTo(0.5);
  });
});

describe('опыт и монеты', () => {
  it('считает опыт по данным и скрывает пустые пункты', () => {
    const goals = [{ id: 'g', progress: 100, analysis: { whys: ['1', '2', '3', '4', '5'] } } as unknown as Goal];
    const { total, items } = computeXp({ ...empty, incomes: [rec(now), rec(now)], goals }, { ...freshGamificationState(), activeDays: ['2026-09-17'] });
    // 2 записи ×5 + цель 10 + пополнена 10 + достигнута 100 + методика 15 + 1 день
    expect(total).toBe(10 + 10 + 10 + 100 + 15 + 1);
    expect(items.map((i) => i.label)).not.toContain('Кошельки');
  });

  it('баланс монет: записи + бонусы уровней + награды − покупки', () => {
    const state = { ...freshGamificationState(), claimedChallenges: [{ id: 'findetox' as const, claimedAt: '', coins: 100, xp: 50 }], spentCoins: 50, lootCoins: 30 };
    // 350 XP → уровень «Пользователь»: бонусы 10 + 20
    expect(computeCoins({ ...empty, expences: [rec(now)] }, state, 350)).toEqual({ earned: 1 + 30 + 100 + 30, balance: 111 });
  });

  it('сундук за каждый новый уровень и выполненный челлендж', () => {
    const state = { ...freshGamificationState(), claimedChallenges: [{ id: 'findetox' as const, claimedAt: '', coins: 0, xp: 0 }], openedBoxes: 1 };
    expect(availableBoxes(state, 1000)).toBe(2);
  });
});

describe('челленджи', () => {
  it('неделя учёта: 7 разных дней с записями', () => {
    const state = { ...freshGamificationState(), challengeRuns: { 'week-tracking': { startedAt: daysAgo(6.5).toISOString() } } };
    const incomes = Array.from({ length: 6 }, (_, i) => rec(daysAgo(6 - i)));
    expect(find(challengeProgress({ ...empty, incomes }, state, now), 'week-tracking')).toMatchObject({ status: 'active', current: 6, daysLeft: 1 });
    expect(find(challengeProgress({ ...empty, incomes: [...incomes, rec(now)] }, state, now), 'week-tracking').status).toBe('completed');
  });

  it('финдетокс срывается необязательной тратой', () => {
    const state = { ...freshGamificationState(), challengeRuns: { findetox: { startedAt: daysAgo(3).toISOString() } } };
    expect(find(challengeProgress(empty, state, now), 'findetox')).toMatchObject({ status: 'active', current: 3 });
    const expences = [rec(daysAgo(1), { category: 'entertainment' })];
    expect(find(challengeProgress({ ...empty, expences }, state, now), 'findetox').status).toBe('failed');
  });

  it('истёкший челлендж проваливается, разовый после награды закрыт', () => {
    const expired = { ...freshGamificationState(), challengeRuns: { 'dream-capital': { startedAt: daysAgo(20).toISOString() } } };
    expect(find(challengeProgress(empty, expired, now), 'dream-capital').status).toBe('failed');

    const claimed = {
      ...freshGamificationState(),
      challengeRuns: { 'dream-capital': { startedAt: daysAgo(5).toISOString(), claimedAt: now.toISOString() } },
      claimedChallenges: [{ id: 'dream-capital' as const, claimedAt: now.toISOString(), coins: 150, xp: 75 }],
    };
    expect(find(challengeProgress(empty, claimed, now), 'dream-capital').status).toBe('claimed');
  });

  it('капитал мечты считает только цели, созданные после старта', () => {
    const state = { ...freshGamificationState(), challengeRuns: { 'dream-capital': { startedAt: daysAgo(2).toISOString() } } };
    const oldGoal = { id: 'old', progress: 50, createdAt: daysAgo(30) } as unknown as Goal;
    const newGoal = { id: 'new', progress: 10, createdAt: daysAgo(1) } as unknown as Goal;
    expect(find(challengeProgress({ ...empty, goals: [oldGoal] }, state, now), 'dream-capital').current).toBe(0);
    expect(find(challengeProgress({ ...empty, goals: [oldGoal, newGoal] }, state, now), 'dream-capital').status).toBe('completed');
  });
});

describe('сундук', () => {
  it('скин выпадает только из ещё не полученных', () => {
    const state = { ...freshGamificationState(), ownedSkins: ['classic', 'futurism', 'capital'] as const };
    expect(rollLootbox({ ...state, ownedSkins: [...state.ownedSkins] }, () => 0.1)).toEqual({ kind: 'skin', skin: 'vintage' });
  });

  it('если все скины есть — монеты', () => {
    const all = { ...freshGamificationState(), ownedSkins: ['classic', 'futurism', 'capital', 'vintage'] as ('classic' | 'futurism' | 'capital' | 'vintage')[] };
    expect(rollLootbox(all, () => 0.1)).toMatchObject({ kind: 'quote' });
    expect(rollLootbox(all, () => 0.9)).toEqual({ kind: 'coins', coins: 56 });
  });
});
