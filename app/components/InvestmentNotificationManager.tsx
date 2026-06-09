import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNotifications } from '@/hooks/useNotifications';
import useFinancialStore from '@/hooks/useStore';

/**
 * Компонент для управления уведомлениями об инвестициях
 */
const InvestmentNotificationManager: React.FC = () => {
  const { theme } = useFinancialStore();
  const {
    isAvailable,
    scheduleNotification,
    cancelAllNotifications,
    getAllScheduledNotifications,
  } = useNotifications();

  const [isScheduled, setIsScheduled] = useState(false);
  const [notificationId, setNotificationId] = useState<string | null>(null);

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-[#333333]' : 'bg-gray-100';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondaryColor = isDark ? 'text-gray-300' : 'text-gray-700';

  useEffect(() => {
    checkScheduledNotifications();
  }, []);

  const checkScheduledNotifications = async () => {
    const scheduled = await getAllScheduledNotifications();
    const investmentNotification = scheduled.find(
      (n: any) => n.content.data?.type === 'investment-tip'
    );
    if (investmentNotification) {
      setIsScheduled(true);
      setNotificationId(investmentNotification.identifier);
    }
  };

  const handleScheduleNotification = async () => {
    try {
      // Планируем уведомление через 24 часа
      const id = await scheduleNotification(
        '🎓 Не знаешь, с чего начать инвестировать?',
        'Смотри короткий видеоурок',
        86400, // 24 часа в секундах
        { 
          screen: '/main/invest',
          type: 'investment-tip'
        }
      );

      setNotificationId(id);
      setIsScheduled(true);

      Alert.alert(
        'Уведомление запланировано',
        'Вы получите напоминание через 24 часа'
      );
    } catch (error) {
      console.error('Error scheduling notification:', error);
      Alert.alert('Ошибка', 'Не удалось запланировать уведомление');
    }
  };

  const handleCancelNotification = async () => {
    try {
      await cancelAllNotifications();
      setIsScheduled(false);
      setNotificationId(null);

      Alert.alert(
        'Уведомления отменены',
        'Все запланированные уведомления удалены'
      );
    } catch (error) {
      console.error('Error canceling notifications:', error);
      Alert.alert('Ошибка', 'Не удалось отменить уведомления');
    }
  };

  return (
    <View className={`${bgColor} rounded-xl p-4 mb-4`}>
      <View className="flex-row items-center mb-3">
        <MaterialIcons
          name="notifications-active"
          size={24}
          color="#4CAF50"
        />
        <Text className={`${textColor} text-lg ml-2 font-['SFProDisplaySemiBold']`}>
          Напоминания об инвестициях
        </Text>
      </View>

      <Text className={`${textSecondaryColor} text-sm mb-4 font-['SFProDisplayRegular']`}>
        Получайте полезные напоминания о том, как начать инвестировать
      </Text>

      {!isAvailable ? (
        <View className="bg-yellow-100 dark:bg-yellow-900/30 rounded-lg p-3 flex-row items-start">
          <MaterialIcons name="info" size={20} color="#F59E0B" style={{ marginRight: 8, marginTop: 2 }} />
          <View className="flex-1">
            <Text className="text-yellow-700 dark:text-yellow-400 text-sm font-semibold mb-1 font-['SFProDisplaySemibold']">
              Требуется Development Build
            </Text>
            <Text className="text-yellow-700 dark:text-yellow-400 text-xs font-['SFProDisplayRegular']">
              Уведомления не работают в Expo Go. Для использования этой функции соберите Development Build приложения.
            </Text>
          </View>
        </View>
      ) : isScheduled ? (
        <View>
          <View className="bg-green-100 dark:bg-green-900/30 rounded-lg p-3 mb-3 flex-row items-center">
            <MaterialIcons name="check-circle" size={20} color="#10B981" />
            <Text className="text-green-700 dark:text-green-400 text-sm ml-2 flex-1 font-['SFProDisplayRegular']">
              Уведомление запланировано
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleCancelNotification}
            className="bg-red-500 rounded-lg py-3 items-center"
            activeOpacity={0.8}
          >
            <Text className="text-white text-sm font-semibold font-['SFProDisplayRegular']">
              Отменить уведомления
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="space-y-2">
          <TouchableOpacity
            onPress={handleScheduleNotification}
            className="bg-[#4CAF50] rounded-xl py-3 items-center"
            activeOpacity={0.7}
          >
            <Text className="text-white text-sm font-['SFProDisplaySemiBold']">
              Запланировать напоминание
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default InvestmentNotificationManager;
