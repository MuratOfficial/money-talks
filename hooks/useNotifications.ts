import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { router } from 'expo-router';
import Constants from 'expo-constants';

// Проверка доступности expo-notifications
let Notifications: any = null;
let isNotificationsAvailable = false;

try {
    Notifications = require('expo-notifications');
    isNotificationsAvailable = true;

    // Настройка обработчика уведомлений только если модуль доступен
    if (Notifications && !Constants.appOwnership) {
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: true,
                shouldPlaySound: true,
                shouldSetBadge: false,
            }),
        });
    }
} catch (error) {
    console.warn('expo-notifications не доступен. Требуется Development Build.');
    isNotificationsAvailable = false;
}

export interface ScheduledNotification {
    id: string;
    title: string;
    body: string;
    data?: any;
    trigger: {
        seconds: number;
        repeats?: boolean;
    };
}

export const useNotifications = () => {
    const [expoPushToken, setExpoPushToken] = useState<string>('');
    const [notification, setNotification] = useState<any>(null);
    const [isAvailable, setIsAvailable] = useState(isNotificationsAvailable);
    const notificationListener = useRef<any>();
    const responseListener = useRef<any>();

    useEffect(() => {
        if (!isNotificationsAvailable || !Notifications) {
            console.warn('Уведомления недоступны в Expo Go. Используйте Development Build.');
            return;
        }

        registerForPushNotificationsAsync().then(token => {
            if (token) {
                setExpoPushToken(token);
            }
        });

        // Слушатель получения уведомлений
        notificationListener.current = Notifications.addNotificationReceivedListener((notification: any) => {
            setNotification(notification);
        });

        // Слушатель нажатия на уведомление
        responseListener.current = Notifications.addNotificationResponseReceivedListener((response: any) => {
            const data = response.notification.request.content.data;

            // Навигация по данным из уведомления
            if (data?.screen) {
                router.push(data.screen as any);
            }
        });

        return () => {
            if (notificationListener.current) {
                Notifications.removeNotificationSubscription(notificationListener.current);
            }
            if (responseListener.current) {
                Notifications.removeNotificationSubscription(responseListener.current);
            }
        };
    }, []);

    /**
     * Запланировать локальное уведомление
     */
    const scheduleNotification = async (
        title: string,
        body: string,
        seconds: number,
        data?: any
    ): Promise<string> => {
        if (!isNotificationsAvailable || !Notifications) {
            throw new Error('Уведомления недоступны. Требуется Development Build.');
        }

        const id = await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                data,
                sound: true,
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                seconds,
            } as any,
        });
        return id;
    };

    /**
     * Запланировать повторяющееся уведомление
     */
    const scheduleRepeatingNotification = async (
        title: string,
        body: string,
        seconds: number,
        data?: any
    ): Promise<string> => {
        if (!isNotificationsAvailable || !Notifications) {
            throw new Error('Уведомления недоступны. Требуется Development Build.');
        }

        const id = await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                data,
                sound: true,
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                seconds,
                repeats: true,
            } as any,
        });
        return id;
    };

    /**
     * Отменить уведомление по ID
     */
    const cancelNotification = async (notificationId: string) => {
        if (!isNotificationsAvailable || !Notifications) {
            return;
        }
        await Notifications.cancelScheduledNotificationAsync(notificationId);
    };

    /**
     * Отменить все запланированные уведомления
     */
    const cancelAllNotifications = async () => {
        if (!isNotificationsAvailable || !Notifications) {
            return;
        }
        await Notifications.cancelAllScheduledNotificationsAsync();
    };

    /**
     * Получить все запланированные уведомления
     */
    const getAllScheduledNotifications = async () => {
        if (!isNotificationsAvailable || !Notifications) {
            return [];
        }
        return await Notifications.getAllScheduledNotificationsAsync();
    };

    /**
     * Отправить немедленное уведомление
     */
    const sendImmediateNotification = async (
        title: string,
        body: string,
        data?: any
    ) => {
        if (!isNotificationsAvailable || !Notifications) {
            throw new Error('Уведомления недоступны. Требуется Development Build.');
        }

        await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                data,
                sound: true,
            },
            trigger: null, // Немедленно
        });
    };

    return {
        expoPushToken,
        notification,
        isAvailable,
        scheduleNotification,
        scheduleRepeatingNotification,
        cancelNotification,
        cancelAllNotifications,
        getAllScheduledNotifications,
        sendImmediateNotification,
    };
};

/**
 * Регистрация для получения пуш-уведомлений
 */
async function registerForPushNotificationsAsync() {
    if (!isNotificationsAvailable || !Notifications) {
        return undefined;
    }

    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
    }

    try {
        token = (await Notifications.getExpoPushTokenAsync()).data;
        console.log('Expo Push Token:', token);
    } catch (error) {
        console.error('Error getting push token:', error);
    }

    return token;
}

export default useNotifications;
