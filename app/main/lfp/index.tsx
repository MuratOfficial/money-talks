import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Drawer from '@/app/components/Drawer';

import Svg, { Circle } from 'react-native-svg';
// import SortDrawerExample from '@/app/components/Drawer';

const PersonalFinancialPlanScreen = () => {
  const router = useRouter();

  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedSort, setSelectedSort] = useState('1 год');
  
  // Form states
  const [planningHorizon, setPlanningHorizon] = useState('');
  const [fio, setFio] = useState('');
  const [birthDay, setBirthDay] = useState('День');
  const [birthMonth, setBirthMonth] = useState('Месяц');
  const [birthYear, setBirthYear] = useState('Год');
  const [activity, setActivity] = useState('');
  const [financialInfo, setFinancialInfo] = useState('');
  const [selectedYear, setSelectedYear] = useState('1 год');

    const handleSortSelect = (value:any) => {
    setSelectedSort(value);
    console.log('Selected sort:', value);
  };
  
  // Insurance states
  const [lifeInsurance, setLifeInsurance] = useState('500 000 ₸');
  const [disability, setDisability] = useState('600 000 ₸');
  const [medicalInsurance, setMedicalInsurance] = useState('600 000 ₸');
  
  // Risk profile
  const [riskProfile, setRiskProfile] = useState('Агрессивный');
  
  // Goals
  const [goals, setGoals] = useState([
    {
      id: 1,
      name: 'Купить мебель',
      deadline: 'Срок достижения цели: 12 марта 2025',
      amount: 'Собрано 700 $ из 300 $',
      investment: 'Ежемесячная сумма инвестирования - 5 000 $',
      progress: 20
    },
    {
      id: 2,
      name: 'Купить холодильник',
      deadline: 'Срок достижения цели: 20 марта 2025',
      amount: 'Собрано 0 $ из 300 000 ₸',
      progress: 0
    }
  ]);

  const days: string[] = Array.from({ length: 31 }, (_, i) => i + 1).map(x=>x.toString());
  const months: string[] = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const currentYear: number = new Date().getFullYear();
  const years: string[] = Array.from({ length: 100 }, (_, i) => currentYear - i).map(x=>x.toString());
  
  const [securityPillow, setSecurityPillow] = useState('1 000 000 ₸');

   const handleSortSelectDay = (value:any) => {
    setSelectedSortDay(value);
    console.log('Selected sort:', value);
  };
   const handleSortSelectMonth = (value:any) => {
    setSelectedSortMonth(value);
    console.log('Selected sort:', value);
  };
   const handleSortSelectYear = (value:any) => {
    setSelectedSortYear(value);
    console.log('Selected sort:', value);
  };

  const [showDrawerDay, setShowDrawerDay] = useState(false);
  const [selectedSortDay, setSelectedSortDay] = useState('День');
  const [showDrawerMonth, setShowDrawerMonth] = useState(false);
  const [selectedSortMonth, setSelectedSortMonth] = useState('Месяц');
  const [showDrawerYear, setShowDrawerYear] = useState(false);
  const [selectedSortYear, setSelectedSortYear] = useState('Год');

  // const InputField = ({ label, value, onChangeText, placeholder }:any) => (
  //   <View className="mb-4">
  //     <Text className="text-gray-400 text-sm font-['SFProDisplayRegular'] mb-2">
  //       {label}
  //     </Text>
  //     <TextInput
  //       value={value}
  //       onChangeText={onChangeText}
  //       className="bg-white/10 rounded-xl px-4 py-3 text-white text-base font-['SFProDisplayRegular']"
  //       placeholder={placeholder}
  //       placeholderTextColor="#666"
  //     />
  //   </View>
  // );

  const DropdownButton = ({ value, onPress, isFirst = false, isLast = false }:any) => (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-1 bg-white/10 rounded-xl px-3 py-3 flex-row items-center justify-between ${
        !isLast ? 'mr-2' : ''
      }`}
      activeOpacity={0.7}
    >
      <Text className="text-white text-sm font-['SFProDisplayRegular']">
        {value}
      </Text>
      <Ionicons name="chevron-down" size={16} color="white" />
    </TouchableOpacity>
  );



const CircularProgress = ({ progress, color = '#4CAF50' }:{progress:number; color:string}) => {
  const size = 70;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI * 2;
  const strokeDashoffset = circumference - (circumference * progress) / 100;

  return (
    <View style={{ 
      width: size, 
      height: size, 
      justifyContent: 'center', 
      alignItems: 'center' 
    }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        {/* Фоновый круг */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#374151"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        
        {/* Прогресс круг */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      
      {/* Текст с процентами */}
      <View style={{ position: 'absolute' }}>
        <Text className="text-white text-xs font-['SFProDisplayBold']">
          {progress}%
        </Text>
      </View>
    </View>
  );
};

  const GoalCard = ({ goal }:any) => (
    <View className="bg-gray-800 rounded-xl p-4 mb-3">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 mr-3">
          <Text className="text-white text-base font-['SFProDisplaySemiBold'] mb-1">
            {goal.name}
          </Text>
          <Text className="text-gray-400 text-xs font-['SFProDisplayRegular'] mb-1">
            {goal.deadline}
          </Text>
          <Text className="text-gray-400 text-xs font-['SFProDisplayRegular'] mb-1">
            {goal.amount}
          </Text>
          {goal.investment && (
            <Text className="text-gray-400 text-xs font-['SFProDisplayRegular']">
              {goal.investment}
            </Text>
          )}
        </View>
        <CircularProgress 
          progress={goal.progress} 
          color={goal.progress > 0 ? '#4CAF50' : '#6B7280'} 
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
       
        
        <Text className="text-white text-xl font-['SFProDisplaySemiBold']">
          Личный финансовый план
        </Text>
        
        <View className="w-8" />
      </View>

      <ScrollView 
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
      >


        {/* FIO */}

           <View className="mb-4">
            <Text className="text-gray-400 text-sm font-['SFProDisplayRegular'] mb-2">
              ФИО
            </Text>
            <TextInput
              value={fio}
              onChangeText={setFio}
              className="bg-white/10 rounded-xl px-4 py-3 text-white text-base font-['SFProDisplayRegular']"
              placeholder="Введите ФИО"
              placeholderTextColor="#666"
            />
          </View>
  

        {/* Birth Date */}
        <View className="mb-4">
          <Text className="text-gray-400 text-sm font-['SFProDisplayRegular'] mb-2">
            Дата рождения
          </Text>
          <View className="flex-row">
            <DropdownButton value={selectedSortDay} onPress={() => setShowDrawerDay(true)} />
            <DropdownButton value={selectedSortMonth} onPress={() => setShowDrawerMonth(true)} />
            <DropdownButton value={selectedSortYear} onPress={() => setShowDrawerYear(true)} isLast />
          </View>
        </View>

        {/* Activity */}
        <View className="mb-4">
            <Text className="text-gray-400 text-sm font-['SFProDisplayRegular'] mb-2">
              Деятельность
            </Text>
            <TextInput
              value={activity}
              onChangeText={setActivity}
              className="bg-white/10 rounded-xl px-4 py-3 text-white text-base font-['SFProDisplayRegular']"
              placeholder="Введите деятельность"
              placeholderTextColor="#666"
            />
          </View>


        {/* Financial Info */}

        <View className="mb-4">
            <Text className="text-gray-400 text-sm font-['SFProDisplayRegular'] mb-2">
              Финансово-зависимые люди
            </Text>
            <TextInput
              value={financialInfo}
              onChangeText={setFinancialInfo}
              className="bg-white/10 rounded-xl px-4 py-3 text-white text-base font-['SFProDisplayRegular']"
              placeholder="Введите количество"
              keyboardType="number-pad"
              placeholderTextColor="#666"
            />
          </View>


        <View className="mb-6">
          <Text className="text-white text-lg font-['SFProDisplaySemiBold'] mb-4">
            ЛФП
          </Text>
          
          <View className="flex-row items-center justify-between ">

            <TouchableOpacity
              onPress={() => setShowDrawer(true)}
              className=" px-3 py-1.5 border border-white w-fit rounded-2xl flex flex-row items-center justify-center gap-2"
            >
              <Text className="text-white text-xs font-['SFProDisplayRegular']">
                {selectedSort}
              </Text>
              <View className="w-4 h-4  rounded items-center justify-center">
                      <Ionicons name="funnel-outline" size={14} color="white" />
                    </View>
            </TouchableOpacity>
            <Drawer 
              title='Сортировка'
              visible={showDrawer}
              onClose={() => setShowDrawer(false)}
              onSelect={handleSortSelect}
              selectedValue={selectedSort}
              options={ ['1 год', '5 лет', '10  лет', '20 лет', '25 лет']}
              
              />
        
            
            <TouchableOpacity className="ml-4 px-3 py-2 gap-2 rounded-lg flex-row items-center">
              <Text className="text-white text-sm font-['SFProDisplayRegular'] mr-2">
                Скачайте файл
              </Text>
              <View className="w-4 h-4  rounded items-center justify-center">
                <Image 
                  source={require('../../../assets/images/pdf.png')}
                  className="w-6 h-6"
                  resizeMode="contain"
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Financial Details */}
        <View className="mb-6">
          <Text className="text-gray-400 text-sm font-['SFProDisplayRegular'] mb-3">
            Расчет деталей
          </Text>
          
          <View className="space-y-3 p-3 rounded-xl bg-white/10">
            <View className="flex-row justify-between items-center">
              <Text className="text-white text-sm font-['SFProDisplayRegular']">Расходы</Text>
              <View className="flex-row items-center">
                <Text className="text-white text-sm font-['SFProDisplayRegular'] mr-2">500 000 ₸</Text>
                <Ionicons name="create-outline" size={16} color="white" />
              </View>
            </View>
            
            <View className="flex-row justify-between items-center">
              <Text className="text-white text-sm font-['SFProDisplayRegular']">Доходы</Text>
              <View className="flex-row items-center">
                <Text className="text-white text-sm font-['SFProDisplayRegular'] mr-2">400 000 ₸</Text>
                <Ionicons name="create-outline" size={16} color="white" />
              </View>
            </View>
            
            <View className="flex-row justify-between items-center">
              <Text className="text-white text-sm font-['SFProDisplayRegular']">Дельта</Text>
              <Text className="text-white text-sm font-['SFProDisplayRegular']">100 000 ₸</Text>
            </View>
          </View>
        </View>

        {/* Net Worth Calculation */}
        <View className="mb-6">
          <Text className="text-gray-400 text-sm font-['SFProDisplayRegular'] mb-3">
            Расчет чистого капитала
          </Text>
          
          <View className="space-y-3 p-3 rounded-xl bg-white/10">
            <View className="flex-row justify-between items-center">
              <Text className="text-white text-sm font-['SFProDisplayRegular']">Активы</Text>
              <View className="flex-row items-center">
                <Text className="text-white text-sm font-['SFProDisplayRegular'] mr-2">79 200 000 ₸</Text>
                <Ionicons name="create-outline" size={16} color="white" />
              </View>
            </View>
            
            <View className="flex-row justify-between items-center">
              <Text className="text-white text-sm font-['SFProDisplayRegular']">Пассивы</Text>
              <View className="flex-row items-center">
                <Text className="text-white text-sm font-['SFProDisplayRegular'] mr-2">5 700 000 ₸</Text>
                <Ionicons name="create-outline" size={16} color="white" />
              </View>
            </View>
            
            <View className="flex-row justify-between items-center">
              <Text className="text-white text-sm font-['SFProDisplayRegular']">Чистый капитал</Text>
              <View className="flex-row items-center">
                <Text className="text-white text-sm font-['SFProDisplayRegular'] mr-2">74 500 000 ₸</Text>
                <Ionicons name="create-outline" size={16} color="white" />
              </View>
            </View>
          </View>
        </View>

        {/* Security Pillow */}
        <View className="mb-6">
          <Text className="text-gray-400 text-sm font-['SFProDisplayRegular'] mb-3">
            Подушка безопасности на 3 месяца
          </Text>
          <View className="flex-row justify-between items-center p-3 rounded-xl bg-white/10">
            <Text className="text-white text-sm font-['SFProDisplayRegular']">По постоянному расходу</Text>
            <Text className="text-white text-sm font-['SFProDisplayRegular']">{securityPillow}</Text>
          </View>
        </View>

        {/* Insurance Protection */}
        <View className="mb-6">
          <Text className="text-gray-400 text-sm font-['SFProDisplayRegular'] mb-3">
            Страховая защита
          </Text>
          
          <View className="space-y-3 p-3 rounded-xl bg-white/10">
            <View className="flex-row justify-between items-center">
              <Text className="text-white text-sm font-['SFProDisplayRegular']">Уход из жизни</Text>
              <Text className="text-white text-sm font-['SFProDisplayRegular']">{lifeInsurance}</Text>
            </View>
            
            <View className="flex-row justify-between items-center">
              <Text className="text-white text-sm font-['SFProDisplayRegular']">Инвалидность</Text>
              <Text className="text-white text-sm font-['SFProDisplayRegular']">{disability}</Text>
            </View>
            
            <View className="flex-row justify-between items-center">
              <Text className="text-white text-sm font-['SFProDisplayRegular']">Болезненный лист</Text>
              <Text className="text-white text-sm font-['SFProDisplayRegular']">{medicalInsurance}</Text>
            </View>
          </View>
        </View>

        {/* Risk Profile */}
        <View className="mb-6">
          <Text className="text-gray-400 text-sm font-['SFProDisplayRegular'] mb-3">
            Риск-профиль
          </Text>
          <TouchableOpacity className="bg-gray-800 rounded-xl px-4 py-3 flex-row items-center justify-between">
            <Text className="text-white text-base font-['SFProDisplayRegular']">
              {riskProfile}
            </Text>
            <Ionicons name="chevron-down" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Goals */}
        <View className="mb-6">
          <Text className="text-white text-base font-['SFProDisplaySemiBold'] mb-4">
            Цели
          </Text>
          
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </View>

        <Drawer 
          title='День'
          visible={showDrawerDay}
          onClose={() => setShowDrawerDay(false)}
          onSelect={handleSortSelectDay}
          selectedValue={selectedSortDay}
          options={days}
          animationType='fade'
          
          />
          <Drawer 
          title='Месяц'
          visible={showDrawerMonth}
          onClose={() => setShowDrawerMonth(false)}
          onSelect={handleSortSelectMonth}
          selectedValue={selectedSortMonth}
          options={months}
          animationType='fade'
          
          />
          <Drawer 
          title='Год'
          visible={showDrawerYear}
          onClose={() => setShowDrawerYear(false)}
          onSelect={handleSortSelectYear}
          selectedValue={selectedSortYear}
          options={ years}
          animationType='fade'
          
          />

      </ScrollView>
    </SafeAreaView>
  );
};

export default PersonalFinancialPlanScreen;