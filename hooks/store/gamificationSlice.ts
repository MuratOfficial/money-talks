import { AppState, SliceCreator } from './types';
import { ChallengeId, dayKey, freshGamificationState, LootResult, uniqueDays } from '@/utils/gamification';
import { FinGuideSkinId } from '@/constants/finGuide';

type GamificationSlice = Pick<
  AppState,
  | 'activeDays'
  | 'challengeRuns'
  | 'claimedChallenges'
  | 'openedBoxes'
  | 'lootCoins'
  | 'ownedSkins'
  | 'activeSkin'
  | 'spentCoins'
  | 'lastSeenLevel'
  | 'markActiveDay'
  | 'startChallenge'
  | 'claimChallenge'
  | 'applyLootbox'
  | 'buySkin'
  | 'setActiveSkin'
  | 'setLastSeenLevel'
>;

export const createGamificationSlice: SliceCreator<GamificationSlice> = (set, get) => ({
  ...freshGamificationState(),

  markActiveDay: (date = new Date()) => {
    const today = dayKey(date);
    const { activeDays } = get();
    if (!activeDays.includes(today)) set({ activeDays: uniqueDays(activeDays, today) });
  },

  startChallenge: (id: ChallengeId, date = new Date()) =>
    set((state) => ({ challengeRuns: { ...state.challengeRuns, [id]: { startedAt: date.toISOString() } } })),

  claimChallenge: (id: ChallengeId, reward: { coins: number; xp: number }, date = new Date()) =>
    set((state) => {
      const run = state.challengeRuns[id];
      if (!run || run.claimedAt) return {};
      const claimedAt = date.toISOString();
      return {
        challengeRuns: { ...state.challengeRuns, [id]: { ...run, claimedAt } },
        claimedChallenges: [...state.claimedChallenges, { id, claimedAt, ...reward }],
      };
    }),

  applyLootbox: (result: LootResult) =>
    set((state) => ({
      openedBoxes: state.openedBoxes + 1,
      lootCoins: state.lootCoins + (result.kind === 'skin' ? 0 : result.coins),
      ownedSkins:
        result.kind === 'skin' && !state.ownedSkins.includes(result.skin) ? [...state.ownedSkins, result.skin] : state.ownedSkins,
    })),

  buySkin: (id: FinGuideSkinId, price: number) =>
    set((state) =>
      state.ownedSkins.includes(id)
        ? {}
        : { ownedSkins: [...state.ownedSkins, id], spentCoins: state.spentCoins + price, activeSkin: id }
    ),

  setActiveSkin: (id: FinGuideSkinId) => set((state) => (state.ownedSkins.includes(id) ? { activeSkin: id } : {})),

  setLastSeenLevel: (level: number) => set({ lastSeenLevel: level }),
});
