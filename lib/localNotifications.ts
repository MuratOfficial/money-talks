// Локальные уведомления через expo-notifications — без сервера и push-токенов.
// Приложение само планирует их на устройстве (см. utils/reminders).

import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import type { Reminder } from '@/utils/reminders';

// Нативного модуля нет на вебе и в Expo Go — там напоминания просто недоступны.
let Notifications: typeof import('expo-notifications') | null = null;
try {
  if (Platform.OS !== 'web' && Constants.executionEnvironment !== ExecutionEnvironment.StoreClient) {
    Notifications = require('expo-notifications');
    Notifications!.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  }
} catch {
  Notifications = null;
}

const REMINDER_TYPE = 'reminder';
const CHANNEL_ID = 'reminders';

export const notificationsAvailable = () => Notifications !== null;

/** Спрашивает разрешение, если его ещё нет. */
export async function ensureNotificationPermission(): Promise<boolean> {
  if (!Notifications) return false;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Напоминания',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  return (await Notifications.requestPermissionsAsync()).granted;
}

/** Снимает запланированные нами напоминания; чужие уведомления не трогает. */
export async function cancelReminders(): Promise<void> {
  if (!Notifications) return;
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((n) => n.content.data?.type === REMINDER_TYPE)
      .map((n) => Notifications!.cancelScheduledNotificationAsync(n.identifier))
  );
}

/** Полностью заменяет набор напоминаний. Без разрешения ничего не планирует. */
export async function scheduleReminders(reminders: Reminder[]): Promise<void> {
  if (!Notifications) return;
  const { granted } = await Notifications.getPermissionsAsync();
  await cancelReminders();
  if (!granted) return;

  for (const r of reminders) {
    await Notifications.scheduleNotificationAsync({
      identifier: `reminder-${r.key}`,
      content: { title: r.title, body: r.body, data: { type: REMINDER_TYPE, screen: r.screen } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: r.date, channelId: CHANNEL_ID },
    });
  }
}

/** Нажатие на напоминание открывает нужный экран. */
export function onReminderTap(open: (screen: string) => void): () => void {
  if (!Notifications) return () => {};
  const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data as { type?: string; screen?: string } | undefined;
    if (data?.type === REMINDER_TYPE && data.screen) open(data.screen);
  });
  return () => subscription.remove();
}
