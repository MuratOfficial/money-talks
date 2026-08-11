import React, { useState, useRef, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ChatGPTMessage, sendChatGPTMessage } from '@/services/api';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatGPTFeatureProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  context?: string; // Контекст из текущего урока
}

const { height: screenHeight } = Dimensions.get('window');

const ChatGPTFeature: React.FC<ChatGPTFeatureProps> = ({ 
  visible, 
  onClose, 
  title, 
  context 
}) => {
  // Нижняя системная панель Android перекрывает контент (edge-to-edge с API 35+),
  // поэтому шторка сама добавляет отступ на её высоту.
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ChatGPTMessage[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Инициализация контекста при открытии
  useEffect(() => {
    if (visible && context) {
      setConversationHistory([
        {
          role: 'system',
          content: `Ты полезный помощник по финансовой грамотности. Контекст текущего урока: ${title}. ${context}. Отвечай кратко, понятно и по-дружески на русском языке.`
        }
      ]);
    }
  }, [visible, context, title]);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    Animated.timing(pulseAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

const sendMessage = async () => {
  if (!inputText.trim() || isLoading) return;

  const userMessage: ChatMessage = {
    id: Date.now().toString(),
    text: inputText.trim(),
    isUser: true,
    timestamp: new Date(),
  };

  setMessages(prev => [...prev, userMessage]);
  setInputText('');
  setIsLoading(true);
  startPulseAnimation();

  try {
    const response = await sendChatGPTMessage({
      message: userMessage.text,
      context: context,
      conversationHistory: conversationHistory
    });
    
    const botMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: response.response,
      isUser: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, botMessage]);
    
    // Обновляем историю с ответом ассистента
    setConversationHistory(prev => [
      ...prev,
      { role: 'assistant', content: response.response }
    ]);

  } catch (error) {
    console.error('ChatGPT Error:', error);
    
    const errorMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: "Извини, не могу подключиться к серверу. Проверь интернет и попробуй еще раз.",
      isUser: false,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, errorMessage]);
    
    Alert.alert(
      'Ошибка подключения',
      'Не удалось связаться с AI ассистентом. Попробуй позже.',
      [{ text: 'OK' }]
    );
  } finally {
    setIsLoading(false);
    stopPulseAnimation();
  }
};

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  const handleClose = () => {
    // Очищаем состояние при закрытии
    setMessages([]);
    setConversationHistory([]);
    setInputText('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-black/50 justify-end"
      >
        <TouchableOpacity 
          className="flex-1" 
          activeOpacity={1} 
          onPress={handleClose}
        />
        
        <View className="bg-[#1C1C1E] rounded-t-3xl h-[85%]">
          {/* Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-700">
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
            <View className="flex-row items-center flex-1 justify-center">
              <Ionicons name="chatbubble" size={20} color="#F97316" />
              <Text 
                className="text-white text-base font-semibold font-['SFProDisplaySemiBold'] ml-2"
                numberOfLines={1}
              >
                AI Помощник
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  'Очистить чат?',
                  'Вся история разговора будет удалена.',
                  [
                    { text: 'Отмена', style: 'cancel' },
                    {
                      text: 'Очистить',
                      style: 'destructive',
                      onPress: () => {
                        setMessages([]);
                        setConversationHistory(conversationHistory.filter(m => m.role === 'system'));
                      }
                    }
                  ]
                );
              }}
            >
              <Ionicons name="trash-outline" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Messages */}
          <ScrollView 
            ref={scrollViewRef}
            className="flex-1 p-4"
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            showsVerticalScrollIndicator={false}
          >
            {messages.length === 0 && (
              <View className="items-center justify-center py-8">
                <View className="bg-[#F97316]/10 p-6 rounded-full mb-4">
                  <Ionicons name="chatbubbles" size={48} color="#F97316" />
                </View>
                <Text className="text-white text-center text-xl font-semibold font-['SFProDisplaySemiBold'] mb-2">
                  Привет! 👋
                </Text>
                <Text className="text-gray-400 text-center mt-2 text-base font-['SFProDisplayRegular'] px-8">
                  Спрашивай все о теме "{title}"
                </Text>
                <Text className="text-gray-500 text-center mt-2 text-sm font-['SFProDisplayRegular'] px-8">
                  Я помогу разобраться в любых вопросах
                </Text>
              </View>
            )}

            {messages.map((message) => (
              <View
                key={message.id}
                className={`mb-4 ${message.isUser ? 'items-end' : 'items-start'}`}
              >
                <View
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    message.isUser
                      ? 'bg-[#F97316] rounded-br-md'
                      : 'bg-gray-700 rounded-bl-md'
                  }`}
                >
                  <Text className={`text-sm font-['SFProDisplayRegular'] ${
                    message.isUser ? 'text-white' : 'text-gray-100'
                  }`}>
                    {message.text}
                  </Text>
                  <Text className={`text-xs font-['SFProDisplayRegular'] mt-1 ${
                    message.isUser ? 'text-orange-100' : 'text-gray-400'
                  }`}>
                    {formatTime(message.timestamp)}
                  </Text>
                </View>
              </View>
            ))}

            {isLoading && (
              <View className="items-start mb-4">
                <View className="bg-gray-700 p-3 rounded-2xl rounded-bl-md max-w-[80%]">
                  <View className="flex-row items-center">
                    <Animated.View
                      style={{
                        transform: [{ scale: pulseAnim }],
                      }}
                    >
                      <Ionicons name="ellipsis-horizontal" size={16} color="#F97316" />
                    </Animated.View>
                    <Text className="text-gray-300 text-sm ml-2 font-['SFProDisplayRegular']">
                      AI думает...
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Input */}
          <View className="px-4 pt-4 border-t border-gray-700 bg-[#1C1C1E]" style={{ paddingBottom: 16 + insets.bottom }}>
            <View className="flex-row items-center bg-gray-800 rounded-2xl px-4 py-3">
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder="Спрашивай..."
                placeholderTextColor="#9CA3AF"
                className="flex-1 text-white text-base font-['SFProDisplayRegular']"
                multiline
                maxLength={500}
                onSubmitEditing={sendMessage}
                returnKeyType="send"
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={sendMessage}
                disabled={!inputText.trim() || isLoading}
                className={`ml-3 p-2 rounded-full ${
                  inputText.trim() && !isLoading
                    ? 'bg-[#F97316]'
                    : 'bg-gray-600'
                }`}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name="send" 
                  size={20} 
                  color={inputText.trim() && !isLoading ? "white" : "#4B5563"} 
                />
              </TouchableOpacity>
            </View>
            <Text className="text-gray-500 text-xs text-center mt-2 font-['SFProDisplayRegular']">
              AI может ошибаться. Проверяй важную информацию.
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default ChatGPTFeature;