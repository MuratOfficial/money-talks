import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Href, useRouter } from 'expo-router';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import useFinancialStore from '@/hooks/useStore';
import AnimatedAssistant from '@/app/components/AnimatedAssistant';
import { IDLE_TIP, financeTip } from '@/utils/finGuideTips';
import FadeInView from '@/app/components/FadeInView';
import { Opacity } from '@/constants/design';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface FinanceCardProps {
  title: string;
   iconName: any;
  onPress: () => void;
}

// Переместил images в начало файла для лучшей читаемости
const images = {
  img1: require('../../../assets/images/img1.png'),
  img2: require('../../../assets/images/img2.png'),
  img3: require('../../../assets/images/img3.png'),
  img4: require('../../../assets/images/img4.png'),
  img5: require('../../../assets/images/img5.png'),
};

const FinanceCard: React.FC<FinanceCardProps & { isDark: boolean }> = ({ title, iconName, onPress, isDark }) => {
  const cardBgColor = isDark ? 'bg-white/15' : 'bg-gray-100';
  const cardTextColor = isDark ? 'text-gray-50' : 'text-gray-900';

  const renderIcon = () => {
    return <Image 
                        source={iconName}
                        className="w-20 h-20"
                        resizeMode="contain"
                      />
  };

  return (
    <TouchableOpacity
      className={`w-[48%] aspect-[10/8] ${cardBgColor} rounded-2xl mb-4`}
      onPress={onPress}
      activeOpacity={Opacity.press}
    >
      <View className="flex-1 justify-between items-start p-4">
          {renderIcon()}
          
        <Text className={`${cardTextColor} text-sm mt-3 text-left font-['SFProDisplayRegular']`}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const FinanceApp: React.FC = () => {
  const router = useRouter();
  const { theme, incomes, expences, actives, passives, formatAmount, setCurrentAsset } = useFinancialStore();
  
  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-black' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const cardBgColor = isDark ? 'bg-white/15' : 'bg-gray-100';
  const cardTextColor = isDark ? 'text-gray-50' : 'text-gray-900';

  // ФинГид: подсказка зависит от того, что уже заполнено (сценарии из ТЗ).
  const [showAssistant, setShowAssistant] = useState(false);
  const [idle, setIdle] = useState(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tip = idle ? IDLE_TIP : financeTip({ incomes, expences, actives, passives }, formatAmount);

  useEffect(() => {
    // Пока есть пустые разделы — ФинГид сам подсказывает, что внести дальше.
    // Когда всё заполнено, он остаётся свёрнутым: открыть можно нажатием.
    const hasEmpty = !incomes.length || !expences.length || !actives.length || !passives.length;
    if (!hasEmpty) return;
    const timer = setTimeout(() => setShowAssistant(true), 1500);
    return () => clearTimeout(timer);
  }, [incomes.length, expences.length, actives.length, passives.length]);

  // ТЗ: «если в течение 30 секунд нет действия» — ФинГид сам предлагает начать.
  const restartIdleTimer = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      setIdle(true);
      setShowAssistant(true);
    }, 30_000);
  }, []);

  useEffect(() => {
    restartIdleTimer();
    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [restartIdleTimer]);

  const closeAssistant = () => {
    setShowAssistant(false);
    setIdle(false);
    restartIdleTimer();
  };

  const runTipAction = (route: string) => {
    closeAssistant();
    // Формы добавления открываются в режиме редактирования, если в сторе
    // остался выбранный ранее элемент.
    setCurrentAsset(null);
    router.replace(route as Href);
  };

  const financeItems:FinanceCardProps[] = [
    {
      title: 'Расходы',
      iconName: images["img1"],
      onPress: () => router.replace('/main/finance/expences/main')
    },
    {
      title: 'Доходы',
      iconName: images["img2"],
      onPress: () => router.replace('/main/finance/incomes/main')
    },
    {
      title: 'Активы',
      iconName: images["img3"],
      onPress: () => router.replace('/main/finance/actives/main')
    },
    {
      title: 'Пассивы',
      iconName: images["img4"],
      onPress: () => router.replace('/main/finance/passives/main')
    },
    {
      title: 'Анализ',
      iconName: images["img5"],
      onPress: () => router.replace('/main/finance/analyze/main')
    },
  ];

  return (
    <SafeAreaView edges={['top']} className={`flex-1 ${bgColor}`} onTouchStart={restartIdleTimer}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
 
   
      <View className="px-4 py-3">
        <Text className={`text-xl ${textColor} font-['SFProDisplaySemiBold']`}>
          Финансы
        </Text>
      </View>

      <View className="flex-1 px-4">
        <FadeInView style={{ flex: 1 }}>
          <View className="flex-row flex-wrap justify-between">
            {financeItems.map((item, index) => (
              <FinanceCard
                key={index}
                title={item.title}
                iconName={item.iconName}
                onPress={item.onPress}
                isDark={isDark}
              />
            ))}
          </View>
        </FadeInView>
      </View>

      <AnimatedAssistant
        visible={showAssistant}
        message={tip.message}
        mood={tip.mood}
        action={tip.action ? { label: tip.action.label, onPress: () => runTipAction(tip.action!.route) } : undefined}
        onClose={closeAssistant}
        onOpen={() => {
          setShowAssistant(true);
          restartIdleTimer();
        }}
      />
    </SafeAreaView>
  );
};

export default FinanceApp;