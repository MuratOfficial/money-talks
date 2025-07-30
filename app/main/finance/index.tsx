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
   iconName: string;
  iconLibrary: 'ionicons' | 'material';
  onPress: () => void;
}

// Переместил images в начало файла для лучшей читаемости
// const images = {
//   img1: require('@/assets/images/expence.png'),
//   img2: require('@/assets/images/income.png'),
//   img3: require('@/assets/images/assets.png'),
//   img4: require('@/assets/images/liabilities.png'),
//   img5: require('@/assets/images/analysis.png'),
// };

const FinanceCard: React.FC<FinanceCardProps> = ({ title,  iconName, iconLibrary, onPress }) => {


  const renderIcon = () => {
    if (iconLibrary === 'ionicons') {
      return <Ionicons name={iconName as any} size={48} color="#F9FAFB" />;
    } else {
      return <MaterialIcons name={iconName as any} size={48} color="#F9FAFB" />;
    }
  };

  return (
    <TouchableOpacity 
      className="w-[48%] aspect-[10/8] bg-white/15 rounded-2xl mb-4 active:opacity-80"
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View className="flex-1 justify-center items-start p-4">
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
      iconName: 'pie-chart',
      iconLibrary: 'ionicons' as const,
    },
    {
      title: 'Доходы',
      iconName: 'bar-chart',
      iconLibrary: 'ionicons' as const,
    },
    {
      title: 'Активы',
      iconName: 'trending-up',
      iconLibrary: 'ionicons' as const,
    },
    {
      title: 'Пассивы',
      iconName: 'account-balance-wallet',
      iconLibrary: 'material' as const,
    },
    {
      title: 'Анализ',
      iconName: 'analytics',
      iconLibrary: 'ionicons' as const,
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <View className="px-6 py-3">
        <Text className="text-lg text-white font-['SFProDisplaySemiBold']">
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
              iconLibrary={item.iconLibrary}
              onPress={() => handleCardPress(item.title)}
            />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default FinanceApp;