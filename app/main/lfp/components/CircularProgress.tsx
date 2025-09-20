import React from "react";
import { Text, View } from "react-native";

const CircularProgress = ( {progress}:{progress:number}) => {
       const radius = 35;
    const strokeWidth = 6;
    const normalizedRadius = radius - strokeWidth * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDasharray = `${circumference} ${circumference}`;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <View className="relative">
        <svg
          height={radius * 2}
          width={radius * 2}
          className="transform -rotate-90"
        >
          <circle
            stroke="#374151"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke="#4CAF50"
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        <View className="absolute inset-0 items-center justify-center">
          <Text className="text-white text-sm font-['SFProDisplayBold']">
            {progress.toFixed(1)}%
          </Text>
        </View>
      </View>
    );
  };

  export default CircularProgress