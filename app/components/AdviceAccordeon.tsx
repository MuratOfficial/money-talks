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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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

const AdviceAccordionModal: React.FC<AdviceAccordionModalProps> = ({
  visible,
  onClose,
  title,
  items,
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

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
          className="bg-[#333333] p-4 rounded-lg flex-row items-center justify-between"
          activeOpacity={0.7}
        >
          <Text className="text-white text-sm flex-1 pr-3 leading-5 font-['SFProDisplayRegular']">
            {item.question}
          </Text>
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={20}
            color="#9CA3AF"
          />
        </TouchableOpacity>
        
        {isExpanded && (
          <View className="bg-[#333333] px-4 py-3 rounded-b-lg -mt-1">
            <Text className="text-gray-300 text-sm leading-5 font-['SFProDisplayRegular']">
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
      animationType="none"
      statusBarTranslucent
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-[#121212] rounded-t-3xl max-h-[100%]">
          {/* Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-700">
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-lg font-semibold font-['SFProDisplaySemibold']">
              {title}
            </Text>
            <View className="w-6" />
          </View>

          {/* Accordion Content */}
          <ScrollView 
            className="flex-1" 
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