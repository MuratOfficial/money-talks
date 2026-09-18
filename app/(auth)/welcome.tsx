import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ONBOARDING_SEEN_KEY } from '@/constants/storageKeys';

interface Bullet {
  emoji: string;
  label: string;
  text: string;
}

interface Slide {
  key: string;
  title: string;
  paragraphs?: string[];
  bullets?: Bullet[];
}

/**
 * Приветствие до авторизации. Текст согласован с заказчиком и разбит на три
 * слайда, чтобы длинные абзацы не превращались в «стену текста» на телефоне.
 */
const slides: Slide[] = [
  {
    key: 'welcome',
    title: 'Добро пожаловать в Money Talks! 🎉',
    paragraphs: [
      'Спасибо, что выбрали нас для управления вашими личными финансами.',
      'Перед вами не просто приложение для учёта доходов и расходов, а ваш полноценный личный финансовый советник.',
    ],
  },
  {
    key: 'features',
    title: 'Мы объединили всё необходимое для разумного управления финансами',
    bullets: [
      {
        emoji: '📊',
        label: 'Глубокий анализ и аналитика',
        text: 'наглядные графики покажут полную картину ваших средств.',
      },
      {
        emoji: '🎯',
        label: 'Создание ЛФП',
        text: 'автоматическое создание индивидуального личного финансового плана для достижения ваших целей.',
      },
      {
        emoji: '📈',
        label: 'Блог для начинающих инвесторов',
        text: 'простые и понятные статьи помогут вам сделать первые шаги в мире инвестиций.',
      },
      {
        emoji: '🧠',
        label: 'Обучение и поддержка ИИ',
        text: 'внутри вас ждут интерактивные обучающие подсказки, видеоуроки по финансовой грамотности и умные советы от искусственного интеллекта.',
      },
    ],
  },
  {
    key: 'security',
    title: '🔒 Безопасность и конфиденциальность',
    paragraphs: [
      'Ваше доверие — наш главный приоритет. Все ваши данные находятся под надёжной защитой современных протоколов шифрования, гарантируя абсолютную конфиденциальность информации.',
      'Начать путь к финансовой свободе прямо сейчас!',
    ],
  },
];

/** Высота нижнего блока с точками и кнопкой — на неё отступает контент слайда. */
const CONTROLS_HEIGHT = 170;

export default function WelcomeScreen() {
  // Кнопка и индикаторы позиционированы абсолютно от низа экрана,
  // а с edge-to-edge низ — это уже под системной панелью навигации.
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList<Slide>>(null);

  useEffect(() => {
    const listenerId = scrollX.addListener(({ value }) => {
      setCurrentIndex(Math.round(value / width));
    });

    return () => {
      scrollX.removeListener(listenerId);
    };
  }, [width]);

  const isLast = currentIndex === slides.length - 1;

  const finish = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_SEEN_KEY, 'true');
    } catch (error) {
      // Не смогли запомнить — не повод не пускать человека дальше.
      console.warn('Failed to save onboarding flag:', error);
    }
    router.replace('/(auth)/login');
  };

  const handleNextOrStart = () => {
    if (isLast) {
      finish();
      return;
    }
    slidesRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
  };

  const renderItem = ({ item, index }: { item: Slide; index: number }) => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0, 1, 0],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View style={[styles.slide, { width, height, opacity }]}>
        {/* Текст длинный, а экраны бывают маленькие — слайд прокручивается. */}
        <ScrollView
          style={{ width }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.slideContent,
            {
              paddingTop: insets.top + 48,
              paddingBottom: CONTROLS_HEIGHT + insets.bottom,
            },
          ]}
        >
          <View style={styles.content}>
            <Text style={styles.title} className="font-['SFProDisplaySemiBold']">
              {item.title}
            </Text>

            {item.paragraphs?.map((paragraph) => (
              <Text
                key={paragraph}
                style={styles.description}
                className="font-['SFProDisplayRegular']"
              >
                {paragraph}
              </Text>
            ))}

            {item.bullets?.map((bullet) => (
              <View key={bullet.label} style={styles.bulletRow}>
                <Text style={styles.bulletEmoji}>{bullet.emoji}</Text>
                <Text style={styles.bulletText} className="font-['SFProDisplayRegular']">
                  <Text style={styles.bulletLabel} className="font-['SFProDisplaySemiBold']">
                    {bullet.label}
                  </Text>
                  {' — ' + bullet.text}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
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
            index,
          })}
        />

        <View style={[styles.indicatorContainer, { bottom: 116 + insets.bottom }]}>
          {slides.map((slide, index) => {
            const inputRange = [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ];

            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 24, 8],
              extrapolate: 'clamp',
            });

            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={slide.key}
                style={[
                  styles.indicator,
                  { width: dotWidth, opacity },
                  currentIndex === index && styles.activeIndicator,
                ]}
              />
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.button, { bottom: 56 + insets.bottom }]}
          onPress={handleNextOrStart}
          activeOpacity={0.85}
        >
          <Text className="font-['SFProDisplaySemiBold']" style={styles.buttonText}>
            {isLast ? 'Начать' : 'Далее'}
          </Text>
        </TouchableOpacity>

        {!isLast && (
          <TouchableOpacity
            style={[styles.skip, { top: insets.top + 8 }]}
            onPress={finish}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.skipText} className="font-['SFProDisplayRegular']">
              Пропустить
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  slide: {
    overflow: 'hidden',
  },
  slideContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  content: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    lineHeight: 32,
    marginBottom: 20,
    color: '#fff',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 16,
    textAlign: 'center',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  bulletEmoji: {
    fontSize: 16,
    lineHeight: 24,
    marginRight: 10,
  },
  bulletText: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    fontSize: 15,
    lineHeight: 23,
    color: 'rgba(255,255,255,0.9)',
  },
  bulletLabel: {
    color: '#fff',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
  },
  indicator: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#4CAF50',
  },
  button: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  skip: {
    position: 'absolute',
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  skipText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
});
