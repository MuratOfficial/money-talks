import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ImageSourcePropType } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import useFinancialStore from '@/hooks/useStore';
import FadeInView from '@/app/components/FadeInView';
import { Motion, Opacity } from '@/constants/design';
import { AchievementId, computeAchievements } from '@/utils/achievements';

const IMAGES: Record<AchievementId, ImageSourcePropType> = {
  'first-steps': require('../../../assets/images/ach1.png'),
  discipline: require('../../../assets/images/ach2.png'),
  'month-control': require('../../../assets/images/ach3.png'),
  optimizer: require('../../../assets/images/ach4.png'),
  saver: require('../../../assets/images/ach5.png'),
  'first-goal': require('../../../assets/images/ach6.png'),
};

const AchievementsScreen = () => {
  const router = useRouter();
  const { theme, incomes, expences, wallets, goals } = useFinancialStore();

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-black' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondaryColor = isDark ? 'text-gray-400' : 'text-gray-600';
  const cardBgColor = isDark ? 'bg-white/10' : 'bg-gray-100';
  const trackColor = isDark ? 'bg-white/10' : 'bg-gray-200';
  const iconColor = isDark ? 'white' : '#11181C';

  const achievements = useMemo(
    () => computeAchievements({ incomes, expences, wallets, goals }),
    [incomes, expences, wallets, goals]
  );
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <SafeAreaView edges={['top']} className={`flex-1 ${bgColor}`}>
      <FadeInView style={{ flex: 1 }}>
        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
          <View className="flex-row items-center py-3 pb-2 w-full">
            <TouchableOpacity activeOpacity={Opacity.press} onPress={() => router.replace('/main/profile')}>
              <Ionicons name="chevron-back" size={24} color={iconColor} />
            </TouchableOpacity>
            <Text className={`${textColor} flex-1 text-center text-lg font-['SFProDisplaySemiBold'] mr-6`}>
              Достижения
            </Text>
          </View>

          <Text className={`${textSecondaryColor} text-sm text-center mb-6 font-['SFProDisplayRegular']`}>
            Получено {unlockedCount} из {achievements.length}
          </Text>

          {achievements.map((a, index) => {
            const percent = a.target > 0 ? Math.min(100, (a.current / a.target) * 100) : 0;
            return (
              <FadeInView key={a.id} delay={index * Motion.stagger}>
                <View className={`${cardBgColor} rounded-2xl p-4 mb-3 flex-row items-center`}>
                  <View style={{ opacity: a.unlocked ? 1 : Opacity.disabled }}>
                    <Image source={IMAGES[a.id]} style={{ width: 64, height: 64 }} resizeMode="contain" />
                    {!a.unlocked && (
                      <View className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-gray-700 items-center justify-center">
                        <Ionicons name="lock-closed" size={12} color="white" />
                      </View>
                    )}
                  </View>

                  <View className="flex-1 ml-4">
                    <View className="flex-row items-center justify-between mb-1">
                      <Text className={`${textColor} text-base font-['SFProDisplaySemiBold']`}>{a.title}</Text>
                      {a.unlocked && <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />}
                    </View>
                    <Text className={`${textSecondaryColor} text-xs mb-2 leading-4 font-['SFProDisplayRegular']`}>
                      {a.description}
                    </Text>
                    {!a.unlocked && (
                      <View className={`h-1.5 rounded-full overflow-hidden mb-1 ${trackColor}`}>
                        <View className="h-full rounded-full bg-[#4CAF50]" style={{ width: `${percent}%` }} />
                      </View>
                    )}
                    <Text
                      className={`text-xs font-['SFProDisplayRegular'] ${a.unlocked ? 'text-[#4CAF50]' : textSecondaryColor}`}
                    >
                      {a.progressLabel}
                    </Text>
                  </View>
                </View>
              </FadeInView>
            );
          })}
          <View className="h-6" />
        </ScrollView>
      </FadeInView>
    </SafeAreaView>
  );
};

export default AchievementsScreen;
