import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import InfoModal from '@/app/components/Hint';
import TestComponent from '@/app/components/TestComponent';

interface AccordionItem {
  id: string;
  title: string;
  content: string;
}

const InvestmentsPage: React.FC = () => {

    const [showTest, setShowTest] = useState(false);

  const sampleQuestions = [
    {
      id: 1,
      question: "Каков ваш текущий возраст (годы)?",
      options: ["А: 18-29", "В: 30-39", "С: 40-49", "D: 50-59", "E: 60 и старше"],
      correctAnswer: 0
    },
    {
      id: 2,
      question: "Какой у вас опыт инвестирования?",
      options: ["Новичок", "1-3 года", "3-5 лет", "5-10 лет", "Более 10 лет"],
      correctAnswer: 2
    },
    {
      id: 3,
      question: "Какую сумму вы готовы инвестировать?",
      options: ["До 100 000₽", "100 000 - 500 000₽", "500 000 - 1 000 000₽", "Более 1 000 000₽"],
      correctAnswer: 1
    },
    {
      id: 4,
      question: "Как долго вы планируете инвестировать?",
      options: ["До 1 года", "1-3 года", "3-5 лет", "5-10 лет", "Более 10 лет"],
      correctAnswer: 3
    },
    {
      id: 5,
      question: "Как вы отреагируете на падение портфеля на 20%?",
      options: [
        "Немедленно продам все активы",
        "Буду беспокоиться, но не продам",
        "Подожду восстановления",
        "Докуплю еще активов",
        "Это нормальная ситуация"
      ],
      correctAnswer: 2
    }
  ];

  const handleTestComplete = (result: any) => {
    console.log('Test completed:', result);
    // Здесь можно сохранить результат или отправить на сервер
  };



  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const router = useRouter();

  const [modalVisible, setModalVisible] = useState(false);

  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);

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
        questions={sampleQuestions}
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
        content={markdownContent}
        linkUrl="https://web.telegram.org/a/#-1002352034763_2"
        linkText="Видеоурок на Telegram"
      />
    </View>
  );
};

export default InvestmentsPage;