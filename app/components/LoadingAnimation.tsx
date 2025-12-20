import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import useFinancialStore from '@/hooks/useStore';

interface LoadingAnimationProps {
  message?: string;
  size?: 'small' | 'large';
  fullScreen?: boolean;
}

/**
 * Универсальный компонент анимации загрузки
 */
const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
  message = 'Загрузка...',
  size = 'large',
  fullScreen = false,
}) => {
  const { theme } = useFinancialStore();
  const isDark = theme === 'dark';

  if (fullScreen) {
    return (
      <View className={`flex-1 items-center justify-center ${isDark ? 'bg-black' : 'bg-white'}`}>
        <View className="items-center">
          {/* Градиентный круг */}
          <View className="mb-6">
            <LinearGradient
              colors={isDark ? ['#4CAF50', '#2196F3'] : ['#4CAF50', '#81C784']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientCircle}
            >
              <ActivityIndicator size={size} color="white" />
            </LinearGradient>
          </View>

          {/* Текст загрузки */}
          <Text className={`text-base font-['SFProDisplayRegular'] ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {message}
          </Text>

          {/* Анимированные точки */}
          <View className="flex-row mt-2 space-x-1">
            <View className={`w-2 h-2 rounded-full ${isDark ? 'bg-green-400' : 'bg-green-600'}`} 
                  style={[styles.dot, { animationDelay: '0s' }]} />
            <View className={`w-2 h-2 rounded-full ${isDark ? 'bg-green-400' : 'bg-green-600'}`} 
                  style={[styles.dot, { animationDelay: '0.2s' }]} />
            <View className={`w-2 h-2 rounded-full ${isDark ? 'bg-green-400' : 'bg-green-600'}`} 
                  style={[styles.dot, { animationDelay: '0.4s' }]} />
          </View>
        </View>
      </View>
    );
  }

  // Компактная версия для встраивания
  return (
    <View className="items-center justify-center py-8">
      <LinearGradient
        colors={isDark ? ['#4CAF50', '#2196F3'] : ['#4CAF50', '#81C784']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.compactGradientCircle}
      >
        <ActivityIndicator size={size} color="white" />
      </LinearGradient>
      
      <Text className={`mt-4 text-sm font-['SFProDisplayRegular'] ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  gradientCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  compactGradientCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  dot: {
    opacity: 0.3,
  },
});

export default LoadingAnimation;
