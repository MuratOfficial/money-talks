import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import useFinancialStore from '@/hooks/useStore';
import { useGamification } from '@/hooks/useGamification';
import { Opacity } from '@/constants/design';
import FinGuide from './FinGuide';

/** ТЗ: «прогресс-бар челленджей на главной». */
const ChallengeBanner = () => {
  const router = useRouter();
  const theme = useFinancialStore((s) => s.theme);
  const { challenges, level, xp, boxes } = useGamification();
  const isDark = theme === 'dark';

  const completed = challenges.find((c) => c.status === 'completed');
  const active = challenges.find((c) => c.status === 'active');
  const shown = completed ?? active;

  const title = completed
    ? `«${completed.def.title}» выполнен — заберите награду`
    : active
      ? active.def.title
      : boxes > 0
        ? `Сундуков к открытию: ${boxes}`
        : 'Начните челлендж и получите монеты';
  const subtitle = shown
    ? `${shown.current} из ${shown.target} ${shown.def.unit}${active && !completed ? ` · осталось ${active.daysLeft} дн.` : ''}`
    : `${level.level.title} · ${xp.total} XP`;
  const progress = shown ? shown.current / shown.target : level.progress;

  return (
    <TouchableOpacity
      onPress={() => router.push('/main/profile/progress')}
      activeOpacity={Opacity.press}
      className={`${isDark ? 'bg-white/10' : 'bg-white/70'} rounded-2xl p-3 mb-6 flex-row items-center`}
    >
      <FinGuide size={44} mood={completed ? 'celebrate' : 'happy'} animated={false} />
      <View className="flex-1 ml-3">
        <Text className={`${isDark ? 'text-white' : 'text-gray-900'} text-sm font-['SFProDisplaySemiBold']`} numberOfLines={1}>
          {title}
        </Text>
        <Text className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-xs mb-1.5 font-['SFProDisplayRegular']`}>{subtitle}</Text>
        <View className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
          <View className="h-full rounded-full bg-[#4CAF50]" style={{ width: `${Math.round(Math.min(1, progress) * 100)}%` }} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ChallengeBanner;
