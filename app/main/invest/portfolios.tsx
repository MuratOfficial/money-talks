import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import useFinancialStore from '@/hooks/useStore';
import FadeInView from '@/app/components/FadeInView';
import { Opacity } from '@/constants/design';
import { goBack } from '@/utils/navigation';
import { fetchInvestContent, getCachedInvestContent } from '@/services/api';
import {
  DISCLAIMER,
  FALLBACK_PORTFOLIO_TEMPLATES,
  PortfolioTemplate,
  SLICE_COLORS,
  templatesForProfile,
} from '@/constants/portfolioTemplates';
import { riskProfileByPercentage } from '@/constants/riskProfiles';

/** Полоса состава портфеля: доли одна за другой, в сумме — 100%. */
const AllocationBar: React.FC<{ template: PortfolioTemplate }> = ({ template }) => (
  <View className="flex-row h-2 rounded-full overflow-hidden mt-3">
    {template.allocation.map((slice, index) => (
      <View
        key={`${slice.label}-${index}`}
        style={{ flex: Math.max(slice.percent, 1), backgroundColor: SLICE_COLORS[index % SLICE_COLORS.length] }}
      />
    ))}
  </View>
);

/**
 * Блок «Первые инвестиции»: готовые шаблоны портфелей. Список приходит из
 * админки, а при недоступной сети берётся встроенный (constants/portfolioTemplates).
 */
const PortfolioTemplatesScreen = () => {
  const { theme, riskProfile } = useFinancialStore();
  const isDark = theme === 'dark';

  const bgColor = isDark ? 'bg-black' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondaryColor = isDark ? 'text-gray-400' : 'text-gray-600';
  const cardBgColor = isDark ? 'bg-white/10' : 'bg-gray-100';
  const iconColor = isDark ? 'white' : '#11181C';

  const cached = getCachedInvestContent();
  const [templates, setTemplates] = useState<PortfolioTemplate[]>(cached?.templates || FALLBACK_PORTFOLIO_TEMPLATES);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchInvestContent().then((content) => {
      if (!cancelled) setTemplates(content.templates);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const profileTitle = riskProfile ? riskProfileByPercentage(riskProfile.percentage).title : null;
  const ordered = useMemo(() => templatesForProfile(templates, profileTitle), [templates, profileTitle]);

  return (
    <SafeAreaView edges={['top']} className={`flex-1 ${bgColor}`}>
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity activeOpacity={Opacity.press} onPress={() => goBack('/main/invest')}>
          <Ionicons name="chevron-back" size={24} color={iconColor} />
        </TouchableOpacity>
        <Text className={`${textColor} flex-1 text-center text-lg font-['SFProDisplaySemiBold'] mr-6`}>
          Первые инвестиции
        </Text>
      </View>

      <FadeInView style={{ flex: 1 }}>
        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
          <Text className={`${textSecondaryColor} text-sm leading-5 mb-4 font-['SFProDisplayRegular']`}>
            {profileTitle
              ? `Ваш профиль — «${profileTitle}». Подходящий шаблон показан первым, остальные — чтобы было с чем сравнить.`
              : 'Пройдите тест на риск-профиль, и мы подскажем, какой шаблон вам ближе.'}
          </Text>

          {ordered.map((template) => {
            const isMine = profileTitle !== null && template.riskProfile === profileTitle;
            const isOpen = expanded === template.id;

            return (
              <View key={template.id} className={`${cardBgColor} rounded-xl p-4 mb-3`}>
                <TouchableOpacity
                  activeOpacity={Opacity.press}
                  onPress={() => setExpanded(isOpen ? null : template.id)}
                >
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1 mr-3">
                      <Text className={`${textColor} text-base font-['SFProDisplaySemiBold']`}>{template.title}</Text>
                      {template.riskProfile && (
                        <Text
                          className="text-xs mt-0.5 font-['SFProDisplayRegular']"
                          style={{ color: isMine ? '#4CAF50' : isDark ? '#9CA3AF' : '#6B7280' }}
                        >
                          {isMine ? `Ваш профиль · ${template.riskProfile}` : template.riskProfile}
                        </Text>
                      )}
                    </View>
                    <Ionicons
                      name={isOpen ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={isDark ? '#9CA3AF' : '#6B7280'}
                    />
                  </View>

                  <AllocationBar template={template} />

                  <View className="flex-row flex-wrap mt-3">
                    {template.allocation.map((slice, index) => (
                      <View key={`${slice.label}-${index}`} className="flex-row items-center mr-3 mb-1">
                        <View
                          className="w-2 h-2 rounded-full mr-1.5"
                          style={{ backgroundColor: SLICE_COLORS[index % SLICE_COLORS.length] }}
                        />
                        <Text className={`${textSecondaryColor} text-xs font-['SFProDisplayRegular']`}>
                          {slice.percent}% — {slice.label}
                        </Text>
                      </View>
                    ))}
                  </View>
                </TouchableOpacity>

                {isOpen && (
                  <View className="mt-3">
                    <Text className={`${textSecondaryColor} text-sm leading-5 font-['SFProDisplayRegular']`}>
                      {template.description}
                    </Text>

                    {!!template.horizon && (
                      <View className="flex-row justify-between mt-3">
                        <Text className={`${textSecondaryColor} text-xs font-['SFProDisplayRegular']`}>Горизонт</Text>
                        <Text className={`${textColor} text-xs font-['SFProDisplayRegular']`}>{template.horizon}</Text>
                      </View>
                    )}
                    {!!template.expectedReturn && (
                      <View className="flex-row justify-between mt-1">
                        <Text className={`${textSecondaryColor} text-xs font-['SFProDisplayRegular']`}>Доходность</Text>
                        <Text className={`${textColor} text-xs font-['SFProDisplayRegular'] flex-1 text-right ml-3`}>
                          {template.expectedReturn}
                        </Text>
                      </View>
                    )}

                    {!!template.risks && (
                      <View className="flex-row mt-3">
                        <Ionicons name="warning-outline" size={16} color="#F59E0B" style={{ marginRight: 8, marginTop: 1 }} />
                        <Text className={`${textSecondaryColor} text-xs leading-5 flex-1 font-['SFProDisplayRegular']`}>
                          {template.risks}
                        </Text>
                      </View>
                    )}
                    {!!template.firstStep && (
                      <View className="flex-row mt-2">
                        <Ionicons name="footsteps-outline" size={16} color="#4CAF50" style={{ marginRight: 8, marginTop: 1 }} />
                        <Text className={`${textSecondaryColor} text-xs leading-5 flex-1 font-['SFProDisplayRegular']`}>
                          {template.firstStep}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            );
          })}

          <Text className={`${textSecondaryColor} text-xs leading-5 mt-2 mb-10 font-['SFProDisplayRegular']`}>
            {DISCLAIMER}
          </Text>
        </ScrollView>
      </FadeInView>
    </SafeAreaView>
  );
};

export default PortfolioTemplatesScreen;
