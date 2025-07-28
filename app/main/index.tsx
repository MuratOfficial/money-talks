import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const MainScreen = () => {

    const handleGoal = (title:string) => {
      if (title !== "Цели") {
        return;
      }
      

      router.replace('/main/goals/main');
    };

    const router = useRouter();
  const [walletBalance] = useState('950 000 ₸');

  const categories = [
    {
      title: 'Кошелек',
      balance: walletBalance,
      items: [
        { name: 'Банковский счет', amount: '20 000 ₸', color: '#4FC3F7', icon: 'card' },
        { name: 'Бумажные счеты', amount: '20 000 ₸', color: '#66BB6A', icon: 'document-text' },
        { name: 'Валютные вклады', amount: '200 000 ₸', color: '#7986CB', icon: 'trending-up' },
        { name: 'Пенсионные активы', amount: '700 000 ₸', color: '#FFB74D', icon: 'briefcase' }
      ]
    },
    {
      title: 'Доходы',
      balance: '900 000 ₸',
      items: [
        { name: 'Зарплата', amount: '600 000 ₸', color: '#4FC3F7', icon: 'wallet' },
        { name: 'Банк', amount: '50 000 ₸', color: '#66BB6A', icon: 'business' },
        { name: 'Криптовалюта', amount: '200 000 ₸', color: '#7986CB', icon: 'logo-bitcoin' },
        { name: 'Пенсия', amount: '200 000 ₸', color: '#FFB74D', icon: 'card' }
      ]
    },
    {
      title: 'Расходы',
      balance: '79 500 ₸',
      items: [
        { name: 'Покупки', amount: '40 000 ₸', color: '#4FC3F7', icon: 'bag' },
        { name: 'Образование', amount: '8 000 ₸', color: '#66BB6A', icon: 'school' },
        { name: 'Техника', amount: '6 000 ₸', color: '#E91E63', icon: 'phone-portrait' },
        { name: 'Развлечения', amount: '1 300 ₸', color: '#FF9800', icon: 'game-controller' }
      ]
    },
    {
      title: 'Цели',
      items: [
        { name: 'Краткосрочные', color: '#29B6F6', icon: 'snow' },
        { name: 'Среднесрочные', color: '#66BB6A', icon: 'medical' },
        { name: 'Долгосрочные', color: '#7986CB', icon: 'time' }
      ]
    }
  ];

  const CategoryCard = ({ item, title }:any) => (
    <TouchableOpacity
      className="w-[23%] items-center mb-6"
      activeOpacity={0.8}
      onPress={
        ()=>{
          handleGoal(title)
        }
      }
    >
      <View 
        className="w-14 h-14 rounded-full items-center justify-center mb-2"
        style={{ backgroundColor: item.color }}
      >
        <Ionicons name={item.icon} size={24} color="white" />
      </View>
      
      <Text className="text-white text-xs font-['SFProDisplayRegular'] text-center mb-1">
        {item.name}
      </Text>
      
      {item.amount && (
        <Text className="text-white text-xs font-['SFProDisplayBold'] text-center">
          {item.amount}
        </Text>
      )}
    </TouchableOpacity>
  );

  const CategorySection = ({ category }:any) => (
    <View className="mb-6">
      <View className="flex-row items-center justify-between mb-4">
        <View>
          <Text className="text-white text-lg font-['SFProDisplaySemiBold']">
            {category.title}
          </Text>
          {category.balance && (
            <Text className="text-gray-400 text-sm font-['SFProDisplayRegular']">
              {category.balance}
            </Text>
          )}
        </View>
        
        {category.title === 'Кошелек' ? (
          <TouchableOpacity onPress={()=>router.replace('/main/wallet/add-wallet')} className="flex-row items-center bg-white/20 px-2 py-1 rounded-xl border border-white/50">
            <Text className="text-white text-sm font-['SFProDisplayRegular'] mr-1">
              Добавить
            </Text>
            <Ionicons name="add" size={16} color="#FFF" />
          </TouchableOpacity>
        ) : category.title !== 'Цели' ? (
          <TouchableOpacity className="flex-row items-center bg-white/20 px-2 py-1 rounded-xl border border-white/50">
            <Text className="text-white text-sm font-['SFProDisplayRegular'] mr-1">
              Изменить
            </Text>
            <Ionicons name="chevron-down" size={16} color="#FFF" />
          </TouchableOpacity>
        ) : null}
      </View>
      
      <View className="flex-row flex-wrap justify-between">
        {category.items.map((item:any, index:number) => (
          <CategoryCard key={index} item={item} title={category.title}/>
        ))}
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={['#1B5E20', '#000000']}
      className="flex-1"
    >
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3">
          <Text className="text-white text-xl font-['SFProDisplayBold']">
            Главная
          </Text>
          
   
        </View>

        <ScrollView 
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
        >
          {categories.map((category, index) => (
            <CategorySection key={index} category={category} />
          ))}

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default MainScreen;