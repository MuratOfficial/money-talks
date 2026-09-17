import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Line, Polyline, Rect } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import useFinancialStore from '@/hooks/useStore';
import { Opacity } from '@/constants/design';
import {
  PeriodKind,
  buildTrends,
  forecastGoals,
  negativeDeltaTwoMonths,
  percentChange,
} from '@/utils/analytics';

const GREEN = '#4CAF50';
const RED = '#EF4444';
const BLUE = '#3B82F6';
const CHART_HEIGHT = 150;
const LABEL_SPACE = 18;

/** Компактная сумма для подписей: 1,2 млн / 350 тыс. */
const compact = (value: number) => {
  const abs = Math.abs(value);
  const sign = value < 0 ? '−' : '';
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(1).replace('.0', '')} млн`;
  if (abs >= 1_000) return `${sign}${Math.round(abs / 1_000)} тыс`;
  return `${sign}${Math.round(abs)}`;
};

interface ChartProps {
  width: number;
  labels: string[];
  bars?: { values: number[]; color: string }[];
  lines?: { values: number[]; color: string }[];
  mutedColor: string;
  gridColor: string;
}

/**
 * Столбцы и линии на общей оси с нулём: дельта и капитал бывают
 * отрицательными, поэтому ось не всегда внизу.
 */
const TrendChart = ({ width, labels, bars = [], lines = [], mutedColor, gridColor }: ChartProps) => {
  const all = [...bars, ...lines].flatMap((s) => s.values);
  const max = Math.max(0, ...all);
  const min = Math.min(0, ...all);
  const range = max - min || 1;
  const plotHeight = CHART_HEIGHT - LABEL_SPACE;
  const y = (v: number) => ((max - v) / range) * plotHeight;
  const slot = width / labels.length;
  const barWidth = bars.length ? Math.min(14, (slot * 0.7) / bars.length) : 0;

  return (
    <View>
      <Svg width={width} height={CHART_HEIGHT}>
        <Line x1={0} x2={width} y1={y(0)} y2={y(0)} stroke={gridColor} strokeWidth={1} />
        {bars.map((series, si) =>
          series.values.map((v, i) => {
            const x = slot * i + slot / 2 - (barWidth * bars.length) / 2 + si * barWidth;
            const top = Math.min(y(v), y(0));
            return (
              <Rect
                key={`${si}-${i}`}
                x={x}
                y={top}
                width={barWidth - 2}
                height={Math.max(1, Math.abs(y(v) - y(0)))}
                rx={2}
                fill={series.color}
              />
            );
          })
        )}
        {lines.map((series, si) => (
          <React.Fragment key={si}>
            <Polyline
              points={series.values.map((v, i) => `${slot * i + slot / 2},${y(v)}`).join(' ')}
              fill="none"
              stroke={series.color}
              strokeWidth={2}
            />
            {series.values.map((v, i) => (
              <Circle key={i} cx={slot * i + slot / 2} cy={y(v)} r={3} fill={series.color} />
            ))}
          </React.Fragment>
        ))}
      </Svg>
      <View className="flex-row" style={{ marginTop: -LABEL_SPACE + 4 }}>
        {labels.map((label) => (
          <Text key={label} style={{ width: slot, color: mutedColor }} className="text-[10px] text-center font-['SFProDisplayRegular']">
            {label}
          </Text>
        ))}
      </View>
    </View>
  );
};

/** Динамика в «Анализе»: доходы/расходы/дельта, чистый капитал, тревога и прогноз по целям. */
const MonthlyTrends = () => {
  const router = useRouter();
  const { theme, incomes, expences, actives, passives, goals, currency } = useFinancialStore();
  const [kind, setKind] = useState<PeriodKind>('month');
  const [width, setWidth] = useState(0);

  const isDark = theme === 'dark';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondaryColor = isDark ? 'text-gray-400' : 'text-gray-600';
  const cardBgColor = isDark ? 'bg-white/15' : 'bg-gray-100';
  const mutedColor = isDark ? '#9CA3AF' : '#6B7280';
  const gridColor = isDark ? '#4B5563' : '#D1D5DB';

  const trends = useMemo(
    () => buildTrends({ incomes, expences, actives, passives }, kind),
    [incomes, expences, actives, passives, kind]
  );
  const alarm = useMemo(() => negativeDeltaTwoMonths({ incomes, expences }), [incomes, expences]);
  const { averageDelta, forecasts } = useMemo(
    () => forecastGoals(goals, { incomes, expences }, currency),
    [goals, incomes, expences, currency]
  );

  const last = trends.periods.length - 1;
  const labels = trends.periods.map((p) => p.label);
  const periodName = kind === 'month' ? 'прошлым месяцем' : 'прошлым кварталом';

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const Change = ({ title, current, previous, goodWhenUp }: { title: string; current: number; previous: number; goodWhenUp: boolean }) => {
    const change = percentChange(current, previous);
    const up = change !== null && change > 0;
    const good = change === null || change === 0 ? null : up === goodWhenUp;
    return (
      <View className="flex-1">
        <Text className={`${textSecondaryColor} text-xs font-['SFProDisplayRegular']`}>{title}</Text>
        <Text className={`${textColor} text-sm font-['SFProDisplaySemiBold']`}>{compact(current)}</Text>
        <Text
          className="text-xs font-['SFProDisplayRegular']"
          style={{ color: good === null ? mutedColor : good ? GREEN : RED }}
        >
          {change === null ? '—' : `${up ? '▲' : change < 0 ? '▼' : ''} ${Math.abs(change)}%`}
        </Text>
      </View>
    );
  };

  const Legend = ({ items }: { items: [string, string][] }) => (
    <View className="flex-row flex-wrap mt-2">
      {items.map(([color, label]) => (
        <View key={label} className="flex-row items-center mr-4">
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color, marginRight: 4 }} />
          <Text className={`${textSecondaryColor} text-xs font-['SFProDisplayRegular']`}>{label}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <View className="mb-6">
      <View className="flex-row items-center justify-between mb-3 mt-2">
        <Text className={`${textColor} text-base font-['SFProDisplaySemiBold']`}>Динамика</Text>
        <View className="flex-row">
          {(['month', 'quarter'] as PeriodKind[]).map((k) => (
            <TouchableOpacity
              key={k}
              onPress={() => setKind(k)}
              activeOpacity={Opacity.press}
              className={`px-3 py-1 rounded-full ml-2 ${kind === k ? 'bg-[#4CAF50]' : ''}`}
            >
              <Text className={`text-xs font-['SFProDisplayRegular'] ${kind === k ? 'text-white' : textSecondaryColor}`}>
                {k === 'month' ? 'Месяцы' : 'Кварталы'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {alarm && (
        <View className="rounded-2xl p-3 mb-3 flex-row items-center" style={{ backgroundColor: RED + '22' }}>
          <Ionicons name="warning-outline" size={20} color={RED} style={{ marginRight: 8 }} />
          <Text className="flex-1 text-sm font-['SFProDisplayRegular']" style={{ color: RED }}>
            Дельта уходит в минус второй месяц подряд — пора проанализировать траты.
          </Text>
        </View>
      )}

      {/* Доходы, расходы, дельта */}
      <View className={`${cardBgColor} rounded-2xl p-3 mb-3`} onLayout={onLayout}>
        <Text className={`${textColor} text-sm mb-2 font-['SFProDisplaySemiBold']`}>Доходы, расходы и дельта</Text>
        {width > 0 && (
          <TrendChart
            width={width - 24}
            labels={labels}
            bars={[
              { values: trends.incomes, color: GREEN },
              { values: trends.expences, color: RED },
            ]}
            lines={[{ values: trends.deltas, color: BLUE }]}
            mutedColor={mutedColor}
            gridColor={gridColor}
          />
        )}
        <Legend items={[[GREEN, 'Доходы'], [RED, 'Расходы'], [BLUE, 'Дельта']]} />
        <Text className={`${textSecondaryColor} text-xs mt-3 mb-1 font-['SFProDisplayRegular']`}>
          Сравнение с {periodName}
        </Text>
        <View className="flex-row">
          <Change title="Доходы" current={trends.incomes[last]} previous={trends.incomes[last - 1]} goodWhenUp />
          <Change title="Расходы" current={trends.expences[last]} previous={trends.expences[last - 1]} goodWhenUp={false} />
          <Change title="Дельта" current={trends.deltas[last]} previous={trends.deltas[last - 1]} goodWhenUp />
        </View>
      </View>

      {/* Чистый капитал */}
      <View className={`${cardBgColor} rounded-2xl p-3 mb-3`}>
        <Text className={`${textColor} text-sm mb-2 font-['SFProDisplaySemiBold']`}>Рост чистого капитала</Text>
        {width > 0 && (
          <TrendChart
            width={width - 24}
            labels={labels}
            lines={[
              { values: trends.actives, color: GREEN },
              { values: trends.passives, color: RED },
              { values: trends.netCapital, color: BLUE },
            ]}
            mutedColor={mutedColor}
            gridColor={gridColor}
          />
        )}
        <Legend items={[[GREEN, 'Активы'], [RED, 'Пассивы'], [BLUE, 'Чистый капитал']]} />
      </View>

      {/* Прогноз по целям */}
      {forecasts.length > 0 && (
        <View className={`${cardBgColor} rounded-2xl p-3 mb-3`}>
          <Text className={`${textColor} text-sm mb-1 font-['SFProDisplaySemiBold']`}>Когда цели будут достигнуты</Text>
          <Text className={`${textSecondaryColor} text-xs mb-2 font-['SFProDisplayRegular']`}>
            {averageDelta > 0
              ? `Если откладывать среднюю дельту за 3 месяца — ${compact(averageDelta)} в месяц`
              : 'Средняя дельта за 3 месяца не положительная — копить не из чего'}
          </Text>
          {forecasts.map((f) => (
            <View key={f.goalId} className="flex-row justify-between py-1">
              <Text className={`${textColor} text-sm flex-1 mr-3 font-['SFProDisplayRegular']`} numberOfLines={1}>
                {f.name}
              </Text>
              <Text
                className="text-sm font-['SFProDisplayRegular']"
                style={{ color: f.months === null ? RED : isDark ? '#FFFFFF' : '#111827' }}
              >
                {f.months === null ? 'не достигается' : f.months === 0 ? 'уже накоплено' : `через ${f.months} мес.`}
              </Text>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity
        onPress={() => router.replace('/main/profile/health')}
        activeOpacity={Opacity.press}
        className="bg-[#4CAF50] rounded-xl py-3 items-center"
      >
        <Text className="text-white text-sm font-['SFProDisplaySemiBold']">💡 Получить советы по улучшению</Text>
      </TouchableOpacity>
    </View>
  );
};

export default MonthlyTrends;
