import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, LayoutChangeEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import useFinancialStore from '@/hooks/useStore';
import FadeInView from '@/app/components/FadeInView';
import { Opacity } from '@/constants/design';
import { goBack } from '@/utils/navigation';
import { DISCLAIMER } from '@/constants/portfolioTemplates';
import { growthMultiplier, simulateContributions } from '@/utils/investmentMath';

const GREEN = '#4CAF50';
const GRAY_LINE = '#94A3B8';
const CHART_HEIGHT = 170;

const YEARS_OPTIONS = [5, 10, 15, 20];
const RATE_OPTIONS = [5, 8, 10, 12];

/** Компактная подпись для оси: 1,2 млн / 350 тыс. */
const compact = (value: number) => {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${(abs / 1_000_000).toFixed(1).replace('.0', '')} млн`;
  if (abs >= 1_000) return `${Math.round(abs / 1_000)} тыс`;
  return `${Math.round(abs)}`;
};

/**
 * Симулятор регулярных вложений: две линии — портфель с доходностью и просто
 * накопления. Наглядно показывает, что даёт сложный процент на длинном сроке.
 */
const InvestmentSimulatorScreen = () => {
  const { theme, incomes, expences, formatAmount } = useFinancialStore();
  const isDark = theme === 'dark';

  const bgColor = isDark ? 'bg-black' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondaryColor = isDark ? 'text-gray-400' : 'text-gray-600';
  const cardBgColor = isDark ? 'bg-white/10' : 'bg-gray-100';
  const inputBgColor = isDark ? 'bg-white/10' : 'bg-gray-100';
  const chipBorder = isDark ? 'border-white/20' : 'border-gray-300';
  const iconColor = isDark ? 'white' : '#11181C';
  const gridColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)';

  // Свободные деньги в месяц — та самая дельта с экрана ЛФП.
  const freeMonthly = useMemo(() => {
    const income = (incomes || []).reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const expense = (expences || []).reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    return Math.max(0, Math.round(income - expense));
  }, [incomes, expences]);

  const [monthly, setMonthly] = useState(String(freeMonthly > 0 ? freeMonthly : 50_000));
  const [years, setYears] = useState(10);
  const [rate, setRate] = useState(10);
  const [chartWidth, setChartWidth] = useState(0);

  const monthlyValue = Math.max(0, Number(monthly.replace(/[^0-9]/g, '')) || 0);
  const result = useMemo(
    () => simulateContributions({ monthly: monthlyValue, years, annualRatePercent: rate }),
    [monthlyValue, years, rate]
  );
  const multiplier = growthMultiplier(result);

  const onChartLayout = (event: LayoutChangeEvent) => setChartWidth(event.nativeEvent.layout.width);

  const max = Math.max(result.value, result.invested, 1);
  const stepX = result.points.length > 1 && chartWidth > 0 ? chartWidth / (result.points.length - 1) : 0;
  const pointY = (value: number) => CHART_HEIGHT - (value / max) * CHART_HEIGHT;
  const toPolyline = (pick: (index: number) => number) =>
    result.points.map((_, index) => `${stepX * index},${pointY(pick(index))}`).join(' ');

  const chipClass = (active: boolean) =>
    `px-3 py-1.5 mr-2 rounded-2xl border ${active ? 'border-[#4CAF50] bg-[#4CAF50]/10' : chipBorder}`;
  const chipTextClass = (active: boolean) =>
    `text-xs font-['SFProDisplayRegular'] ${active ? 'text-[#4CAF50]' : textSecondaryColor}`;

  return (
    <SafeAreaView edges={['top']} className={`flex-1 ${bgColor}`}>
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity activeOpacity={Opacity.press} onPress={() => goBack('/main/invest')}>
          <Ionicons name="chevron-back" size={24} color={iconColor} />
        </TouchableOpacity>
        <Text className={`${textColor} flex-1 text-center text-lg font-['SFProDisplaySemiBold'] mr-6`}>
          Симулятор
        </Text>
      </View>

      <FadeInView style={{ flex: 1 }}>
        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Text className={`${textSecondaryColor} text-sm leading-5 mb-4 font-['SFProDisplayRegular']`}>
            Посмотрите, во что превращаются регулярные вложения, если не трогать их несколько лет.
          </Text>

          {/* Сумма в месяц */}
          <Text className={`${textSecondaryColor} text-sm mb-2 font-['SFProDisplayRegular']`}>
            Откладываю в месяц
          </Text>
          <TextInput
            value={monthly}
            onChangeText={(value) => setMonthly(value.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            className={`${inputBgColor} rounded-xl px-4 py-3 ${textColor} text-base font-['SFProDisplayRegular']`}
            placeholder="50000"
            placeholderTextColor={isDark ? '#666' : '#999'}
          />
          {freeMonthly > 0 && (
            <TouchableOpacity
              activeOpacity={Opacity.press}
              onPress={() => setMonthly(String(freeMonthly))}
              className="mt-2"
            >
              <Text className={`${textSecondaryColor} text-xs font-['SFProDisplayRegular']`}>
                По вашим данным свободно {formatAmount(freeMonthly)} в месяц — нажмите, чтобы подставить.
              </Text>
            </TouchableOpacity>
          )}

          {/* Срок */}
          <Text className={`${textSecondaryColor} text-sm mt-5 mb-2 font-['SFProDisplayRegular']`}>Срок</Text>
          <View className="flex-row">
            {YEARS_OPTIONS.map((value) => (
              <TouchableOpacity
                key={value}
                activeOpacity={Opacity.press}
                onPress={() => setYears(value)}
                className={chipClass(value === years)}
              >
                <Text className={chipTextClass(value === years)}>{value} лет</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Доходность */}
          <Text className={`${textSecondaryColor} text-sm mt-5 mb-2 font-['SFProDisplayRegular']`}>
            Ожидаемая доходность, % годовых
          </Text>
          <View className="flex-row">
            {RATE_OPTIONS.map((value) => (
              <TouchableOpacity
                key={value}
                activeOpacity={Opacity.press}
                onPress={() => setRate(value)}
                className={chipClass(value === rate)}
              >
                <Text className={chipTextClass(value === rate)}>{value}%</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Результат */}
          <View className={`p-4 rounded-xl mt-6 ${cardBgColor}`}>
            <View className="flex-row justify-between items-center mb-2">
              <Text className={`${textSecondaryColor} text-sm font-['SFProDisplayRegular']`}>Вложите сами</Text>
              <Text className={`${textColor} text-sm font-['SFProDisplayRegular']`}>{formatAmount(result.invested)}</Text>
            </View>
            <View className="flex-row justify-between items-center mb-2">
              <Text className={`${textSecondaryColor} text-sm font-['SFProDisplayRegular']`}>Заработает доходность</Text>
              <Text className="text-sm font-['SFProDisplayRegular']" style={{ color: GREEN }}>
                {formatAmount(result.profit)}
              </Text>
            </View>
            <View className="flex-row justify-between items-center pt-2 border-t" style={{ borderColor: gridColor }}>
              <Text className={`${textColor} text-base font-['SFProDisplaySemiBold']`}>Через {years} лет</Text>
              <Text className="text-base font-['SFProDisplaySemiBold']" style={{ color: GREEN }}>
                {formatAmount(result.value)}
              </Text>
            </View>
            {multiplier !== null && multiplier > 1 && (
              <Text className={`${textSecondaryColor} text-xs mt-2 font-['SFProDisplayRegular']`}>
                Это в {String(multiplier).replace('.', ',')} раза больше, чем вы внесли.
              </Text>
            )}
          </View>

          {/* График */}
          <View className={`p-4 rounded-xl mt-3 ${cardBgColor}`}>
            <View onLayout={onChartLayout}>
              {chartWidth > 0 && (
                <Svg width={chartWidth} height={CHART_HEIGHT}>
                  <Line x1={0} x2={chartWidth} y1={CHART_HEIGHT - 1} y2={CHART_HEIGHT - 1} stroke={gridColor} strokeWidth={1} />
                  <Polyline
                    points={toPolyline((index) => result.points[index].invested)}
                    fill="none"
                    stroke={GRAY_LINE}
                    strokeWidth={2}
                    strokeDasharray="4 4"
                  />
                  <Polyline
                    points={toPolyline((index) => result.points[index].value)}
                    fill="none"
                    stroke={GREEN}
                    strokeWidth={2.5}
                  />
                  <Circle
                    cx={stepX * (result.points.length - 1)}
                    cy={pointY(result.value)}
                    r={4}
                    fill={GREEN}
                  />
                </Svg>
              )}
            </View>
            <View className="flex-row justify-between mt-2">
              <Text className={`${textSecondaryColor} text-xs font-['SFProDisplayRegular']`}>сегодня</Text>
              <Text className={`${textSecondaryColor} text-xs font-['SFProDisplayRegular']`}>
                через {years} лет · {compact(result.value)}
              </Text>
            </View>
            <View className="flex-row items-center mt-3">
              <View className="w-3 h-0.5 mr-2" style={{ backgroundColor: GREEN }} />
              <Text className={`${textSecondaryColor} text-xs mr-4 font-['SFProDisplayRegular']`}>с инвестициями</Text>
              <View className="w-3 h-0.5 mr-2" style={{ backgroundColor: GRAY_LINE }} />
              <Text className={`${textSecondaryColor} text-xs font-['SFProDisplayRegular']`}>просто копить</Text>
            </View>
          </View>

          <Text className={`${textSecondaryColor} text-xs leading-5 mt-4 mb-10 font-['SFProDisplayRegular']`}>
            Расчёт предполагает, что доходность одинакова каждый месяц. В жизни она скачет, поэтому итог —
            ориентир, а не обещание. {DISCLAIMER}
          </Text>
        </ScrollView>
      </FadeInView>
    </SafeAreaView>
  );
};

export default InvestmentSimulatorScreen;
