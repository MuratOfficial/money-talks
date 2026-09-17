import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import useFinancialStore from '@/hooks/useStore';

interface ScoreRingProps {
  /** 0–100 */
  score: number;
  color: string;
  size?: number;
  strokeWidth?: number;
}

/** Кольцо с баллом в центре — для «Финансового здоровья». */
const ScoreRing: React.FC<ScoreRingProps> = ({ score, color, size = 72, strokeWidth = 7 }) => {
  const { theme } = useFinancialStore();
  const isDark = theme === 'dark';
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(100, Math.max(0, score)) / 100);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle
          stroke={isDark ? '#374151' : '#E5E7EB'}
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <Circle
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </Svg>
      <View className="absolute inset-0 items-center justify-center">
        <Text
          className={`${isDark ? 'text-white' : 'text-gray-900'} font-['SFProDisplayBold']`}
          style={{ fontSize: size * 0.28 }}
        >
          {Math.round(score)}
        </Text>
      </View>
    </View>
  );
};

export default ScoreRing;
