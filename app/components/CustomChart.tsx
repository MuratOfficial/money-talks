import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

interface PieSegment {
  value: number;
  color: string;
  label?: string;
}

interface CustomPieChartProps {
  data: PieSegment[];
  size?: number;
  strokeWidth?: number;
  totalAmount: number;
  currency?: string;
}

const CustomPieChart: React.FC<CustomPieChartProps> = ({
  data,
  size = 280,
  strokeWidth = 30,
  totalAmount,
  currency = '₸'
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  // Вычисляем общую сумму для процентов
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  // Создаем сегменты с накопительными углами
  let cumulativePercentage = 0;
  const segments = data.map((item) => {
    const percentage = (item.value / total) * 100;
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((cumulativePercentage / 100) * circumference);
    
    cumulativePercentage += percentage;
    
    return {
      ...item,
      strokeDasharray,
      strokeDashoffset,
      percentage
    };
  });

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('ru-RU').format(amount) + ` ${currency}`;
  };

  return (
    <View className="items-center justify-center">
      <View style={{ width: size, height: size }} className="relative">
        <Svg width={size} height={size} className="absolute">
          <G rotation="-90" origin={`${center}, ${center}`}>
            {segments.map((segment, index) => (
              <Circle
                key={index}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={segment.color}
                strokeWidth={strokeWidth}
                strokeDasharray={segment.strokeDasharray}
                strokeDashoffset={segment.strokeDashoffset}
                strokeLinecap="round"
              />
            ))}
          </G>
        </Svg>
        
        {/* Центральная сумма */}
        <View className="absolute inset-0 justify-center items-center">
          <Text className="text-white text-2xl font-['SFProDisplaySemiBold'] text-center">
            {formatAmount(totalAmount)}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default CustomPieChart ;