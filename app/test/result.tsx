import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  ImageBackground,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    key: '1',
    title: 'Добро пожаловать в Money Talks!🎉',
    description: 'Я Раушан Итжанова, создатель этого приложения, и рада видеть тебя среди финансово осознанных людей!',
    showBulletPoints: false
  },
  {
    key: '2',
    title: 'Добро пожаловать в Money Talks!🎉',
    description: '💰 Здесь ты сможешь:',
    bulletPoints: [
      'Понять, куда уходят деньги и как управлять личными финансами',
      'Ставить и достигать финансовые цели (пенсия, образование, путешествия).',
      'Инвестировать и увеличивать капитал.',
      'Автоматизировать финансы и получить чёткий финансовый план.'
    ],
    showBulletPoints: true
  },
  {
    key: '3',
    title: 'Добро пожаловать в Money Talks!🎉',
    description: '📊 Давай начнём! 🚀 Выбери свою первую цель и сделай шаг к финансовой свободе.',
    showBulletPoints: false
  }
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList>(null);
  const [buttonName, setButtonName] = useState('Далее');

  useEffect(() => {
    const listenerId = scrollX.addListener(({ value }) => {
      const index = Math.round(value / width);
      setCurrentIndex(index);
    });

    return () => {
      scrollX.removeListener(listenerId);
    };
  }, []);

  useEffect(() => {
    setButtonName(currentIndex === slides.length - 1 ? 'Начать' : 'Далее');
  }, [currentIndex]);

  const handleNextOrStart = async () => {
    if (currentIndex < slides.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      router.replace('/test/test');
    }
  };

  const renderItem = ({ item, index }: any) => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0, 1, 0],
      extrapolate: 'clamp'
    });

    return (
      <Animated.View 
        className="w-full h-full items-center justify-center" 
        style={{ opacity }}
      >
        <View className="w-[90%] max-w-[400px] p-6">
          <Text className="text-2xl font-bold text-white mb-6 text-center">
            {item.title}
          </Text>
          <Text className="text-lg text-white/90 mb-6 text-center leading-[26px]">
            {item.description}
          </Text>

          {item.showBulletPoints && item.bulletPoints && (
            <View className="ml-4">
              {item.bulletPoints.map((point: string, idx: number) => (
                <View key={idx} className="flex-row items-start mb-3">
                  <Text className="text-xl text-[#4CAF50] mr-2">•</Text>
                  <Text className="text-base text-white/90 flex-1 leading-[22px]">
                    {point}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </Animated.View>
    );
  };

  return (

      <View className="flex-1 bg-black">
        <Animated.FlatList
          ref={slidesRef}
          data={slides}
          renderItem={renderItem}
          keyExtractor={(item) => item.key}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          getItemLayout={(_, index) => ({
            length: width,
            offset: width * index,
            index
          })}
        />

        <View className="absolute bottom-32 left-0 right-0 flex-row justify-center">
          {slides.map((_, index) => {
            const inputRange = [
              (index - 1) * width,
              index * width,
              (index + 1) * width
            ];

            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 16, 8],
              extrapolate: 'clamp'
            });

            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp'
            });

            return (
              <Animated.View
                key={index}
                className="h-2 rounded-full mx-1 bg-white/50"
                style={{
                  width: dotWidth,
                  opacity,
                  backgroundColor: currentIndex === index ? '#4CAF50' : 'rgba(255,255,255,0.5)'
                }}
              />
            );
          })}
        </View>

        <View className="absolute bottom-0 left-0 right-0 px-4 pb-4 bg-black">
                <TouchableOpacity
                 onPress={handleNextOrStart}
                  activeOpacity={0.8}
                  className="w-full bg-[#4CAF50] py-4 rounded-xl items-center justify-center"
                >
                  <Text className="text-white font-['SFProDisplaySemiBold']">
                    Начать тест
                  </Text>
                </TouchableOpacity>
              </View>

       
      </View>
  );
}