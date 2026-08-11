import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    key: '1',
    title: 'Добро пожаловать в Money Talks!🎉',
    description:
      'Я Раушан Итжанова, создатель этого приложения, и рада видеть тебя среди финансово осознанных людей!',
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
    description:
      '📊 Давай начнём! 🚀 Выбери свою первую цель и сделай шаг к финансовой свободе.',
    showBulletPoints: false
  }
];

export default function OnboardingScreen() {
  // Кнопка и индикаторы позиционированы абсолютно от низа экрана,
  // а с edge-to-edge низ — это уже под системной панелью навигации.
  const insets = useSafeAreaInsets();
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
      router.replace('/(auth)/login');
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
      <Animated.View style={[styles.slide, { opacity }]}>
        <View style={styles.content}>
          <Text style={styles.title} className="font-['SFProDisplaySemiBold']">{item.title}</Text>
          <Text style={styles.description} className="font-['SFProDisplayRegular']">{item.description}</Text>

          {item.showBulletPoints && item.bulletPoints && (
            <View style={styles.bulletContainer}>
              {item.bulletPoints.map((point: string, idx: number) => (
                <View key={idx} style={styles.bulletPoint}>
                  <Text style={styles.bullet} className="font-['SFProDisplayRegular']">•</Text>
                  <Text style={styles.bulletText} className="font-['SFProDisplayRegular']">{point}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </Animated.View>
    );
  };

  return (
    <ImageBackground
      source={require('../../assets/images/image.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
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

        <View style={[styles.indicatorContainer, { bottom: 120 + insets.bottom }]}>
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
                style={[
                  styles.indicator,
                  {
                    width: dotWidth,
                    opacity
                  },
                  currentIndex === index && styles.activeIndicator
                ]}
              />
            );
          })}
        </View>

        <TouchableOpacity style={[styles.button, { bottom: 60 + insets.bottom }]} onPress={handleNextOrStart}>
          <Text className="font-['SFProDisplayRegular']" style={styles.buttonText}>{buttonName}</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%'
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)'
  },
  slide: {
    width,
    height,
    alignItems: 'center',
    justifyContent: 'center'
  },
  content: {
    width: '90%',
    maxWidth: 400,
    padding: 24
  },
  title: {
    fontSize: 26,
    marginBottom: 24,
    color: '#fff',
    textAlign: 'center'
  },
  description: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 26
  },
  bulletContainer: {
    marginLeft: 16
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  bullet: {
    fontSize: 20,
    color: '#4CAF50',
    marginRight: 8
  },
  bulletText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    flex: 1,
    lineHeight: 22
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0
  },
  indicator: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 4
  },
  activeIndicator: {
    backgroundColor: '#4CAF50'
  },
  button: {
    position: 'absolute',
    bottom: 60,
    left: 20,
    right: 20,
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  }
});
