import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import useFinancialStore, { Goal } from '@/hooks/useStore';
import TopUpModal from '@/app/components/TopUpModal';
import CircularProgress from '../lfp/components/CircularProgress';
import { fetchTips, Tip } from '@/services/api';
import InfoModal from '@/app/components/HintWithChat';

const GoalsScreen = () => {
  const router = useRouter();
  const {currentGoalType, goals, pickEditGoal, currentGoalChangeId, currency, theme} = useFinancialStore();
  
  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-black' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondaryColor = isDark ? 'text-gray-400' : 'text-gray-600';
  const cardBgColor = isDark ? 'bg-gray-800' : 'bg-gray-100';
  const buttonBgColor = isDark ? 'bg-gray-700' : 'bg-gray-200';
  const iconColor = isDark ? 'white' : '#11181C';
  const borderColor = isDark ? 'border-gray-600' : 'border-gray-300';
  const modalBgColor = isDark ? 'bg-gray-800' : 'bg-white';
  const modalOverlayColor = isDark ? 'bg-black/50' : 'bg-black/30';

  const [goalTitle, setTitle] = useState("");

    const [modalVisible, setModalVisible] = useState(false);


      const [tips, setTips] = useState<Tip[]>([]);
      const [loading, setLoading] = useState(true);
    
      useEffect(() => {
        loadTips();
      }, []);
    
      const loadTips = async () => {
        try {
          const data = await fetchTips('incomes'); 
          setTips(data);
        } catch (error) {
          console.error('Failed to load tips:', error);
        } finally {
          setLoading(false);
        }
      };
    
      const openModal = () => setModalVisible(true);
      const closeModal = () => setModalVisible(false);

      const handleEdit = (id:string) =>{
        pickEditGoal(id);
        router.push("/main/goals/add-goal")
      }

      const handleTopUp = (id:string, title: string) => {
        pickEditGoal(id);
        setTitle(title);
        setShowTopUpModal(true);
      }



  const [selectedTerm, setSelectedTerm] = useState(currentGoalType || 'Краткосрочные');
  const [selectedStatus, setSelectedStatus] = useState('Активные');
   const [showSortModal, setShowSortModal] = useState(false);
   const [selectedSort, setSelectedSort] = useState('По %');

   const [showTopUpModal, setShowTopUpModal] = useState(false);


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
          : `bg-transparent border ${borderColor}`
      }`}
      activeOpacity={0.8}
    >
      <Text className={`text-sm font-['SFProDisplayRegular'] ${
        isSelected ? 'text-white' : textSecondaryColor
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
          ? buttonBgColor
          : `bg-transparent border ${borderColor}`
      }`}
      activeOpacity={0.8}
    >
      <Text className={`text-sm font-['SFProDisplayRegular'] ${
        isSelected ? textColor : textSecondaryColor
      }`}>
        {status}
      </Text>
    </TouchableOpacity>
  );



   const SortModal = () => (
    <Modal
      visible={showSortModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowSortModal(false)}
    >
      <View className={`flex-1 ${modalOverlayColor} justify-center items-center px-4`}>
        <View className={`${modalBgColor} rounded-2xl w-full max-w-sm p-6`}>
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <Text className={`${textColor} text-lg font-['SFProDisplaySemiBold']`}>
              Сортировка
            </Text>
            <TouchableOpacity 
              onPress={() => setShowSortModal(false)}
              className="p-1"
            >
              <Ionicons name="close" size={24} color={iconColor} />
            </TouchableOpacity>
          </View>

          {/* Sort Options */}
          <View className="mb-6">
            <TouchableOpacity
              onPress={() => setSelectedSort('По дате')}
              className={`${buttonBgColor} rounded-xl px-4 py-4 mb-3 flex-row items-center justify-between`}
              activeOpacity={0.7}
            >
              <Text className={`${textColor} text-base font-['SFProDisplayRegular']`}>
                По дате
              </Text>
              
              <View className={`w-6 h-6 rounded-full border-2 ${borderColor} items-center justify-center`}>
                {selectedSort === 'По дате' && (
                  <View className={`w-3 h-3 rounded-full ${isDark ? 'bg-white' : 'bg-gray-900'}`} />
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSelectedSort('По %')}
              className={`${buttonBgColor} rounded-xl px-4 py-4 mb-3 flex-row items-center justify-between`}
              activeOpacity={0.7}
            >
              <Text className={`${textColor} text-base font-['SFProDisplayRegular']`}>
                По %
              </Text>
              
              <View className={`w-6 h-6 rounded-full border-2 ${borderColor} items-center justify-center`}>
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
    <View className={`${cardBgColor} rounded-2xl p-4 mb-4`}>
      <View className="flex-row items-start justify-between mb-4">
        <View className="flex-1">
          <Text className={`${textColor} text-lg font-['SFProDisplaySemiBold'] mb-2`}>
            {goal.name}
          </Text>
          
            {goal.timeframe ? 
            <Text className={`${textSecondaryColor} text-sm font-['SFProDisplayRegular'] mb-1`}>
              Срок достижения цели {goal.timeframe.day} {goal.timeframe.month} {goal.timeframe.year}
            </Text>:<Text className={`${textSecondaryColor} text-sm font-['SFProDisplayRegular'] mb-1`}>
              Выберите срок
              </Text>}
            
          
          <Text className={`${textSecondaryColor} text-sm font-['SFProDisplayRegular']`}>
            Собрано {goal.collected ?? 0} из {goal.amount}
          </Text>
        </View>
        
        <CircularProgress progress={goal.progress ?? 0} />
      </View>
      
      <View className="flex-row space-x-3">
        <TouchableOpacity onPress={()=>handleTopUp(goal.id, goal.name)} className={`flex-1 ${buttonBgColor} rounded-xl py-3 items-center justify-center flex-row`}>
          <Text className={`${textColor} text-sm font-['SFProDisplayRegular'] mr-2`}>
            Пополнить
          </Text>
          <Ionicons name="add-circle-outline" size={16} color={iconColor} />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={()=>handleEdit(goal.id)} className={`flex-1 ${buttonBgColor} rounded-xl py-3 items-center justify-center flex-row`}>
          <Text className={`${textColor} text-sm font-['SFProDisplayRegular'] mr-2`}>
            Редактировать
          </Text>
          <Ionicons name="pencil" size={16} color={iconColor} />
        </TouchableOpacity>
      </View>
      
        <TopUpModal
          visible={showTopUpModal}
          onClose={() => setShowTopUpModal(false)}
         
          goalId={currentGoalChangeId}
          title={goalTitle}
          currency={currency}
        />

    </View>
  );

return (
    <SafeAreaView className={`flex-1 ${bgColor}`}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <TouchableOpacity 
          onPress={() => router.replace('/main')}
          className="p-2"
        >
          <Ionicons name="chevron-back" size={24} color={iconColor} />
        </TouchableOpacity>
        
        <Text className={`${textColor} text-lg font-['SFProDisplaySemiBold']`}>
          Цели
        </Text>
        
        <TouchableOpacity className="p-2" onPress={openModal}>
          <Ionicons name="information-circle-outline" size={24} color={iconColor} />
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
            className={`px-4 py-2 rounded-full border ${borderColor} flex-row items-center ml-auto`}
            onPress={() => setShowSortModal(true)}
          >
            <Text className={`${textSecondaryColor} text-sm font-['SFProDisplayRegular'] mr-2`}>
              Сортировка
            </Text>
            <Ionicons name="swap-vertical" size={16} color={isDark ? "#666" : "#9CA3AF"} />
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
        content={tips[0]?.content}
        linkUrl="https://web.telegram.org/a/#-1002352034763_2"
        linkText="Видеоурок на Telegram"
        enableChatGPT={true}
      />

      
    </SafeAreaView>
  );
};

export default GoalsScreen;