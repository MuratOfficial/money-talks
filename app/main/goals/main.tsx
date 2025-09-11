import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import useFinancialStore, { Goal } from '@/hooks/useStore';
import InfoModal from '@/app/components/Hint';

const GoalsScreen = () => {
  const router = useRouter();
  const {currentGoalType, goals, pickEditGoal} = useFinancialStore();

    const [modalVisible, setModalVisible] = useState(false);

        const markdownContent = `
  ## Доходы 💰
  
  ### Активный доход
  **Активный доход** - деньги которые ты получаешь за свою работу (зарплата, фриланс, бизнес). Без твоего участия доходов нет.
  
  ### Пассивный доход  
  **Пассивный доход** - деньги которые приходят без твоего активного труда (дивиденды, аренда, проценты по вкладам). Чем больше пассивного дохода, тем ближе финансовая свобода.
  
  ### Источники дохода
  **Доход** - это не только зарплата. Есть много способов получать деньги: инвестиции в акции, доходы от недвижимости, партнерские программы:
  
  #### 1. Регулярные доходы:
  - Зарплата, пенсия, аренда или плата
  - *Стоит стремиться увеличить источники регулярных доходов*
  
  #### 2. Нерегулярные доходы:
  - Подарки, подработка  
  - *Подсказка: рассматривать возможность сделать нерегулярные доходы в регулярные для увеличения доходности*
  
  ---
  
  > 💡 **Совет**: Диверсифицируйте источники дохода для финансовой стабильности
  `;
    
      const openModal = () => setModalVisible(true);
      const closeModal = () => setModalVisible(false);

      const handleEdit = (id:string) =>{
        pickEditGoal(id);
        router.push("/main/goals/add-goal")
      }

  const [selectedTerm, setSelectedTerm] = useState(currentGoalType || 'Краткосрочные');
  const [selectedStatus, setSelectedStatus] = useState('Активные');
   const [showSortModal, setShowSortModal] = useState(false);
   const [selectedSort, setSelectedSort] = useState('По %');


  const termOptions = ['Краткосрочные', 'Среднесрочные', 'Долгосрочные'];
  const statusOptions = ['Завершенные', 'Активные'];



  // Функция фильтрации по срочности
const filterGoalsByTerm = (goals: Goal[], term: string) => {
  return goals.filter(goal => {
    switch (term) {
      case 'Краткосрочные':
        return goal.type === 'short';
      case 'Среднесрочные':
        return goal.type === 'medium';
      case 'Долгосрочные':
        return goal.type === 'long';
      default:
        return true;
    }
  });
};

// Функция фильтрации по статусу (активные/завершенные)
const filterGoalsByStatus = (goals: Goal[], status: string) => {
  return goals.filter(goal => {
    if (status === 'Активные') {
      return Number(goal.progress) < 100;
    } else if (status === 'Завершенные') {
      return Number(goal.progress) >= 100;
    }
    return true;
  });
};

// Функция сортировки
const sortGoals = (goals: Goal[], sortType: string) => {
  const sortedGoals = [...goals];
  
  switch (sortType) {
    case 'По %':
      return sortedGoals.sort((a, b) => b.progress! - a.progress!);
    case 'По дате':
      return sortedGoals.sort((a, b) => {
        const dateA = new Date(Number(a.timeframe.year), Number(a.timeframe.day));
        const dateB = new Date(Number(b.timeframe.year), Number(b.timeframe.day));
        return dateA.getTime() - dateB.getTime();
      });
    default:
      return sortedGoals;
  }
};

// Использование в компоненте с useEffect
const [filteredGoals, setFilteredGoals] = useState<Goal[]>([]);

useEffect(() => {
  let result = goals;
  
  // Применяем фильтры последовательно
  result = filterGoalsByTerm(result, selectedTerm);
  result = filterGoalsByStatus(result, selectedStatus);
  result = sortGoals(result, selectedSort);
  
  setFilteredGoals(result);
}, [goals, selectedTerm, selectedStatus, selectedSort]);


  const TermButton = ({ term, isSelected, onPress }:any) => (
    <TouchableOpacity
      onPress={onPress}
      className={`px-4 py-2 rounded-full mr-3 ${
        isSelected 
          ? 'bg-[#4CAF50]' 
          : 'bg-transparent border border-gray-600'
      }`}
      activeOpacity={0.8}
    >
      <Text className={`text-sm font-['SFProDisplayRegular'] ${
        isSelected ? 'text-white' : 'text-gray-400'
      }`}>
        {term}
      </Text>
    </TouchableOpacity>
  );

  const StatusButton = ({ status, isSelected, onPress }:any) => (
    <TouchableOpacity
      onPress={onPress}
      className={`px-4 py-2 rounded-full mr-3 ${
        isSelected 
          ? 'bg-gray-700' 
          : 'bg-transparent border border-gray-600'
      }`}
      activeOpacity={0.8}
    >
      <Text className={`text-sm font-['SFProDisplayRegular'] ${
        isSelected ? 'text-white' : 'text-gray-400'
      }`}>
        {status}
      </Text>
    </TouchableOpacity>
  );

  const CircularProgress = ({ progress }:any) => {
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
            stroke="#4CAF50"
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
          <Text className="text-white text-sm font-['SFProDisplayBold']">
            {progress}%
          </Text>
        </View>
      </View>
    );
  };

   const SortModal = () => (
    <Modal
      visible={showSortModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowSortModal(false)}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-4">
        <View className="bg-gray-800 rounded-2xl w-full max-w-sm p-6">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-white text-lg font-['SFProDisplaySemiBold']">
              Сортировка
            </Text>
            <TouchableOpacity 
              onPress={() => setShowSortModal(false)}
              className="p-1"
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Sort Options */}
          <View className="mb-6">
            <TouchableOpacity
              onPress={() => setSelectedSort('По дате')}
              className="bg-gray-700 rounded-xl px-4 py-4 mb-3 flex-row items-center justify-between"
              activeOpacity={0.7}
            >
              <Text className="text-white text-base font-['SFProDisplayRegular']">
                По дате
              </Text>
              
              <View className="w-6 h-6 rounded-full border-2 border-gray-500 items-center justify-center">
                {selectedSort === 'По дате' && (
                  <View className="w-3 h-3 rounded-full bg-white" />
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSelectedSort('По %')}
              className="bg-gray-700 rounded-xl px-4 py-4 mb-3 flex-row items-center justify-between"
              activeOpacity={0.7}
            >
              <Text className="text-white text-base font-['SFProDisplayRegular']">
                По %
              </Text>
              
              <View className="w-6 h-6 rounded-full border-2 border-gray-500 items-center justify-center">
                {selectedSort === 'По %' && (
                  <View className="w-3 h-3 rounded-full bg-[#4CAF50]" />
                )}
              </View>
            </TouchableOpacity>
          </View>

          {/* Select Button */}
          <TouchableOpacity
            onPress={() => {
              setShowSortModal(false);
              console.log('Selected sort:', selectedSort);
            }}
            activeOpacity={0.8}
            className="w-full bg-[#4CAF50] py-4 rounded-xl items-center justify-center"
          >
            <Text className="text-white text-base font-['SFProDisplaySemiBold']">
              Выбрать
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const GoalCard = ( goal:Goal ) => (
    <View className="bg-gray-800 rounded-2xl p-4 mb-4">
      <View className="flex-row items-start justify-between mb-4">
        <View className="flex-1">
          <Text className="text-white text-lg font-['SFProDisplaySemiBold'] mb-2">
            {goal.name}
          </Text>
          
            {goal.timeframe ? 
            <Text className="text-gray-400 text-sm font-['SFProDisplayRegular'] mb-1">
              Срок достижения цели {goal.timeframe.day} {goal.timeframe.month} {goal.timeframe.year}
            </Text>:<Text className="text-gray-400 text-sm font-['SFProDisplayRegular'] mb-1">
              Выберите срок
              </Text>}
            
          
          <Text className="text-gray-400 text-sm font-['SFProDisplayRegular']">
            Собрано {goal.collected} из {goal.amount}
          </Text>
        </View>
        
        <CircularProgress progress={goal.progress} />
      </View>
      
      <View className="flex-row space-x-3">
        <TouchableOpacity className="flex-1 bg-gray-700 rounded-xl py-3 items-center justify-center flex-row">
          <Text className="text-white text-sm font-['SFProDisplayRegular'] mr-2">
            Пополнить
          </Text>
          <Ionicons name="add-circle-outline" size={16} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={()=>handleEdit(goal.id)} className="flex-1 bg-gray-700 rounded-xl py-3 items-center justify-center flex-row">
          <Text className="text-white text-sm font-['SFProDisplayRegular'] mr-2">
            Редактировать
          </Text>
          <Ionicons name="pencil" size={16} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <TouchableOpacity 
          onPress={() => router.replace('/main')}
          className="p-2"
        >
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        
        <Text className="text-white text-lg font-['SFProDisplaySemiBold']">
          Цели
        </Text>
        
        <TouchableOpacity className="p-2" onPress={openModal}>
          <Ionicons name="information-circle-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
      >
        {/* Term Filter */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="mb-4"
        >
          {termOptions.map((term) => (
            <TermButton
              key={term}
              term={term}
              isSelected={selectedTerm === term}
              onPress={() => setSelectedTerm(term)}
            />
          ))}
        </ScrollView>

        {/* Status Filter */}
        <View className="flex-row mb-6">
          {statusOptions.map((status) => (
            <StatusButton
              key={status}
              status={status}
              isSelected={selectedStatus === status}
              onPress={() => setSelectedStatus(status)}
            />
          ))}
          
          <TouchableOpacity 
            className="px-4 py-2 rounded-full border border-gray-600 flex-row items-center ml-auto"
            onPress={() => setShowSortModal(true)}
          >
            <Text className="text-gray-400 text-sm font-['SFProDisplayRegular'] mr-2">
              Сортировка
            </Text>
            <Ionicons name="swap-vertical" size={16} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Goals List */}
        {filteredGoals.map((goal) => (
          <GoalCard key={goal.id} {...goal} />
        ))}


      </ScrollView>

      {/* Add Goal Button */}
      <TouchableOpacity 
        className="absolute bottom-6 right-6 w-14 h-14 bg-[#4CAF50] rounded-full items-center justify-center shadow-lg"
        activeOpacity={0.8}
        onPress={() => {
          router.replace("/main/goals/add-goal")
        }}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>

      {/* Sort Modal */}
      <SortModal />

      <InfoModal 
        visible={modalVisible} 
        onClose={closeModal}
        title="Подсказки про доходы"
        content={markdownContent}
        linkUrl="https://web.telegram.org/a/#-1002352034763_2"
        linkText="Видеоурок на Telegram"
      />
    </SafeAreaView>
  );
};

export default GoalsScreen;