import React, { useState, useRef } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
}

const { height: screenHeight } = Dimensions.get('window');

// ChatGPT API Integration
const callChatGPT = async (message: string): Promise<string> => {
  try {
    // For client-side implementation, we'll use a mock response
    // In a real implementation, you would call OpenAI API here
    // You can replace this with actual OpenAI API call
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock responses based on common financial questions
    const mockResponses = [
      "I'd be happy to help you with your financial question! Based on the context, here are some insights...",
      "That's a great question about personal finance. Let me provide you with some guidance...",
      "I understand you're looking for financial advice. Here's what I recommend...",
      "Based on your question, here are some strategies that might help improve your financial situation..."
    ];
    
    return mockResponses[Math.floor(Math.random() * mockResponses.length)];
  } catch (error) {
    console.error('ChatGPT API Error:', error);
    return "I'm sorry, I'm having trouble connecting right now. Please try again later.";
  }
};

const ChatGPTFeature: React.FC<ChatGPTFeatureProps> = ({ visible, onClose, title }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

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
      const response = await callChatGPT(userMessage.text);
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, something went wrong. Please try again.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      stopPulseAnimation();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-black/50 justify-end"
      >
        <TouchableOpacity 
          className="flex-1" 
          activeOpacity={1} 
          onPress={onClose}
        />
        
        <View className="bg-[#1C1C1E] rounded-t-3xl h-[85%]">
          {/* Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-700">
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
            <View className="flex-row items-center">
              <Ionicons name="chatbubble" size={20} color="#F97316" />
              <Text className="text-white text-lg font-semibold font-['SFProDisplaySemiBold'] ml-2">
                {title} - AI Assistant
              </Text>
            </View>
            <View className="w-6" />
          </View>

          {/* Messages */}
          <ScrollView 
            ref={scrollViewRef}
            className="flex-1 p-4"
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.length === 0 && (
              <View className="items-center justify-center py-8">
                <Ionicons name="chatbubbles-outline" size={48} color="#6B7280" />
                <Text className="text-gray-400 text-center mt-4 text-base font-['SFProDisplayRegular']">
                  Спрашивай все об {title.toLowerCase()}!
                </Text>
                <Text className="text-gray-500 text-center mt-2 text-sm font-['SFProDisplayRegular']">
                  Я тут чтобы тебе помочь
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
                      <Ionicons name="ellipsis-horizontal" size={16} color="#9CA3AF" />
                    </Animated.View>
                    <Text className="text-gray-400 text-sm ml-2 font-['SFProDisplayRegular']">
                      ИИ думает...
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Input */}
          <View className="p-4 border-t border-gray-700">
            <View className="flex-row items-center bg-gray-800 rounded-2xl px-4 py-2">
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
                  color={inputText.trim() && !isLoading ? "white" : "#6B7280"} 
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default ChatGPTFeature;
