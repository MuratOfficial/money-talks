// Геймификация из ТЗ: опыт (XP) и уровни, монеты, челленджи, лутбоксы, скины.
//
// Опыт и заработанные монеты считаются на лету из данных пользователя —
// они синхронизируются с сервером и восстанавливаются на новом устройстве.
// На устройстве хранится только то, что из данных не вывести: дни входа,
// запущенные и полученные челленджи, открытые сундуки, покупки скинов.

import type { Asset, Goal, PersonalFinancialPlan, RiskProfile, Wallet } from '@/hooks/store/types';
import { completedToolsCount } from '@/constants/goalAnalysis';
import { FINGUIDE_SKINS, FinGuideSkinId } from '@/constants/finGuide';

// ─── Уровни ────────────────────────────────────────────────────────────────

export interface Level {
  index: number;
  title: string;
  xp: number;
  /** Монеты при достижении уровня. */
  bonusCoins: number;
  perks: string;
}

/** Таблица прогрессии из ТЗ. */
export const LEVELS: Level[] = [
  { index: 0, title: 'Новичок', xp: 0, bonusCoins: 10, perks: 'Подсказки от ФинГида, базовый функционал' },
  { index: 1, title: 'Пользователь', xp: 300, bonusCoins: 20, perks: 'Достижения, первые бейджи и сундук' },
  { index: 2, title: 'ФинГерой', xp: 1000, bonusCoins: 50, perks: 'Сундук с наградой и персональные советы' },
  { index: 3, title: 'Наставник', xp: 2500, bonusCoins: 100, perks: 'Премиум-скины и сундук' },
  { index: 4, title: 'Мастер', xp: 5000, bonusCoins: 200, perks: 'Элитный статус и сундук' },
];

export function levelForXp(xp: number): { level: Level; next: Level | null; progress: number } {
  const level = [...LEVELS].reverse().find((l) => xp >= l.xp) ?? LEVELS[0];
  const next = LEVELS[level.index + 1] ?? null;
  const progress = next ? Math.min(1, (xp - level.xp) / (next.xp - level.xp)) : 1;
  return { level, next, progress };
}

// ─── Состояние на устройстве ───────────────────────────────────────────────

export type ChallengeId = 'week-tracking' | 'findetox' | 'dream-capital' | 'financeon' | 'invest-marathon' | 'insurance-shield';

export interface ChallengeRun {
  startedAt: string;
  claimedAt?: string;
}

export interface GamificationState {
  /** Дни, когда пользователь открывал приложение: YYYY-MM-DD. */
  activeDays: string[];
  /** Текущий (или последний) запуск каждого челленджа. */
  challengeRuns: Partial<Record<ChallengeId, ChallengeRun>>;
  /** Полученные награды за челленджи — копятся, повторяемые можно пройти снова. */
  claimedChallenges: { id: ChallengeId; claimedAt: string; coins: number; xp: number }[];
  openedBoxes: number;
  /** Монеты, выпавшие из сундуков. */
  lootCoins: number;
  ownedSkins: FinGuideSkinId[];
  activeSkin: FinGuideSkinId;
  spentCoins: number;
  /** Последний уровень, о котором пользователь узнал, — для поздравления. */
  lastSeenLevel: number;
}

export const freshGamificationState = (): GamificationState => ({
  activeDays: [],
  challengeRuns: {},
  claimedChallenges: [],
  openedBoxes: 0,
  lootCoins: 0,
  ownedSkins: ['classic'],
  activeSkin: 'classic',
  spentCoins: 0,
  lastSeenLevel: 0,
});

// ─── Данные пользователя ───────────────────────────────────────────────────

