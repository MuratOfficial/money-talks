import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Drawer from '@/app/components/Drawer';
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
  
  const [securityPillow, setSecurityPillow] = useState('1 000 000 ₸');

  const years = ['1 год', '2 года', '3 года', '5 лет'];
  const riskProfiles = ['Консервативный', 'Умеренный', 'Агрессивный'];

  const InputField = ({ label, value, onChangeText, placeholder }:any) => (
    <View className="mb-4">
      <Text className="text-gray-400 text-sm font-['SFProDisplayRegular'] mb-2">
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        className="bg-white/10 rounded-xl px-4 py-3 text-white text-base font-['SFProDisplayRegular']"
        placeholder={placeholder}
        placeholderTextColor="#666"
      />
    </View>
  );

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

  const YearButton = ({ year, isSelected, onPress }:any) => (
    <TouchableOpacity
      onPress={onPress}
      className={`px-4 py-2 rounded-full mr-3 ${
        isSelected 
          ? 'bg-gray-600' 
          : 'bg-gray-800'
      }`}
      activeOpacity={0.8}
    >
      <Text className={`text-sm font-['SFProDisplayMedium'] ${
        isSelected ? 'text-white' : 'text-gray-400'
      }`}>
        {year}
      </Text>
    </TouchableOpacity>
  );

  const CircularProgress = ({ progress, color = '#4CAF50' }:any) => {
    const radius = 35;
    const strokeWidth = 6;
    const normalizedRadius = radius - strokeWidth * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDasharray = `${circumference} ${circumference}`;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <View className="relative">
        <svg
          height={radius * 2}
          width={radius * 2}
          className="transform -rotate-90"
        >
          <circle
            stroke="#374151"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke={color}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        <View className="absolute inset-0 items-center justify-center">
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
        {/* Planning Horizon */}
        <InputField
          label="Горизонт планирования"
          value={planningHorizon}
          onChangeText={setPlanningHorizon}
          placeholder="Введите горизонт планирования"
        />

        {/* FIO */}
        <InputField
          label="ФИО"
          value={fio}
          onChangeText={setFio}
          placeholder="Введите ФИО"
        />

        {/* Birth Date */}
        <View className="mb-4">
          <Text className="text-gray-400 text-sm font-['SFProDisplayRegular'] mb-2">
            Дата рождения
          </Text>
          <View className="flex-row">
            <DropdownButton value={birthDay} onPress={() => console.log('Day')} />
            <DropdownButton value={birthMonth} onPress={() => console.log('Month')} />
            <DropdownButton value={birthYear} onPress={() => console.log('Year')} isLast />
          </View>
        </View>

        {/* Activity */}
        <InputField
          label="Деятельность"
          value={activity}
          onChangeText={setActivity}
          placeholder="Введите деятельность"
        />

        {/* Financial Info */}
        <InputField
          label="Финансово-зависимые люди"
          value={financialInfo}
          onChangeText={setFinancialInfo}
          placeholder="Введите информацию"
        />

        {/* Year Selection */}
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

      </ScrollView>
    </SafeAreaView>
  );
};

export default PersonalFinancialPlanScreen;