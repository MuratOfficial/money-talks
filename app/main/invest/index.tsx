import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import InfoModal from '@/app/components/Hint';
import TestComponent from '@/app/components/TestComponent';
import { fetchQuestions, fetchTips, Question, Tip } from '@/services/api';

interface AccordionItem {
  id: string;
  title: string;
  content: string;
}

const InvestmentsPage: React.FC = () => {

    const [showTest, setShowTest] = useState(false);
    useEffect(() => {
      loadQuestions();
    }, []);

      const [questions, setQuestions] = useState<Question[]>([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState<string | null>(null);

      const loadQuestions = async () => {
        try {
          setLoading(true);
          setError(null);
          const data = await fetchQuestions();
          
          if (data.length === 0) {
            setError('Вопросы не найдены. Добавьте вопросы в админ-панели.');
          } else {
            setQuestions(data);
          }
        } catch (err) {
          console.error('Failed to load questions:', err);
          setError('Не удалось загрузить вопросы. Проверьте соединение.');
        } finally {
          setLoading(false);
        }
      };

  const handleTestComplete = (result: any) => {
    console.log('Test completed:', result);
    // Здесь можно сохранить результат или отправить на сервер
  };



  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const router = useRouter();

  const [modalVisible, setModalVisible] = useState(false);

  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);

    const [tips, setTips] = useState<Tip[]>([]);
  
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


  const accordionData: AccordionItem[] = [
    {
      id: '1',
      title: 'Риск-профиль инвестора',
      content: 'Это характеристика, которая показывает, насколько инвестор готов рисковать своими деньгами ради достижения финансовых целей. Он влияет на готовность человека принимать риски, его финансовых целей, опыта в инвестиционной деятельности. Риск-профиль помогает выбрать подходящие инвестиционные инструменты и стратегии.'
    },
    {
      id: '2',
      title: 'Виды риск-профилей',
      content: 'Консервативный - минимальные риски, небольшая доходность. Умеренный - сбалансированное соотношение риска и доходности. Агрессивный - высокие риски ради высокой потенциальной доходности.'
    },
    {
      id: '3',
      title: 'Почему это важно?',
      content: 'Определение риск-профиля помогает подобрать инвестиционную стратегию, которая соответствует вашим целям, временному горизонту и психологической готовности к рискам. Это основа для построения эффективного инвестиционного портфеля.'
    }
  ];

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isExpanded = (itemId: string) => expandedItems.includes(itemId);

    if (showTest) {
    return (
      <TestComponent
        questions={questions}
        testTitle="Тест"
        onClose={() => setShowTest(false)}
        onComplete={handleTestComplete}
      />
    );
  }

  return (
  <View className="flex-1 bg-black">
      {/* Header */}
      <View className="flex-row items-start justify-between px-4 py-3 pb-6">
        <Text className="text-white text-xl font-['SFProDisplaySemiBold']">
          Инвестиции
        </Text>
        <TouchableOpacity className="p-1" onPress={openModal}>
          <MaterialIcons name="info-outline" size={24} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {accordionData.map((item) => (
          <View key={item.id} className="mb-3">
            <TouchableOpacity
              onPress={() => toggleExpanded(item.id)}
              className="bg-[#333333] rounded-xl p-4 flex-row items-center justify-between"
              activeOpacity={0.7}
            >
              <Text className="text-white text-base font-medium flex-1 mr-3 font-['SFProDisplayRegular']">
                {item.title}
              </Text>
              <View className="ml-2">
                <MaterialIcons 
                  name={isExpanded(item.id) ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                  size={24} 
                  color="#9CA3AF" 
                />
              </View>
            </TouchableOpacity>
            
            {isExpanded(item.id) && (
              <View className="bg-[#333333] rounded-b-lg px-4 pb-4 -mt-2">
               
                <Text className="text-gray-300 text-sm leading-6 font-['SFProDisplayRegular']">
                  {item.content}
                </Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Bottom Button */}
      <View className="px-4 pb-8 pt-4">
        <TouchableOpacity 
          className="bg-green-600 rounded-xl py-4 items-center"
          activeOpacity={0.8}
          onPress={() => setShowTest(true)}
        >
          <Text className="text-white text-base font-semibold font-['SFProDisplayRegular']">
            Начать тест
          </Text>
        </TouchableOpacity>
      </View>

      <InfoModal 
        visible={modalVisible} 
        onClose={closeModal}
        title="Подсказки про доходы"
        content={tips[0]?.content}
        linkUrl="https://web.telegram.org/a/#-1002352034763_2"
        linkText="Видеоурок на Telegram"
      />
    </View>
  );
};

export default InvestmentsPage;