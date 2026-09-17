import React, { useEffect, useState } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import useFinancialStore from '@/hooks/useStore';
import { useGamification } from '@/hooks/useGamification';
import { Opacity } from '@/constants/design';
import FinGuide from './FinGuide';

/**
 * Отмечает день входа (опыт за ежедневный вход) и поздравляет с новым уровнем:
 * ТЗ — «при достижении нового уровня всплывающее окно с анимацией».
 */
const LevelUpWatcher = () => {
  const { theme, isAuthenticated, lastSeenLevel, setLastSeenLevel, markActiveDay } = useFinancialStore();
  const { level } = useGamification();
  const [shownLevel, setShownLevel] = useState<number | null>(null);

  useEffect(() => {
    if (isAuthenticated) markActiveDay();
  }, [isAuthenticated, markActiveDay]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (level.level.index > lastSeenLevel) {
      setShownLevel(level.level.index);
    } else if (level.level.index < lastSeenLevel) {
      // Опыт мог уменьшиться (удалили записи) — просто запоминаем текущий уровень.
      setLastSeenLevel(level.level.index);
    }
  }, [isAuthenticated, level.level.index, lastSeenLevel, setLastSeenLevel]);

  const close = (openProgress: boolean) => {
    if (shownLevel !== null) setLastSeenLevel(shownLevel);
    setShownLevel(null);
    if (openProgress) router.replace('/main/profile/progress');
  };

  const isDark = theme === 'dark';

  return (
    <Modal visible={shownLevel !== null} transparent animationType="fade" onRequestClose={() => close(false)}>
      <View className="flex-1 bg-black/60 items-center justify-center px-8">
        <View className={`${isDark ? 'bg-gray-900' : 'bg-white'} rounded-3xl p-6 items-center w-full`}>
          <FinGuide size={110} mood="celebrate" />
          <Text className="text-[#4CAF50] text-sm mt-4 font-['SFProDisplaySemiBold']">Новый уровень!</Text>
          <Text className={`${isDark ? 'text-white' : 'text-gray-900'} text-2xl mt-1 font-['SFProDisplayBold']`}>{level.level.title}</Text>
          <Text className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm text-center mt-2 font-['SFProDisplayRegular']`}>
            {level.level.perks}. Бонус: 🪙 {level.level.bonusCoins}
            {level.level.index > 0 ? ' и сундук с наградой' : ''}.
          </Text>
          <TouchableOpacity onPress={() => close(true)} activeOpacity={Opacity.press} className="bg-[#4CAF50] rounded-xl py-3 w-full items-center mt-5">
            <Text className="text-white text-sm font-['SFProDisplaySemiBold']">Забрать награду</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => close(false)} activeOpacity={Opacity.press} className="py-3">
            <Text className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm font-['SFProDisplayRegular']`}>Позже</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default LevelUpWatcher;
