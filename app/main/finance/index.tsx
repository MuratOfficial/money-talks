import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';

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

const FinanceCard: React.FC<FinanceCardProps> = ({ title,  iconName,  onPress }) => {


  const renderIcon = () => {
    return <Image 
                        source={iconName}
                        className="w-6 h-6"
                        resizeMode="contain"
                      />
  };

  return (
    <TouchableOpacity 
      className="w-[48%] aspect-[10/8] bg-white/15 rounded-2xl mb-4 active:opacity-80"
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View className="flex-1 justify-between items-start p-4">
          {renderIcon()}
          
        <Text className="text-gray-50 text-sm mt-3 text-left font-['SFProDisplayRegular']">
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const FinanceApp: React.FC = () => {
  const handleCardPress = (cardName: string) => {
    console.log(`Pressed ${cardName}`);
    // Здесь можно добавить навигацию к соответствующему экрану
  };
  const financeItems = [
    {
      title: 'Расходы',
      iconName: images["img1"]
    },
    {
      title: 'Доходы',
      iconName: images["img2"]
    },
    {
      title: 'Активы',
      iconName: images["img3"],
    },
    {
      title: 'Пассивы',
      iconName: images["img4"]
    },
    {
      title: 'Анализ',
      iconName: images["img5"]
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
 
   
      <View className="px-4 py-3">
        <Text className="text-xl text-white font-['SFProDisplaySemiBold']">
          Финансы
        </Text>
      </View>

      <View className="flex-1 px-4">
        <View className="flex-row flex-wrap justify-between">
          {financeItems.map((item, index) => (
            <FinanceCard
              key={index}
              title={item.title}
              iconName={item.iconName}
              onPress={() => handleCardPress(item.title)}
            />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default FinanceApp;