export interface GameData {
  incomes: Asset[];
  expences: Asset[];
  actives: Asset[];
  passives: Asset[];
  wallets: Wallet[];
  goals: Goal[];
  riskProfile: RiskProfile | null;
  personalFinancialPlan: PersonalFinancialPlan | null;
  /** Количество полученных достижений (utils/achievements). */
  achievementsUnlocked: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export const dayKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const time = (value: unknown): number | null => {
  if (!value) return null;
  const t = new Date(value as string).getTime();
  return isNaN(t) ? null : t;
};

const parseSum = (value: string | undefined) => Number(String(value ?? '').replace(/[^\d.,]/g, '').replace(',', '.')) || 0;

const pfpFilled = (pfp: PersonalFinancialPlan | null) => !!pfp?.fio?.trim() && /^\d{4}$/.test(pfp?.birthDate?.year ?? '');

const insuranceCount = (pfp: PersonalFinancialPlan | null) =>
  pfp ? [pfp.insurance?.life, pfp.insurance?.disability, pfp.insurance?.medical].filter((v) => parseSum(v) > 0).length : 0;

// ─── Опыт ──────────────────────────────────────────────────────────────────

export interface XpItem {
  label: string;
  count: number;
  xp: number;
}

/** Опыт с разбивкой «за что». Правила — из таблицы баллов ТЗ. */
export function computeXp(data: GameData, state: GamificationState): { total: number; items: XpItem[] } {
  const records = data.incomes.length + data.expences.length + data.actives.length + data.passives.length;
  const goalsWithProgress = data.goals.filter((g) => (Number(g.progress) || 0) > 0).length;
  const goalsDone = data.goals.filter((g) => (Number(g.progress) || 0) >= 100).length;
  const analysisTools = data.goals.reduce((s, g) => s + completedToolsCount(g.analysis), 0);
  const challengeXp = state.claimedChallenges.reduce((s, c) => s + c.xp, 0);

  const items: XpItem[] = [
    { label: 'Записи доходов, расходов, активов и пассивов', count: records, xp: records * 5 },
    { label: 'Кошельки', count: data.wallets.length, xp: data.wallets.length * 5 },
    { label: 'Поставленные цели', count: data.goals.length, xp: data.goals.length * 10 },
    { label: 'Пополненные цели', count: goalsWithProgress, xp: goalsWithProgress * 10 },
    { label: 'Достигнутые цели', count: goalsDone, xp: goalsDone * 100 },
    { label: 'Проработка целей (SMARTER, 5 Почему, Декарт)', count: analysisTools, xp: analysisTools * 15 },
    { label: 'Тест на риск-профиль', count: data.riskProfile ? 1 : 0, xp: data.riskProfile ? 25 : 0 },
    { label: 'Заполненный ЛФП', count: pfpFilled(data.personalFinancialPlan) ? 1 : 0, xp: pfpFilled(data.personalFinancialPlan) ? 50 : 0 },
    { label: 'Дни в приложении', count: state.activeDays.length, xp: state.activeDays.length },
    { label: 'Достижения', count: data.achievementsUnlocked, xp: data.achievementsUnlocked * 30 },
    { label: 'Челленджи', count: state.claimedChallenges.length, xp: challengeXp },
  ];

  return { total: items.reduce((s, i) => s + i.xp, 0), items: items.filter((i) => i.count > 0) };
}

// ─── Челленджи ─────────────────────────────────────────────────────────────

export interface ChallengeDef {
  id: ChallengeId;
  title: string;
  description: string;
  days: number;
  coins: number;
  xp: number;
  /** Можно проходить снова после получения награды. */
  repeatable: boolean;
  unit: string;
}

/** Челленджи из ТЗ, условия которых можно проверить по данным приложения. */
export const CHALLENGES: ChallengeDef[] = [
  { id: 'week-tracking', title: 'Неделя учёта', description: 'Вносите доходы или расходы каждый день 7 дней.', days: 7, coins: 100, xp: 50, repeatable: true, unit: 'дн.' },
  { id: 'findetox', title: 'Финдетокс', description: '7 дней без необязательных трат: развлечений, покупок и прочего из «Необязательных».', days: 7, coins: 100, xp: 50, repeatable: true, unit: 'дн.' },
  { id: 'dream-capital', title: 'Капитал мечты', description: 'Создайте новую цель и сделайте первое пополнение.', days: 14, coins: 150, xp: 75, repeatable: false, unit: 'шаг.' },
  { id: 'financeon', title: 'Финансон', description: 'Заполните личный финансовый план: ФИО, дату рождения, зависимых и страховку.', days: 14, coins: 150, xp: 75, repeatable: false, unit: 'шаг.' },
  { id: 'invest-marathon', title: 'Инвест-марафон', description: 'Пройдите тест на риск-профиль и добавьте инвестиционный актив.', days: 30, coins: 200, xp: 100, repeatable: false, unit: 'шаг.' },
  { id: 'insurance-shield', title: 'Страховой щит', description: 'Укажите в ЛФП минимум два вида страховой защиты.', days: 30, coins: 150, xp: 75, repeatable: false, unit: 'шаг.' },
];

export type ChallengeStatus = 'available' | 'active' | 'completed' | 'failed' | 'claimed';

export interface ChallengeProgress {
  def: ChallengeDef;
  status: ChallengeStatus;
  current: number;
  target: number;
  /** Сколько целых дней осталось у активного челленджа. */
  daysLeft: number | null;
}

const OPTIONAL_CATEGORIES = ['entertainment', 'shopping'];

function evaluate(def: ChallengeDef, data: GameData, start: number, now: number): { current: number; target: number; broken?: boolean } {
  const end = start + def.days * DAY_MS;
  const inRun = (value: unknown) => {
    const t = time(value);
    return t !== null && t >= start && t < end;
  };

  switch (def.id) {
    case 'week-tracking': {
      const days = new Set(
        [...data.incomes, ...data.expences].filter((r) => inRun(r.createdAt)).map((r) => dayKey(new Date(r.createdAt as Date)))
      );
      return { current: days.size, target: 7 };
    }
    case 'findetox': {
      const broken = data.expences.some(
        (e) => inRun(e.createdAt) && (e.categoryTab === 'notRequired' || OPTIONAL_CATEGORIES.includes(e.category ?? ''))
      );
      const elapsed = Math.min(7, Math.floor((Math.min(now, end) - start) / DAY_MS));
      return { current: broken ? 0 : elapsed, target: 7, broken };
    }
    case 'dream-capital': {
      const created = data.goals.filter((g) => inRun(g.createdAt));
      return { current: (created.length > 0 ? 1 : 0) + (created.some((g) => (Number(g.progress) || 0) > 0) ? 1 : 0), target: 2 };
    }
    case 'financeon': {
      const pfp = data.personalFinancialPlan;
      const steps = [!!pfp?.fio?.trim(), /^\d{4}$/.test(pfp?.birthDate?.year ?? ''), (pfp?.financialDependents ?? '').trim() !== '', insuranceCount(pfp) > 0];
      return { current: steps.filter(Boolean).length, target: 4 };
    }
    case 'invest-marathon': {
      const tested = inRun(data.riskProfile?.completedAt);
      const invested = data.actives.some((a) => inRun(a.createdAt));
      return { current: (tested ? 1 : 0) + (invested ? 1 : 0), target: 2 };
    }
    case 'insurance-shield':
      return { current: Math.min(2, insuranceCount(data.personalFinancialPlan)), target: 2 };
  }
}

export function challengeProgress(data: GameData, state: GamificationState, now = new Date()): ChallengeProgress[] {
  const nowMs = now.getTime();
  return CHALLENGES.map((def) => {
    const run = state.challengeRuns[def.id];
    const everClaimed = state.claimedChallenges.some((c) => c.id === def.id);
    const base = { def, current: 0, target: def.id === 'week-tracking' || def.id === 'findetox' ? 7 : 2, daysLeft: null };

    if (!run || run.claimedAt) {
      if (everClaimed && !def.repeatable) return { ...base, status: 'claimed' as const };
      return { ...base, status: 'available' as const };
    }

    const start = time(run.startedAt) ?? nowMs;
    const end = start + def.days * DAY_MS;
    const { current, target, broken } = evaluate(def, data, start, nowMs);
    const done = !broken && current >= target;
    const status: ChallengeStatus = done ? 'completed' : broken || nowMs >= end ? 'failed' : 'active';
    return {
      def,
      status,
      current,
      target,
      daysLeft: status === 'active' ? Math.max(0, Math.ceil((end - nowMs) / DAY_MS)) : null,
    };
  });
}

// ─── Монеты и сундуки ──────────────────────────────────────────────────────

export function computeCoins(data: GameData, state: GamificationState, xp: number) {
  const { level } = levelForXp(xp);
  const records = data.incomes.length + data.expences.length + data.actives.length + data.passives.length;
  const levelBonus = LEVELS.slice(0, level.index + 1).reduce((s, l) => s + l.bonusCoins, 0);
  const challengeCoins = state.claimedChallenges.reduce((s, c) => s + c.coins, 0);
  const earned = records + levelBonus + challengeCoins + state.lootCoins;
  return { earned, balance: Math.max(0, earned - state.spentCoins) };
}

/** Сундуки: за каждый новый уровень и за каждый выполненный челлендж. */
export function availableBoxes(state: GamificationState, xp: number): number {
  const { level } = levelForXp(xp);
  return Math.max(0, level.index + state.claimedChallenges.length - state.openedBoxes);
}

export const MOTIVATION_QUOTES = [
  'Твой капитал — это не то, что ты зарабатываешь, а то, что у тебя остаётся.',
  'Стабильная дельта — это как бензин в баке. Без неё далеко не уедешь.',
  'Не сокращай расходы — перенаправь их.',
  'Деньги любят порядок и осознанность.',
  'Правильно поставленная цель — это половина успеха.',
];

export type LootResult =
  | { kind: 'coins'; coins: number }
  | { kind: 'skin'; skin: FinGuideSkinId }
  | { kind: 'quote'; quote: string; coins: number };

/** Содержимое сундука. `random` передаётся для тестов. */
export function rollLootbox(state: GamificationState, random: () => number = Math.random): LootResult {
  const roll = random();
  const missingSkins = FINGUIDE_SKINS.filter((s) => !state.ownedSkins.includes(s.id));
  if (roll < 0.25 && missingSkins.length > 0) {
    return { kind: 'skin', skin: missingSkins[Math.floor(random() * missingSkins.length)].id };
  }
  if (roll < 0.4) {
    return { kind: 'quote', quote: MOTIVATION_QUOTES[Math.floor(random() * MOTIVATION_QUOTES.length)], coins: 10 };
  }
  return { kind: 'coins', coins: 20 + Math.floor(random() * 41) };
}

export function uniqueDays(days: string[], today: string): string[] {
  return days.includes(today) ? days : [...days, today].slice(-730);
}
