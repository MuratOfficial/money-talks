import React, { useState, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';
import ChatGPTFeature from './ChatGPTFeature';
import useFinancialStore from '@/hooks/useStore';

interface InfoModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  content: string;
  linkUrl?: string;
  linkText?: string;
  enableChatGPT?: boolean;
}

const { height: screenHeight } = Dimensions.get('window');
const height = screenHeight * 0.8;

const InfoModal: React.FC<InfoModalProps> = ({ 
  visible, 
  onClose, 
  title, 
  content, 
  linkUrl, 
  linkText,
  enableChatGPT = true
}) => {
  const { theme } = useFinancialStore();
  const [showChat, setShowChat] = useState(false);
  const chatButtonAnim = useRef(new Animated.Value(1)).current;
  
  const isDark = theme === 'dark';
  const modalBgColor = isDark ? 'bg-[#1C1C1E]' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondaryColor = isDark ? '#D1D5DB' : '#374151';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-300';
  const handleBarColor = isDark ? 'bg-gray-600' : 'bg-gray-400';
  const iconColor = isDark ? 'white' : '#11181C';

  const handleLinkPress = async () => {
    if (!linkUrl) return;
    const supported = await Linking.canOpenURL(linkUrl);
    if (supported) {
      await Linking.openURL(linkUrl);
    }
  };

  const handleChatPress = () => {
    // Анимация кнопки
    Animated.sequence([
      Animated.timing(chatButtonAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(chatButtonAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    setShowChat(true);
  };

  // Проверка наличия контента
  const safeContent = content || '';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <TouchableOpacity 
          className="flex-1" 
          activeOpacity={1} 
          onPress={onClose}
        />

        <View className={`${modalBgColor} rounded-t-3xl px-4 pt-6 pb-4`}>
          {/* Drag Indicator */}
          <View className="items-center py-2">
            <View className={`w-10 h-1 ${handleBarColor} rounded-full`} />
          </View>

          {/* Header */}
          <View className={`flex-row items-center justify-between p-4 border-b ${borderColor}`}>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={iconColor} />
            </TouchableOpacity>
            <Text className={`${textColor} text-lg font-semibold font-['SFProDisplaySemiBold']`}>
              {title}
            </Text>
            {enableChatGPT && (
              <Animated.View
                style={{
                  transform: [{ scale: chatButtonAnim }],
                }}
              >
                <TouchableOpacity
                  onPress={handleChatPress}
                  className="bg-[#F97316] p-2 rounded-full"
                  activeOpacity={0.8}
                >
                  <Ionicons name="chatbubble" size={20} color="white" />
                </TouchableOpacity>
              </Animated.View>
            )}
            {!enableChatGPT && <View className="w-6" />}
          </View>

          <ScrollView 
            style={{ maxHeight: height }}
            showsVerticalScrollIndicator={true}
            className="mb-4"
            contentContainerStyle={{ paddingBottom: 10 }}
          >
            <View className="p-4">
              {/* Показываем Markdown только если есть контент */}
              {safeContent ? (
                <Markdown
                  style={{
                    body: {
                      color: isDark ? '#D1D5DB' : '#374151',
                      fontSize: 14,
                      lineHeight: 20,
                      fontFamily: "SFProDisplayRegular"
                    },
                    heading1: {
                      color: isDark ? '#FFFFFF' : '#11181C',
                      fontSize: 20,
                      fontWeight: '600',
                      marginBottom: 12,
                    },
                    heading2: {
                      color: isDark ? '#FFFFFF' : '#11181C',
                      fontSize: 18,
                      fontWeight: '600',
                      marginBottom: 8,
                    },
                    heading3: {
                      color: isDark ? '#FFFFFF' : '#11181C',
                      fontSize: 16,
                      fontWeight: '600',
                      marginBottom: 6,
                    },
                    bullet_list: {
                      marginBottom: 8,
                    },
                    list_item: {
                      color: isDark ? '#D1D5DB' : '#374151',
                      fontSize: 14,
                      marginBottom: 4,
                    },
                    strong: {
                      color: '#F97316',
                      fontWeight: '600',
                    },
                    em: {
                      color: '#F97316',
                      fontStyle: 'italic',
                    },
                    paragraph: {
                      color: isDark ? '#D1D5DB' : '#374151',
                      fontSize: 14,
                      lineHeight: 20,
                      marginBottom: 8,
                    },
                    code_inline: {
                      backgroundColor: isDark ? '#374151' : '#E5E7EB',
                      color: isDark ? '#F3F4F6' : '#11181C',
                      paddingHorizontal: 4,
                      paddingVertical: 2,
                      borderRadius: 4,
                    },
                    code_block: {
                      backgroundColor: isDark ? '#374151' : '#E5E7EB',
                      color: isDark ? '#F3F4F6' : '#11181C',
                      padding: 12,
                      borderRadius: 8,
                      marginBottom: 12,
                    },
                    blockquote: {
                      backgroundColor: isDark ? '#374151' : '#E5E7EB',
                      borderLeftWidth: 4,
                      borderLeftColor: '#F97316',
                      paddingLeft: 12,
                      paddingVertical: 8,
                      marginBottom: 12,
                    },
                  }}
                >
                  {safeContent}
                </Markdown>
              ) : (
                <Text className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-center py-4`}>
                  Нет доступного контента
                </Text>
              )}

              {/* Link Section */}
              {linkUrl && (
                <View className={`mt-6 pt-4 border-t ${borderColor}`}>
                  <Text className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm mb-3`}>
                    Ссылка на видеоурок:
                  </Text>
                  
                  <TouchableOpacity
                    onPress={handleLinkPress}
                    className={`flex-row items-center p-3 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg`}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="link" size={16} color={isDark ? "#9CA3AF" : "#6B7280"} />
                    <Text className="text-blue-400 text-sm ml-2 flex-1" numberOfLines={1}>
                      {linkText || linkUrl}
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color={isDark ? "#9CA3AF" : "#6B7280"} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
      
      {/* ChatGPT Feature Modal - передаем контент как контекст */}
      {enableChatGPT && (
        <ChatGPTFeature
          visible={showChat}
          onClose={() => setShowChat(false)}
          title={title}
          context={safeContent}
        />
      )}
    </Modal>
  );
};

export default InfoModal;