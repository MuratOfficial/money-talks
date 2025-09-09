import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import TestComponent from '../components/TestComponent';

const TestScreen: React.FC = () => {
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
    <View className="flex-1 bg-gray-100 items-center justify-center px-4">
      <Text className="text-gray-800 text-xl font-semibold mb-4 text-center">
        Тест на определение типа инвестора
      </Text>
      <TouchableOpacity
        onPress={() => setShowTest(true)}
        className="bg-blue-600 px-8 py-4 rounded-2xl"
        activeOpacity={0.8}
      >
        <Text className="text-white text-lg font-semibold">
          Начать тест
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default TestScreen;