import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Drawer from '@/app/components/Drawer';
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';

import Svg, { Circle } from 'react-native-svg';
import useFinancialStore from '@/hooks/useStore';

const PersonalFinancialPlanScreen = () => {
  const router = useRouter();

  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedSort, setSelectedSort] = useState('1 год');

  const {user, getCategoryBalance} = useFinancialStore();
  
  // Form states
  const [fio, setFio] = useState(user?.name || "");
  const [birthDay, setBirthDay] = useState('День');
  const [birthMonth, setBirthMonth] = useState('Месяц');
  const [birthYear, setBirthYear] = useState('Год');
  const [activity, setActivity] = useState('');
  const [financialInfo, setFinancialInfo] = useState('');
  const [selectedYear, setSelectedYear] = useState('1 год');

  const income = getCategoryBalance("income");
  const expence = getCategoryBalance("expence");

  const delta = income - expence || 0;

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
    setBirthDay(value);
  };
  
  const handleSortSelectMonth = (value:any) => {
    setSelectedSortMonth(value);
    setBirthMonth(value);
  };
  
  const handleSortSelectYear = (value:any) => {
    setSelectedSortYear(value);
    setBirthYear(value);
  };

  const [showDrawerDay, setShowDrawerDay] = useState(false);
  const [selectedSortDay, setSelectedSortDay] = useState('День');
  const [showDrawerMonth, setShowDrawerMonth] = useState(false);
  const [selectedSortMonth, setSelectedSortMonth] = useState('Месяц');
  const [showDrawerYear, setShowDrawerYear] = useState(false);
  const [selectedSortYear, setSelectedSortYear] = useState('Год');

  // Функция генерации PDF с Tailwind CSS
  const generatePDF = async () => {
    try {
      const currentDate = new Date().toLocaleDateString('ru-RU');
      const birthDate = `${selectedSortDay} ${selectedSortMonth} ${selectedSortYear}`;
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            body { font-family: 'Inter', sans-serif; }
            .progress-bar { background: linear-gradient(to right, #10B981 var(--progress, 0%), #E5E7EB var(--progress, 0%)); }
          </style>
        </head>
        <body class="bg-gray-50">
          <div class="max-w-4xl mx-auto p-8 bg-white shadow-lg">
            <!-- Header -->
            <div class="text-center border-b-4 border-blue-500 pb-6 mb-8">
              <h1 class="text-3xl font-bold text-blue-600 mb-2">Личный Финансовый План</h1>
              <p class="text-gray-600">Сгенерировано: ${currentDate}</p>
              <p class="text-gray-600">Период планирования: ${selectedSort}</p>
            </div>

            <!-- Персональная информация -->
            <div class="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
              <h2 class="text-xl font-semibold text-blue-700 mb-4 border-b-2 border-blue-300 pb-2">Персональная информация</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="flex justify-between items-center p-3 bg-white rounded border">
                  <span class="font-medium text-gray-700">ФИО:</span>
                  <span class="text-gray-900">${fio || 'Не указано'}</span>
                </div>
                <div class="flex justify-between items-center p-3 bg-white rounded border">
                  <span class="font-medium text-gray-700">Дата рождения:</span>
                  <span class="text-gray-900">${birthDate !== 'День Месяц Год' ? birthDate : 'Не указано'}</span>
                </div>
                <div class="flex justify-between items-center p-3 bg-white rounded border">
                  <span class="font-medium text-gray-700">Деятельность:</span>
                  <span class="text-gray-900">${activity || 'Не указано'}</span>
                </div>
                <div class="flex justify-between items-center p-3 bg-white rounded border">
                  <span class="font-medium text-gray-700">Финансово-зависимые:</span>
                  <span class="text-gray-900">${financialInfo || 'Не указано'}</span>
                </div>
              </div>
            </div>

            <!-- Финансовый анализ -->
            <div class="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
              <h2 class="text-xl font-semibold text-green-700 mb-4 border-b-2 border-green-300 pb-2">Финансовый анализ</h2>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-white p-4 rounded-lg border-l-4 border-green-500 shadow-sm">
                  <div class="text-sm text-gray-600">Доходы</div>
                  <div class="text-2xl font-bold text-green-600">${income.toLocaleString('ru-RU')} ₸</div>
                </div>
                <div class="bg-white p-4 rounded-lg border-l-4 border-red-500 shadow-sm">
                  <div class="text-sm text-gray-600">Расходы</div>
                  <div class="text-2xl font-bold text-red-600">${expence.toLocaleString('ru-RU')} ₸</div>
                </div>
                <div class="bg-white p-4 rounded-lg border-l-4 border-${delta >= 0 ? 'green' : 'red'}-500 shadow-sm">
                  <div class="text-sm text-gray-600">Дельта</div>
                  <div class="text-2xl font-bold text-${delta >= 0 ? 'green' : 'red'}-600">${delta.toLocaleString('ru-RU')} ₸</div>
                </div>
              </div>
            </div>

            <!-- Чистый капитал -->
            <div class="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
              <h2 class="text-xl font-semibold text-purple-700 mb-4 border-b-2 border-purple-300 pb-2">Расчет чистого капитала</h2>
              <div class="space-y-3">
                <div class="flex justify-between items-center p-3 bg-white rounded border">
                  <span class="font-medium text-gray-700">Активы:</span>
                  <span class="text-lg font-semibold text-green-600">79 200 000 ₸</span>
                </div>
                <div class="flex justify-between items-center p-3 bg-white rounded border">
                  <span class="font-medium text-gray-700">Пассивы:</span>
                  <span class="text-lg font-semibold text-red-600">5 700 000 ₸</span>
                </div>
                <div class="flex justify-between items-center p-3 bg-gradient-to-r from-blue-100 to-blue-200 rounded border-2 border-blue-300">
                  <span class="font-bold text-gray-800">Чистый капитал:</span>
                  <span class="text-xl font-bold text-blue-700">74 500 000 ₸</span>
                </div>
              </div>
            </div>

            <!-- Подушка безопасности -->
            <div class="mb-8 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg p-6 border border-yellow-200">
              <h2 class="text-xl font-semibold text-yellow-700 mb-4 border-b-2 border-yellow-300 pb-2">Подушка безопасности</h2>
              <div class="bg-white p-4 rounded-lg border border-yellow-300">
                <div class="flex justify-between items-center">
                  <span class="font-medium text-gray-700">На 3 месяца (по постоянному расходу):</span>
                  <span class="text-lg font-bold text-yellow-700">${securityPillow}</span>
                </div>
              </div>
            </div>

            <!-- Страховая защита -->
            <div class="mb-8 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-6 border border-indigo-200">
              <h2 class="text-xl font-semibold text-indigo-700 mb-4 border-b-2 border-indigo-300 pb-2">Страховая защита</h2>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-white p-4 rounded-lg border border-indigo-200">
                  <div class="text-sm text-gray-600 mb-1">Уход из жизни</div>
                  <div class="text-lg font-semibold text-indigo-700">${lifeInsurance}</div>
                </div>
                <div class="bg-white p-4 rounded-lg border border-indigo-200">
                  <div class="text-sm text-gray-600 mb-1">Инвалидность</div>
                  <div class="text-lg font-semibold text-indigo-700">${disability}</div>
                </div>
                <div class="bg-white p-4 rounded-lg border border-indigo-200">
                  <div class="text-sm text-gray-600 mb-1">Болезненный лист</div>
                  <div class="text-lg font-semibold text-indigo-700">${medicalInsurance}</div>
                </div>
              </div>
            </div>

            <!-- Риск-профиль -->
            <div class="mb-8 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-6 border border-red-200">
              <h2 class="text-xl font-semibold text-red-700 mb-4 border-b-2 border-red-300 pb-2">Инвестиционный профиль</h2>
              <div class="bg-white p-4 rounded-lg border-2 border-red-300">
                <div class="flex justify-between items-center">
                  <span class="font-medium text-gray-700">Риск-профиль:</span>
                  <span class="px-4 py-2 bg-red-100 text-red-700 font-bold rounded-full">${riskProfile}</span>
                </div>
              </div>
            </div>

            <!-- Финансовые цели -->
            <div class="mb-8 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg p-6 border border-teal-200">
              <h2 class="text-xl font-semibold text-teal-700 mb-4 border-b-2 border-teal-300 pb-2">Финансовые цели</h2>
              <div class="space-y-4">
                ${goals.map(goal => `
                  <div class="bg-white p-6 rounded-lg border border-teal-200 shadow-sm">
                    <div class="flex justify-between items-start mb-4">
                      <div class="flex-1">
                        <h3 class="text-lg font-semibold text-teal-700 mb-2">${goal.name}</h3>
                        <p class="text-sm text-gray-600 mb-1">${goal.deadline}</p>
                        <p class="text-sm text-gray-600 mb-1">${goal.amount}</p>
                        ${goal.investment ? `<p class="text-sm text-gray-600">${goal.investment}</p>` : ''}
                      </div>
                      <div class="ml-4 text-center">
                        <div class="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center border-4 border-${goal.progress > 0 ? 'green' : 'gray'}-300">
                          <span class="text-sm font-bold text-gray-700">${goal.progress}%</span>
                        </div>
                      </div>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-3">
                      <div class="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-300" style="width: ${goal.progress}%"></div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Рекомендации -->
            <div class="mb-8 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg p-6 border border-gray-200">
              <h2 class="text-xl font-semibold text-gray-700 mb-4 border-b-2 border-gray-300 pb-2">Рекомендации</h2>
              <div class="space-y-3">
                <div class="p-4 bg-white rounded-lg border-l-4 border-blue-500">
                  <p class="text-gray-700">• Поддерживайте подушку безопасности на уровне 3-6 месяцев расходов</p>
                </div>
                <div class="p-4 bg-white rounded-lg border-l-4 border-green-500">
                  <p class="text-gray-700">• Инвестируйте свободный денежный поток согласно вашему риск-профилю</p>
                </div>
                <div class="p-4 bg-white rounded-lg border-l-4 border-yellow-500">
                  <p class="text-gray-700">• Регулярно пересматривайте и корректируйте финансовые цели</p>
                </div>
                <div class="p-4 bg-white rounded-lg border-l-4 border-purple-500">
                  <p class="text-gray-700">• Обеспечьте достаточный уровень страховой защиты</p>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="text-center pt-6 border-t-2 border-blue-500">
              <p class="text-sm text-gray-500">
                Данный документ сгенерирован автоматически и носит рекомендательный характер.<br>
                Для принятия инвестиционных решений рекомендуется консультация с финансовым консультантом.
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Создаем PDF
      const { uri } = await Print.printToFileAsync({ 
        html: htmlContent,
        base64: false 
      });

      console.log('PDF создан:', uri);

      // Показываем меню для сохранения/поделиться
      await shareAsync(uri, { 
        UTI: '.pdf', 
        mimeType: 'application/pdf',
        dialogTitle: 'Сохранить финансовый план'
      });

    } catch (error) {
      console.error('Ошибка при создании PDF:', error);
      Alert.alert('Ошибка', 'Не удалось создать PDF файл');
    }
  };

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

            <TouchableOpacity 
              onPress={generatePDF}
              className="ml-4 px-3 py-2 gap-2 rounded-lg flex-row items-center "
              activeOpacity={0.8}
            >
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
                <Text className="text-white text-sm font-['SFProDisplayRegular'] mr-2">{expence} ₸</Text>
                <Ionicons name="create-outline" size={16} color="white" />
              </View>
            </View>
            
            <View className="flex-row justify-between items-center">
              <Text className="text-white text-sm font-['SFProDisplayRegular']">Доходы</Text>
              <View className="flex-row items-center">
                <Text className="text-white text-sm font-['SFProDisplayRegular'] mr-2">{income} ₸</Text>
                <Ionicons name="create-outline" size={16} color="white" />
              </View>
            </View>
            
            <View className="flex-row justify-between items-center">
              <Text className="text-white text-sm font-['SFProDisplayRegular']">Дельта</Text>
              <Text className="text-white text-sm font-['SFProDisplayRegular']">{delta} ₸</Text>
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
          options={years}
          animationType='fade'
        />

      </ScrollView>
    </SafeAreaView>
  );
};

export default PersonalFinancialPlanScreen;