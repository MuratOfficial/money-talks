import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons, Feather, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { ProgressBar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dropdown } from 'react-native-element-dropdown';

const PlanScreen = () => {
  const [horizon, setHorizon] = useState<string | null>(null);
  const [riskProfile, setRiskProfile] = useState<string | null>(null);

  return (
    <SafeAreaView className="flex-1 font-['SFProDisplaySemiBold'] bg-black">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text className="text-white text-xl font-bold mb-4">Личный Финансовый план</Text>

        <Text className="text-white mb-1">Горизонт планирования</Text>
        {/* <Dropdown 
          data={[{ label: '1 год', value: '1' }, { label: '3 года', value: '3' }]}
          labelField="label"
          valueField="value"
          value={horizon}
          onChange={item => setHorizon(item.value)}
          placeholder="Выберите период"
          style={{ backgroundColor: '#1f1f1f', borderRadius: 8, padding: 10 }}
        /> */}

        <Text className="text-white mt-4 mb-1">ФИО</Text>
        <TextInput className="bg-neutral-800 rounded-md p-3 text-white" placeholderTextColor="#888" placeholder="Введите ФИО" />

        <Text className="text-white mt-4 mb-1">Дата рождения</Text>
        <View className="flex-row justify-between">
          {['День', 'Месяц', 'Год'].map((item) => (
            <TextInput key={item} className="bg-neutral-800 rounded-md p-3 text-white w-[30%]" placeholder={item} placeholderTextColor="#888" />
          ))}
        </View>

        <Text className="text-white mt-4 mb-1">Деятельность</Text>
        <TextInput className="bg-neutral-800 rounded-md p-3 text-white" placeholderTextColor="#888" placeholder="Введите деятельность" />

        <Text className="text-white mt-4 mb-1">Финансово-зависимые люди</Text>
        <TextInput className="bg-neutral-800 rounded-md p-3 text-white" placeholderTextColor="#888" placeholder="Введите информацию" />

        <View className="flex-row justify-between items-center mt-6">
          <Text className="text-white text-lg font-bold">ЛФП</Text>
          <TouchableOpacity>
            <Ionicons name="download-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View className="mt-4 space-y-3">
          {[
            { label: 'Расходы', value: '500 000₸' },
            { label: 'Доходы', value: '400 000₸' },
            { label: 'Дельта', value: '100 000₸' },
          ].map((item) => (
            <View key={item.label} className="flex-row justify-between bg-neutral-900 p-3 rounded-md">
              <Text className="text-white">{item.label}</Text>
              <Text className="text-white font-semibold">{item.value}</Text>
            </View>
          ))}
        </View>

        <Text className="text-white font-bold mt-6 mb-2">Расчёт чистого капитала</Text>
        {[
          { label: 'Активы', value: '79 200 000₸' },
          { label: 'Пассивы', value: '5 100 000₸' },
          { label: 'Чистый капитал', value: '74 500 000₸' },
        ].map((item) => (
          <View key={item.label} className="flex-row justify-between bg-neutral-900 p-3 rounded-md mb-1">
            <Text className="text-white">{item.label}</Text>
            <Text className="text-white font-semibold">{item.value}</Text>
          </View>
        ))}

        <Text className="text-white font-bold mt-6 mb-2">Подушка безопасности за 3 месяца</Text>
        <View className="bg-neutral-900 p-3 rounded-md mb-2">
          <Text className="text-white">По постоянному риску: 1 000 000₸</Text>
        </View>

        <Text className="text-white font-bold mt-6 mb-2">Страховая защита</Text>
        {[
          'Уход из жизни: 500 000₸',
          'Инвалидность: 600 000₸',
          'Критический пакет: 600 000₸'
        ].map((item, i) => (
          <View key={i} className="bg-neutral-900 p-3 rounded-md mb-1">
            <Text className="text-white">{item}</Text>
          </View>
        ))}

        <Text className="text-white font-bold mt-6 mb-2">Риск профиль</Text>
        <Dropdown
          data={[{ label: 'Агрессивный', value: 'aggressive' }]}
          labelField="label"
          valueField="value"
          value={riskProfile}
          onChange={item => setRiskProfile(item.value)}
          placeholder="Агрессивный"
          style={{ backgroundColor: '#1f1f1f', borderRadius: 8, padding: 10 }}
        />

        <Text className="text-white font-bold mt-6 mb-2">Цели</Text>
        {[
          { title: 'Купить мебель', date: '12 марта 2025', percent: 0.2 },
          { title: 'Купить холодильник', date: '20 марта 2025', percent: 0 }
        ].map((goal, idx) => (
          <View key={idx} className="bg-neutral-900 rounded-md p-4 mb-2">
            <Text className="text-white font-bold mb-1">{goal.title}</Text>
            <Text className="text-white text-sm mb-1">Срок достижения: {goal.date}</Text>
            <ProgressBar progress={goal.percent} color="#4ade80" className="h-2 rounded-full" />
            <Text className="text-white text-right mt-1">{goal.percent * 100}%</Text>
          </View>
        ))}

        <View className="h-20" />
      </ScrollView>


    </SafeAreaView>
  );
};

export default PlanScreen;
