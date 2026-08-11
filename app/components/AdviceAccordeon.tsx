import React, { useEffect, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  LayoutAnimation,
  Platform,
  StyleSheet,
  UIManager,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useFinancialStore from '@/hooks/useStore';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

interface AccordionItem {
  id: string;
  question: string;
  answer: string;
}

interface AdviceAccordionModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  items: AccordionItem[];
}

const { height: screenHeight } = Dimensions.get('window');

const  height  = screenHeight * 0.8;

const AdviceAccordionModal: React.FC<AdviceAccordionModalProps> = ({
  visible,
  onClose,
  title,
  items,
}) => {
  // Нижняя системная панель Android перекрывает контент (edge-to-edge с API 35+),
  // поэтому шторка сама добавляет отступ на её высоту.
  const insets = useSafeAreaInsets();
  const { theme } = useFinancialStore();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Раньше здесь был animationType="slide" самого Modal: на Android окно
  // появлялось сразу с затемнением, и только потом уезжал лист — отсюда рывок
  // «сначала тёмный фон, потом шторка». Теперь анимация своя, как в Drawer и
  // Hint: затемнение жёстко привязано к позиции листа, поэтому рассинхрона нет.
  const translateY = useRef(new Animated.Value(screenHeight)).current;
  const [rendered, setRendered] = useState(visible);

  const backdropOpacity = translateY.interpolate({
    inputRange: [0, screenHeight],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    if (visible) {
      setRendered(true);
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: screenHeight,
        duration: 250,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setRendered(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const isDark = theme === 'dark';
  // Фон листа задаём инлайн-стилем: className на Animated.View в NativeWind ненадёжен.
  const sheetBg = isDark ? '#1C1C1E' : '#FFFFFF';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondaryColor = isDark ? 'text-gray-300' : 'text-gray-700';
  const cardBgColor = isDark ? 'bg-[#333333]' : 'bg-gray-100';
  const iconColor = isDark ? '#9CA3AF' : '#6B7280';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-300';
  const handleBarColor = isDark ? 'bg-gray-600' : 'bg-gray-400';

  const toggleItem = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const renderAccordionItem = (item: AccordionItem) => {
    const isExpanded = expandedItems.has(item.id);

    return (
      <View key={item.id} className="mb-3">
        <TouchableOpacity
          onPress={() => toggleItem(item.id)}
          className={`${cardBgColor} p-4 rounded-lg flex-row items-center justify-between`}
          activeOpacity={0.7}
        >
          <Text className={`${textColor} text-sm flex-1 pr-3 leading-5 font-['SFProDisplayRegular']`}>
            {item.question}
          </Text>
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={20}
            color={iconColor}
          />
        </TouchableOpacity>
        
        {isExpanded && (
          <View className={`${cardBgColor} px-4 py-3 rounded-b-lg -mt-1`}>
            <Text className={`${textSecondaryColor} text-sm leading-5 font-['SFProDisplayRegular']`}>
              {item.answer}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={rendered}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        {/* Затемнение — прозрачность считается из позиции листа */}
        <Animated.View
          style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)', opacity: backdropOpacity }]}
        >
          <TouchableOpacity className="flex-1" activeOpacity={1} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={{
            transform: [{ translateY }],
            backgroundColor: sheetBg,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingHorizontal: 16,
            paddingTop: 24,
            paddingBottom: 16 + insets.bottom,
          }}
        >
          {/* Header */}
          <View className={`flex-row items-center justify-between p-4 border-b ${borderColor}`}>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="chevron-back" size={24} color={iconColor} />
            </TouchableOpacity>
            <Text className={`${textColor} text-lg font-semibold font-['SFProDisplaySemibold']`}>
              {title}
            </Text>
            <View className="w-6" />
          </View>

          {/* Accordion Content */}
          <ScrollView 
            className="mb-4"
            style={{ maxHeight: height}}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 16 }}
          >
            {items.map(renderAccordionItem)}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default AdviceAccordionModal;