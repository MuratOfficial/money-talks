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

  const handleTestNotification = async () => {
    try {
      // Тестовое уведомление через 5 секунд
      await scheduleNotification(
        '🎓 Не знаешь, с чего начать инвестировать?',
        'Смотри короткий видеоурок',
        5,
        { 
          screen: '/main/invest',
          type: 'investment-tip'
        }
      );

      Alert.alert(
        'Тестовое уведомление',
        'Вы получите уведомление через 5 секунд'
      );
    } catch (error) {
      console.error('Error scheduling test notification:', error);
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
          color={isDark ? '#60A5FA' : '#3B82F6'} 
        />
        <Text className={`${textColor} text-lg font-semibold ml-2 font-['SFProDisplaySemibold']`}>
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
            className="bg-blue-600 rounded-lg py-3 items-center mb-2"
            activeOpacity={0.8}
          >
            <Text className="text-white text-sm font-semibold font-['SFProDisplayRegular']">
              Запланировать напоминание
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleTestNotification}
            className="bg-gray-500 rounded-lg py-3 items-center"
            activeOpacity={0.8}
          >
            <Text className="text-white text-sm font-semibold font-['SFProDisplayRegular']">
              Тест (через 5 сек)
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default InvestmentNotificationManager;
