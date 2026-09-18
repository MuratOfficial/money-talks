import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Href, useRouter } from 'expo-router';
import useFinancialStore from '@/hooks/useStore';
import FadeInView from '@/app/components/FadeInView';
import ScoreRing from '@/app/components/ScoreRing';
import { Motion, Opacity } from '@/constants/design';
import { HEALTH_LEVELS, computeFinancialHealth, weakestHint } from '@/utils/financialHealth';
import { goBack } from '@/utils/navigation';

/** «Финансовое здоровье»: балл, уровень, составляющие и чек-лист «Как улучшить». */
const HealthScreen = () => {
  const router = useRouter();
  const { theme, incomes, expences, passives, wallets, goals, currency } = useFinancialStore();

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-black' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondaryColor = isDark ? 'text-gray-400' : 'text-gray-600';
  const cardBgColor = isDark ? 'bg-white/10' : 'bg-gray-100';
  const trackColor = isDark ? 'bg-white/10' : 'bg-gray-200';
  const iconColor = isDark ? 'white' : '#11181C';

  const health = useMemo(
    () => computeFinancialHealth({ incomes, expences, passives, wallets, goals, currency }),
    [incomes, expences, passives, wallets, goals, currency]
  );
  const hint = weakestHint(health);
  const checklist = health.components.filter((c) => c.advice);

  return (
    <SafeAreaView edges={['top']} className={`flex-1 ${bgColor}`}>
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity activeOpacity={Opacity.press} onPress={() => goBack('/main/profile')}>
          <Ionicons name="chevron-back" size={24} color={iconColor} />
        </TouchableOpacity>
        <Text className={`${textColor} flex-1 text-center text-lg font-['SFProDisplaySemiBold'] mr-6`}>
          Финансовое здоровье
        </Text>
      </View>

      <FadeInView style={{ flex: 1 }}>
        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
          {/* Score */}
          <View className="items-center mt-2 mb-6">
            <ScoreRing score={health.score} color={health.level.color} size={140} strokeWidth={12} />
            <Text className="text-xl mt-3 font-['SFProDisplaySemiBold']" style={{ color: health.level.color }}>
              {health.level.title}
            </Text>
            <Text className={`${textSecondaryColor} text-sm font-['SFProDisplayRegular']`}>
              {health.score} из 100 баллов
            </Text>
          </View>

          {/* Levels scale */}
          <View className="flex-row mb-6">
            {HEALTH_LEVELS.map((level, i) => {
              const next = HEALTH_LEVELS[i + 1]?.from ?? 101;
              const active = health.level.title === level.title;
              return (
                <View key={level.title} className="flex-1 items-center" style={{ flex: next - level.from }}>
                  <View
                    className={`h-2 w-full ${i === 0 ? 'rounded-l-full' : ''} ${i === HEALTH_LEVELS.length - 1 ? 'rounded-r-full' : ''}`}
                    style={{ backgroundColor: level.color, opacity: active ? 1 : 0.35 }}
                  />
                  <Text
                    className={`text-[10px] mt-1 text-center font-['SFProDisplayRegular'] ${active ? textColor : textSecondaryColor}`}
                    numberOfLines={2}
                  >
                    {level.title}
                  </Text>
                </View>
              );
            })}
          </View>

          {hint && (
            <View className={`${cardBgColor} rounded-2xl p-4 mb-6 flex-row`}>
              <Ionicons name="sparkles-outline" size={20} color="#4CAF50" style={{ marginRight: 10, marginTop: 2 }} />
              <View className="flex-1">
                <Text className={`${textColor} text-sm font-['SFProDisplaySemiBold'] mb-1`}>ФинГид</Text>
                <Text className={`${textSecondaryColor} text-sm leading-5 font-['SFProDisplayRegular']`}>{hint}</Text>
              </View>
            </View>
          )}

          {/* Components */}
          <Text className={`${textColor} text-base mb-3 font-['SFProDisplaySemiBold']`}>Из чего складывается балл</Text>
          {health.components.map((c, index) => (
            <FadeInView key={c.id} delay={index * Motion.stagger}>
              <View className={`${cardBgColor} rounded-2xl p-4 mb-3`}>
                <View className="flex-row justify-between mb-1">
                  <Text className={`${textColor} text-sm font-['SFProDisplaySemiBold']`}>{c.title}</Text>
                  <Text className={`${textSecondaryColor} text-sm font-['SFProDisplayRegular']`}>
                    {c.points} / {c.max}
                  </Text>
                </View>
                <View className={`h-1.5 rounded-full overflow-hidden mb-2 ${trackColor}`}>
                  <View
                    className="h-full rounded-full"
                    style={{ width: `${(c.points / c.max) * 100}%`, backgroundColor: health.level.color }}
                  />
                </View>
                <Text className={`${textSecondaryColor} text-xs font-['SFProDisplayRegular']`}>{c.summary}</Text>
              </View>
            </FadeInView>
          ))}

          {/* Checklist */}
          <Text className={`${textColor} text-base mt-3 mb-3 font-['SFProDisplaySemiBold']`}>
            Как улучшить финансовое здоровье?
          </Text>
          {checklist.length === 0 ? (
            <Text className={`${textSecondaryColor} text-sm mb-6 font-['SFProDisplayRegular']`}>
              Все блоки на максимуме — так держать!
            </Text>
          ) : (
            checklist.map((c) => (
              <TouchableOpacity
                key={c.id}
                onPress={() => router.push(c.route as Href)}
                activeOpacity={Opacity.press}
                className={`${cardBgColor} rounded-2xl p-4 mb-3 flex-row items-center`}
              >
                <Ionicons name="ellipse-outline" size={20} color={health.level.color} style={{ marginRight: 12 }} />
                <Text className={`${textColor} flex-1 text-sm leading-5 font-['SFProDisplayRegular']`}>{c.advice}</Text>
                <Ionicons name="chevron-forward" size={18} color={iconColor} />
              </TouchableOpacity>
            ))
          )}
          <View className="h-6" />
        </ScrollView>
      </FadeInView>
    </SafeAreaView>
  );
};

export default HealthScreen;
