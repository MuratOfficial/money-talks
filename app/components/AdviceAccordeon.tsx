import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  LayoutAnimation,
  Platform,
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
  const { theme } = useFinancialStore();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  
  const isDark = theme === 'dark';
  const modalBgColor = isDark ? 'bg-[#1C1C1E]' : 'bg-white';
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
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className={`${modalBgColor} rounded-t-3xl px-4 pt-6 pb-4`}>
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
        </View>
      </View>
    </Modal>
  );
};

export default AdviceAccordionModal;