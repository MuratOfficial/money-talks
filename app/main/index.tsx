import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Drawer from '../components/Drawer';
import useFinancialStore from '@/hooks/useStore';

const MainScreen = () => {

    const handleGoal = (title:string) => {
      if (title !== "Цели") {
        return;
      }
      

      router.replace('/main/goals/main');
    };


    
   
     const [showDrawerFilter, setShowDrawerFilter] = useState(false);
     const [selectedSortFilter, setSelectedSortFilter] = useState('Сегодня');

  const handleSortSelectFilter = (value:any) => {
    setSelectedSortFilter(value);
    console.log('Selected sort:', value);
  };
  
  

    const router = useRouter();
  

    const { 
    categories, 
    wallets,
    walletBalance
  } = useFinancialStore();


  const categoriesWith = [
    {
      id: 'wallet',
      title: 'Кошелек',
      balance: walletBalance,
      items: wallets.map(x=>(
        {id:x.id, name: x.name, amount: `${x.summ.toString()} ${x.currency}`, color: x.color, icon: x.icon || 'card'}
      ))
    },
    ...categories,
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
          <TouchableOpacity onPress={()=>setShowDrawerFilter(true)} className="flex-row items-center bg-white/20 px-2 py-1 rounded-xl border border-white/50">
            <Text className="text-white text-sm font-['SFProDisplayRegular'] mr-1">
              {selectedSortFilter}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#FFF" />
          </TouchableOpacity>
        ) : null}
      </View>
      
      <View className="flex-row flex-wrap justify-between">
      {category.items.length === 0 ?
        <Text className='w-full text-center text-white/60 text-sm'>
          Нету данных в данной категорий
        </Text> : category.items.map((item:any, index:number) => (
          <CategoryCard key={index} item={item} title={category.title}/>
        ))
      }
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

                 <Drawer 
                      title='Период'
                      visible={showDrawerFilter}
                      onClose={() => setShowDrawerFilter(false)}
                      onSelect={handleSortSelectFilter}
                      selectedValue={selectedSortFilter}
                      options={ ['Сегодня', 'Неделя', 'Месяц', 'Год', 'Все']}
                      animationType='fade'
                      
                      />

        <ScrollView 
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
        >
          {categoriesWith.map((category, index) => (
            <CategorySection key={index} category={category} />
          ))}

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default MainScreen;