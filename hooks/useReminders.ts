import { useEffect, useMemo } from 'react';
import { Href, router } from 'expo-router';
import useFinancialStore from './useStore';
import { useGamification } from './useGamification';
import { planReminders } from '@/utils/reminders';
import { cancelReminders, onReminderTap, scheduleReminders } from '@/lib/localNotifications';

const RESCHEDULE_DELAY_MS = 3000;

/**
 * Держит локальные напоминания в актуальном состоянии: пересобирает их после
 * изменений данных (с задержкой, чтобы не дёргать систему на каждый ввод)
 * и снимает, если пользователь их выключил или вышел из аккаунта.
 */
export function useReminders() {
  const { remindersEnabled, isAuthenticated, incomes, expences, goals, riskProfile } = useFinancialStore();
  const { challenges } = useGamification();
  const enabled = remindersEnabled && isAuthenticated;

  const reminders = useMemo(
    () => (enabled ? planReminders({ incomes, expences, goals, riskProfile, challenges }) : []),
    [enabled, incomes, expences, goals, riskProfile, challenges]
  );
  // Даты сравнивать не нужно — достаточно ключей и времени срабатывания.
  const signature = reminders.map((r) => `${r.key}@${r.date.getTime()}`).join('|');

  useEffect(() => {
    const timer = setTimeout(() => {
      (enabled ? scheduleReminders(reminders) : cancelReminders()).catch((error) =>
        console.warn('Не удалось обновить напоминания:', error)
      );
    }, RESCHEDULE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [enabled, signature]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => onReminderTap((screen) => router.push(screen as Href)), []);
}
