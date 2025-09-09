import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';

interface InfoModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  content: string;
  linkUrl?: string;
  linkText?: string;
}

const InfoModal: React.FC<InfoModalProps> = ({ 
  visible, 
  onClose, 
  title, 
  content, 
  linkUrl, 
  linkText 
}) => {
  const handleLinkPress = async () => {
    if (!linkUrl) return;
    const supported = await Linking.canOpenURL(linkUrl);
    if (supported) {
      await Linking.openURL(linkUrl);
    }
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
            <Text className="text-white text-lg font-semibold font-['SFProDisplaySemiBold']">
              {title}
            </Text>
            <View className="w-6" />
          </View>

          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <View className="p-4">
              <Markdown
                style={{
                  body: {
                    color: '#D1D5DB', // text-gray-300
                    fontSize: 14,
                    lineHeight: 20,
                    fontFamily: "SFProDisplayRegular"
                  },
                  heading1: {
                    color: '#FFFFFF',
                    fontSize: 20,
                    fontWeight: '600',
                    marginBottom: 12,
                  },
                  heading2: {
                    color: '#FFFFFF',
                    fontSize: 18,
                    fontWeight: '600',
                    marginBottom: 8,
                  },
                  heading3: {
                    color: '#FFFFFF',
                    fontSize: 16,
                    fontWeight: '600',
                    marginBottom: 6,
                  },
                  bullet_list: {
                    marginBottom: 8,
                  },
                  list_item: {
                    color: '#D1D5DB',
                    fontSize: 14,
                    marginBottom: 4,
                  },
                  strong: {
                    color: '#F97316', // text-orange-500
                    fontWeight: '600',
                  },
                  em: {
                    color: '#F97316', // text-orange-500
                    fontStyle: 'italic',
                  },
                  paragraph: {
                    color: '#D1D5DB',
                    fontSize: 14,
                    lineHeight: 20,
                    marginBottom: 8,
                  },
                  code_inline: {
                    backgroundColor: '#374151', // bg-gray-700
                    color: '#F3F4F6', // text-gray-100
                    paddingHorizontal: 4,
                    paddingVertical: 2,
                    borderRadius: 4,
                  },
                  code_block: {
                    backgroundColor: '#374151', // bg-gray-700
                    color: '#F3F4F6', // text-gray-100
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 12,
                  },
                  blockquote: {
                    backgroundColor: '#374151', // bg-gray-700
                    borderLeftWidth: 4,
                    borderLeftColor: '#F97316', // border-orange-500
                    paddingLeft: 12,
                    paddingVertical: 8,
                    marginBottom: 12,
                  },
                }}
              >
                {content}
              </Markdown>

              {/* Link Section */}
              {linkUrl && (
                <View className="mt-6 pt-4 border-t border-gray-700">
                  <Text className="text-gray-400 text-sm mb-3">
                    Ссылка на видеоурок:
                  </Text>
                  
                  <TouchableOpacity
                    onPress={handleLinkPress}
                    className="flex-row items-center p-3 bg-gray-700 rounded-lg"
                    activeOpacity={0.7}
                  >
                    <Ionicons name="link" size={16} color="#9CA3AF" />
                    <Text className="text-blue-400 text-sm ml-2 flex-1" numberOfLines={1}>
                      {linkText || linkUrl}
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default InfoModal;