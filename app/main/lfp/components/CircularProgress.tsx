import React from "react";
import { Text, View } from "react-native";
import Svg, { Circle } from 'react-native-svg';

interface CircularProgressProps {
  progress: number;
}

const CircularProgress: React.FC<CircularProgressProps> = ({ progress }) => {
  const radius = 35;
  const strokeWidth = 6;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View className="relative">
      <Svg
        height={radius * 2}
        width={radius * 2}
        style={{ transform: [{ rotate: '-90deg' }] }}
      >
        <Circle
          stroke="#374151"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <Circle
          stroke="#4CAF50"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </Svg>
      <View className="absolute inset-0 items-center justify-center">
        <Text className="text-white text-sm font-['SFProDisplayBold']">
          {progress.toFixed(1)}%
        </Text>
      </View>
    </View>
  );
};

export default CircularProgress;