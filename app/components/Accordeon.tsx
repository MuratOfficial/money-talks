import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, Easing, LayoutAnimation } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AccordionProps {
  title: string;
  description: string;
}

const Accordion: React.FC<AccordionProps> = ({ title, description }) => {
  const [expanded, setExpanded] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const animation = useRef(new Animated.Value(0)).current;

  const toggleAccordion = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
    
    Animated.timing(animation, {
      toValue: expanded ? 0 : 1,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start();
  };

  const heightInterpolate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, contentHeight],
  });

  const rotateInterpolate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View className=" bg-[#333333] flex flex-col  justify-center rounded-xl p-3 px-3">
      <TouchableOpacity
        onPress={toggleAccordion}
        className="flex-row justify-between items-center "
        activeOpacity={0.7}
      >
        <Text className="  text-white">
          {title}
        </Text>
        
        <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
          <Ionicons 
            name="chevron-down" 
            size={18} 
            className="text-white" 
          />
        </Animated.View>
      </TouchableOpacity>

      <Animated.View style={{ height: heightInterpolate, overflow: 'hidden' }}>
        <View 
          onLayout={(event) => {
            const { height } = event.nativeEvent.layout;
            setContentHeight(height);
          }}
          className=""
        >
            <Text className="pt-4 text-white">
          {description}
        </Text>
        </View>
        
      </Animated.View>
    </View>
  );
};

export default Accordion;

