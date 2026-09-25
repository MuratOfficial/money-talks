import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import useFinancialStore from '@/hooks/useStore';
import FadeInView from '@/app/components/FadeInView';
import { Opacity } from '@/constants/design';
import { goBack } from '@/utils/navigation';
import { fetchTips, getCachedTips, Tip } from '@/services/api';
import { GLOSSARY_TIP_PAGE, GlossaryTerm, INVEST_GLOSSARY } from '@/constants/investGlossary';

/**
 * Термины из админки. Общий фолбэк fetchTips (подсказка со страницей
 * `default`) сюда не годится — отбрасываем его и показываем встроенный список.
 */
const termsFromTips = (tips: Tip[]): GlossaryTerm[] =>
  tips
    .filter((tip) => tip.page === GLOSSARY_TIP_PAGE)
    .map((tip) => ({ term: tip.title, definition: tip.content }));

const normalize = (value: string) => value.trim().toLowerCase();

/** Глоссарий инвестора: список терминов с поиском. */
const GlossaryScreen = () => {
  const { theme } = useFinancialStore();
  const isDark = theme === 'dark';

  const bgColor = isDark ? 'bg-black' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondaryColor = isDark ? 'text-gray-400' : 'text-gray-600';
  const cardBgColor = isDark ? 'bg-white/10' : 'bg-gray-100';
  const inputBgColor = isDark ? 'bg-white/10' : 'bg-gray-100';
  const iconColor = isDark ? 'white' : '#11181C';

  const cachedTerms = termsFromTips(getCachedTips(GLOSSARY_TIP_PAGE) || []);
  const [terms, setTerms] = useState<GlossaryTerm[]>(cachedTerms.length > 0 ? cachedTerms : INVEST_GLOSSARY);
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchTips(GLOSSARY_TIP_PAGE)
      .then((tips) => {
        if (cancelled) return;
        const fromServer = termsFromTips(tips);
        if (fromServer.length > 0) setTerms(fromServer);
      })
      .catch((error) => console.warn('Failed to load glossary:', error));
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const needle = normalize(query);
    if (!needle) return terms;
    return terms.filter(
      (item) => normalize(item.term).includes(needle) || normalize(item.definition).includes(needle)
    );
  }, [terms, query]);

  return (
    <SafeAreaView edges={['top']} className={`flex-1 ${bgColor}`}>
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity activeOpacity={Opacity.press} onPress={() => goBack('/main/invest')}>
          <Ionicons name="chevron-back" size={24} color={iconColor} />
        </TouchableOpacity>
        <Text className={`${textColor} flex-1 text-center text-lg font-['SFProDisplaySemiBold'] mr-6`}>
          Словарь инвестора
        </Text>
      </View>

      <View className="px-4 pb-3">
        <View className={`${inputBgColor} rounded-xl px-3 flex-row items-center`}>
          <Ionicons name="search" size={18} color={isDark ? '#9CA3AF' : '#6B7280'} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Найти термин"
            placeholderTextColor={isDark ? '#666' : '#999'}
            className={`flex-1 px-2 py-3 ${textColor} text-base font-['SFProDisplayRegular']`}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} activeOpacity={Opacity.press}>
              <Ionicons name="close-circle" size={18} color={isDark ? '#9CA3AF' : '#6B7280'} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FadeInView style={{ flex: 1 }}>
        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {filtered.map((item) => {
            const isOpen = expanded === item.term;
            return (
              <TouchableOpacity
                key={item.term}
                activeOpacity={Opacity.press}
                onPress={() => setExpanded(isOpen ? null : item.term)}
                className={`${cardBgColor} rounded-xl p-4 mb-2`}
              >
                <View className="flex-row items-center justify-between">
                  <Text className={`${textColor} text-base font-['SFProDisplaySemiBold'] flex-1 mr-3`}>{item.term}</Text>
                  <Ionicons
                    name={isOpen ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={isDark ? '#9CA3AF' : '#6B7280'}
                  />
                </View>
                {isOpen && (
                  <Text className={`${textSecondaryColor} text-sm leading-6 mt-2 font-['SFProDisplayRegular']`}>
                    {item.definition}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}

          {filtered.length === 0 && (
            <Text className={`${textSecondaryColor} text-sm text-center mt-6 font-['SFProDisplayRegular']`}>
              Ничего не нашлось. Попробуйте другое слово или спросите ФинГида в подсказках раздела.
            </Text>
          )}

          <View className="h-10" />
        </ScrollView>
      </FadeInView>
    </SafeAreaView>
  );
};

export default GlossaryScreen;
