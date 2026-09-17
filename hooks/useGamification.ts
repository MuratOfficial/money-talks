import { useMemo } from 'react';
import useFinancialStore from './useStore';
import { computeAchievements } from '@/utils/achievements';
import {
  GameData,
  GamificationState,
  availableBoxes,
  challengeProgress,
  computeCoins,
  computeXp,
  levelForXp,
} from '@/utils/gamification';

/** Всё о прогрессе пользователя в игре — одним хуком для экранов. */
export function useGamification() {
  const s = useFinancialStore();

  const data: GameData = useMemo(() => {
    const achievementsUnlocked = computeAchievements({
      incomes: s.incomes,
      expences: s.expences,
      wallets: s.wallets,
      goals: s.goals,
    }).filter((a) => a.unlocked).length;
    return {
      incomes: s.incomes,
      expences: s.expences,
      actives: s.actives,
      passives: s.passives,
      wallets: s.wallets,
      goals: s.goals,
      riskProfile: s.riskProfile,
      personalFinancialPlan: s.personalFinancialPlan,
      achievementsUnlocked,
    };
  }, [s.incomes, s.expences, s.actives, s.passives, s.wallets, s.goals, s.riskProfile, s.personalFinancialPlan]);

  const state: GamificationState = {
    activeDays: s.activeDays,
    challengeRuns: s.challengeRuns,
    claimedChallenges: s.claimedChallenges,
    openedBoxes: s.openedBoxes,
    lootCoins: s.lootCoins,
    ownedSkins: s.ownedSkins,
    activeSkin: s.activeSkin,
    spentCoins: s.spentCoins,
    lastSeenLevel: s.lastSeenLevel,
  };

  const xp = useMemo(() => computeXp(data, state), [data, s.activeDays, s.claimedChallenges]); // eslint-disable-line react-hooks/exhaustive-deps
  const level = levelForXp(xp.total);
  const coins = computeCoins(data, state, xp.total);
  const boxes = availableBoxes(state, xp.total);
  const challenges = useMemo(() => challengeProgress(data, state), [data, s.challengeRuns, s.claimedChallenges]); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, state, xp, level, coins, boxes, challenges };
}
