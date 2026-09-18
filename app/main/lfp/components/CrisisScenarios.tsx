import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useFinancialStore from '@/hooks/useStore';
import ChatGPTFeature from '@/app/components/ChatGPTFeature';
import { Opacity } from '@/constants/design';
import {
  CRISIS_SCENARIOS,
  LEVEL_COLORS,
  buildCrisisInput,
  buildStrategies,
  evaluateScenario,
  hasCrisisData,
} from '@/utils/crisisScenarios';

/**
 * Блок «Что если» на экране ЛФП: пересчитывает план под кризисный сценарий
 * и предлагает конкретные шаги. Считается по данным из стора — ничего
 * дополнительно вводить не нужно.
 */
const CrisisScenarios: React.FC = () => {
  const { theme, incomes, expences, passives, wallets, currency, formatAmount } = useFinancialStore();
  const isDark = theme === 'dark';

  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondaryColor = isDark ? 'text-gray-400' : 'text-gray-600';
  const cardBgColor = isDark ? 'bg-white/10' : 'bg-gray-100';
  const chipBorder = isDark ? 'border-white/20' : 'border-gray-300';

  const [scenarioId, setScenarioId] = useState(CRISIS_SCENARIOS[0].id);
  const [chatVisible, setChatVisible] = useState(false);

  const input = useMemo(
    () =>
      buildCrisisInput({
        incomes: incomes || [],
        expences: expences || [],
        passives: passives || [],
        wallets: wallets || [],
        currency,
      }),
    [incomes, expences, passives, wallets, currency]
  );

  const scenario = CRISIS_SCENARIOS.find((s) => s.id === scenarioId) || CRISIS_SCENARIOS[0];
  const result = useMemo(() => evaluateScenario(input, scenario), [input, scenario]);
  const strategies = useMemo(() => buildStrategies(input, result, formatAmount), [input, result, formatAmount]);

  // Без доходов и расходов считать нечего — блок только запутает.
  if (!hasCrisisData(input)) return null;

  const levelColor = LEVEL_COLORS[result.level];
  // Полоса устойчивости: полная — это полгода без дохода.
  const barWidth = result.monthsCovered === null ? 100 : Math.min(100, Math.round((result.monthsCovered / 6) * 100));

  const chatContext = [
    `Сценарий: ${scenario.title}. ${scenario.description}`,
    `Доход в месяц: ${formatAmount(result.income)}, расходы: ${formatAmount(result.expense)}, дельта: ${formatAmount(result.delta)}.`,
    `Обязательные расходы: ${formatAmount(input.requiredExpense)}, деньги на счетах: ${formatAmount(input.liquidSavings)}.`,
    result.monthsCovered === null
      ? 'Дефицита в этом сценарии нет.'
      : `Накоплений хватит примерно на ${result.monthsCovered} месяцев.`,
    'Подскажи, что делать в такой ситуации по шагам.',
  ].join(' ');

  return (
    <View className="mb-6">
      <Text className={`${textSecondaryColor} text-sm font-['SFProDisplayRegular'] mb-1`}>
        Что если…
      </Text>
      <Text className={`${textSecondaryColor} text-xs font-['SFProDisplayRegular'] mb-3`}>
        Проверьте план на кризис: приложение пересчитает дельту и срок жизни накоплений.
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 8 }}
        className="mb-3"
      >
        {CRISIS_SCENARIOS.map((item) => {
          const active = item.id === scenario.id;
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => setScenarioId(item.id)}
              activeOpacity={Opacity.press}
              className={`px-3 py-1.5 mr-2 rounded-2xl border ${active ? 'border-[#4CAF50] bg-[#4CAF50]/10' : chipBorder}`}
            >
              <Text
                className={`text-xs font-['SFProDisplayRegular'] ${active ? 'text-[#4CAF50]' : textSecondaryColor}`}
              >
                {item.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View className={`p-3 rounded-xl ${cardBgColor}`}>
        <Text className={`${textSecondaryColor} text-xs leading-5 mb-3 font-['SFProDisplayRegular']`}>
          {scenario.description}
        </Text>

        <View className="flex-row justify-between items-center mb-2">
          <Text className={`${textColor} text-sm font-['SFProDisplayRegular']`}>Доход</Text>
          <Text className={`${textColor} text-sm font-['SFProDisplayRegular']`}>{formatAmount(result.income)}</Text>
        </View>
        <View className="flex-row justify-between items-center mb-2">
          <Text className={`${textColor} text-sm font-['SFProDisplayRegular']`}>Расходы</Text>
          <Text className={`${textColor} text-sm font-['SFProDisplayRegular']`}>{formatAmount(result.expense)}</Text>
        </View>
        <View className="flex-row justify-between items-center">
          <Text className={`${textColor} text-sm font-['SFProDisplayRegular']`}>Дельта</Text>
          <Text
            className="text-sm font-['SFProDisplaySemiBold']"
            style={{ color: result.delta >= 0 ? '#4CAF50' : '#EF4444' }}
          >
            {formatAmount(result.delta)}
          </Text>
        </View>

        <View className={`h-1.5 rounded-full overflow-hidden mt-4 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
          <View className="h-full rounded-full" style={{ width: `${barWidth}%`, backgroundColor: levelColor }} />
        </View>
        <Text className="text-xs mt-2 font-['SFProDisplaySemiBold']" style={{ color: levelColor }}>
          {result.summary}
        </Text>
        {result.monthsCovered !== null && (
          <Text className={`${textSecondaryColor} text-xs mt-1 font-['SFProDisplayRegular']`}>
            Полная полоса — полгода жизни без дохода. Дефицит {formatAmount(result.gap)} в месяц.
          </Text>
        )}
      </View>

      {strategies.length > 0 && (
        <View className={`p-3 rounded-xl mt-3 ${cardBgColor}`}>
          <Text className={`${textColor} text-sm font-['SFProDisplaySemiBold'] mb-2`}>Что можно сделать</Text>
          {strategies.map((strategy, index) => (
            <View key={strategy.id} className={`flex-row ${index > 0 ? 'mt-3' : ''}`}>
              <Ionicons name="arrow-forward-circle-outline" size={18} color="#4CAF50" style={{ marginRight: 8, marginTop: 1 }} />
              <View className="flex-1">
                <Text className={`${textColor} text-sm font-['SFProDisplayRegular']`}>{strategy.title}</Text>
                <Text className={`${textSecondaryColor} text-xs leading-5 mt-0.5 font-['SFProDisplayRegular']`}>
                  {strategy.detail}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity
        onPress={() => setChatVisible(true)}
        activeOpacity={Opacity.press}
        className="flex-row items-center justify-center mt-3 py-3 rounded-xl border border-[#4CAF50]"
      >
        <Ionicons name="sparkles-outline" size={16} color="#4CAF50" style={{ marginRight: 8 }} />
        <Text className="text-[#4CAF50] text-sm font-['SFProDisplayRegular']">Спросить ФинГида о сценарии</Text>
      </TouchableOpacity>

      <ChatGPTFeature
        visible={chatVisible}
        onClose={() => setChatVisible(false)}
        title="ФинГид"
        context={chatContext}
      />
    </View>
  );
};

export default CrisisScenarios;
