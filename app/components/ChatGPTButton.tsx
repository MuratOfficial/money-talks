import React, { useState, useRef } from 'react';
import { TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ChatGPTFeature from './ChatGPTFeature';

interface ChatGPTButtonProps {
  title: string;
  size?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

const ChatGPTButton: React.FC<ChatGPTButtonProps> = ({ 
  title, 
  size = 56, 
  position = 'top-right' 
}) => {
  const [showChat, setShowChat] = useState(false);
  const buttonAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Start pulsing animation on mount
  React.useEffect(() => {
    const startPulse = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    startPulse();
  }, [pulseAnim]);

  const handlePress = () => {
    // Button press animation
    Animated.sequence([
      Animated.timing(buttonAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setShowChat(true);
  };

  const getPositionStyle = () => {
    const baseStyle = {
      position: 'absolute' as const,
      zIndex: 1000,
    };

    switch (position) {
      case 'top-right':
        return { ...baseStyle, top: 60, right: 20 };
      case 'top-left':
        return { ...baseStyle, top: 60, left: 20 };
      case 'bottom-right':
        return { ...baseStyle, bottom: 100, right: 20 };
      case 'bottom-left':
        return { ...baseStyle, bottom: 100, left: 20 };
      default:
        return { ...baseStyle, top: 60, right: 20 };
    }
  };

  return (
    <>
      <Animated.View
        style={[
          getPositionStyle(),
          {
            transform: [
              { scale: buttonAnim },
              { scale: pulseAnim }
            ],
          },
        ]}
      >
        <TouchableOpacity
          onPress={handlePress}
          className="bg-[#F97316] rounded-full shadow-lg"
          style={{
            width: size,
            height: size,
            justifyContent: 'center',
            alignItems: 'center',
            elevation: 8,
            shadowColor: '#F97316',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="chatbubble" size={size * 0.4} color="white" />
        </TouchableOpacity>
      </Animated.View>

      <ChatGPTFeature
        visible={showChat}
        onClose={() => setShowChat(false)}
        title={title}
      />
    </>
  );
};

export default ChatGPTButton;
