import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Question } from '@/services/api';



interface TestResult {
  score: number;
  totalQuestions: number;
  title: string;
  description: string;
  recommendations: string[];
}

interface TestComponentProps {
  questions: Question[];
  testTitle: string;
  onClose: () => void;
  onComplete?: (result: TestResult) => void;
}

const TestComponent: React.FC<TestComponentProps> = ({ 
  questions, 
  testTitle, 
  onClose, 
  onComplete 
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(new Array(questions.length).fill(-1));
  const [showResult, setShowResult] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const canProceed = selectedAnswers[currentQuestionIndex] !== -1;

  const handleAnswerSelect = (optionIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      showTestResult();
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const showTestResult = () => {
    const score = selectedAnswers.reduce((total, answer, index) => {
      return total + (answer === questions[index].correctAnswer ? 1 : 0);
    }, 0);

    const percentage = Math.round((score / questions.length) * 100);
    
    let title = "";
    let description = "";
    let recommendations: string[] = [];

    // Определяем результат на основе процента правильных ответов
    if (percentage >= 90) {
      title = "Отлично!";
      description = "Вы показали превосходные знания";
      recommendations = [
        "Продолжайте в том же духе",
        "Рассмотрите возможность помочь другим",
        "Углубляйте свои знания в специализированных областях"
      ];
    } else if (percentage >= 70) {
      title = "Хорошо!";
      description = "У вас хорошая база знаний";
      recommendations = [
        "Проработайте слабые места",
        "Практикуйтесь регулярно",
        "Изучите дополнительные материалы"
      ];
    } else if (percentage >= 50) {
      title = "Удовлетворительно";
      description = "Есть над чем работать";
      recommendations = [
        "Повторите основные темы",
        "Уделите больше времени изучению",
        "Обратитесь за помощью к специалистам"
      ];
    } else {
      title = "Консервативный";
      description = "Рекомендуем повторить материал";
      recommendations = [
        "Выстраивайте защитные стратегии и планируйте долгосрочное развитие ваших активов",
        "Вы лучше всех сможете выбрать прибыльную стратегию, которая будет соответствовать вашему профилю",
        "Когда вы думаете о торговле риск, вы думаете, что риск \"Осторожность\"",
        "Когда вы приумножаете финансовые ресурсы, вы обязаны соответствовать по возможности которых",
        "Вы более уверенны в активах и не хотите брать на себя высокий уровень риска"
      ];
    }

    const result: TestResult = {
      score,
      totalQuestions: questions.length,
      title,
      description,
      recommendations
    };

    setShowResult(true);
    onComplete?.(result);
  };

  if (showResult) {
    const score = selectedAnswers.reduce((total, answer, index) => {
      return total + (answer === questions[index].correctAnswer ? 1 : 0);
    }, 0);

    const percentage = Math.round((score / questions.length) * 100);

    return (
      <SafeAreaView className="flex-1 bg-black">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 pt-4">
          <Text className="text-white text-xl font-semibold font-['SFProDisplayRegular']">
            Результат теста
          </Text>
          <TouchableOpacity 
            onPress={onClose}
            className="w-8 h-8 bg-gray-700 rounded-full items-center justify-center"
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={20} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Result Content */}
          <View className="px-6 py-8">
            <View className="items-center mb-8">
              <Text className="text-gray-400 mb-2 font-['SFProDisplayRegular']">Вы набрали</Text>
              <Text className="text-white text-4xl font-bold mb-2 font-['SFProDisplayRegular']">
                {score} баллов
              </Text>
              <Text className="text-gray-300 font-['SFProDisplayRegular']">
                Консервативный
              </Text>
            </View>

            <View className="bg-gray-800 rounded-2xl p-6 mb-6">
              <Text className="text-gray-300 text-sm leading-6 font-['SFProDisplayRegular']">
                Консервативный подход к деятельности, как правило, нацелен на сохранение капитала. Вы 
                инвестируете быстро и не готовы на агрессивные капиталовложения основных активов, чтобы 
                обеспечить более высокий уровень инфляции. Инвестиционная цель: 50% российского фондового рынка.
              </Text>
            </View>

            <View className="space-y-4">
              {[
                "Выстраивайте защитные стратегии и планируйте долгосрочное развитие ваших активов",
                "Вы лучше всех сможете выбрать прибыльную стратегию, которая будет соответствовать вашему профилю",
                "Когда вы думаете о торговле риск, вы думаете, что риск \"Осторожность\"",
                "Когда вы приумножаете финансовые ресурсы, вы обязаны соответствовать по возможности которых",
                "Вы более уверенны в активах и не хотите брать на себя высокий уровень риска",
                "Ставьте консервативные цели и увеличивайте уже достигнутые вами результаты"
              ].map((text, index) => (
                <View key={index} className="flex-row items-start">
                  <View className="w-6 h-6 bg-green-500 rounded-full items-center justify-center mr-3 mt-1">
                    <Ionicons name="checkmark" size={16} color="white" />
                  </View>
                  <Text className="text-gray-300 text-sm flex-1 leading-5 font-['SFProDisplayRegular']">
                    {text}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 pt-4">
        <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-semibold font-['SFProDisplaySemiBold']">
          {testTitle}
        </Text>
        <View className="w-6" />
      </View>

      {/* Progress */}
      <View className="px-4 mb-6">
        <View className="flex-row items-center mb-2">
          <View className="w-4 h-4 bg-blue-500 rounded-full mr-2" />
          <Text className="text-gray-400 text-sm font-['SFProDisplayRegular']">
            Пройдите тест чтобы определить свой тип инвестора
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Question */}
        <View className="px-4 mb-8">
          <Text className="text-white text-lg mb-6 font-['SFProDisplayRegular']">
            {currentQuestionIndex + 1}. {currentQuestion.question}
          </Text>

          <View className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleAnswerSelect(index)}
                className={`p-4 rounded-2xl border ${
                  selectedAnswers[currentQuestionIndex] === index
                    ? 'bg-gray-700 border-gray-500'
                    : 'bg-gray-800 border-gray-700'
                }`}
                activeOpacity={0.8}
              >
                <View className="flex-row items-center justify-between">
                  <Text className="text-white flex-1 mr-4 font-['SFProDisplayRegular']">
                    {option}
                  </Text>
                  <View className={`w-6 h-6 rounded-full border-2 ${
                    selectedAnswers[currentQuestionIndex] === index
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-500'
                  }`}>
                    {selectedAnswers[currentQuestionIndex] === index && (
                      <View className="w-full h-full items-center justify-center">
                        <View className="w-2 h-2 bg-white rounded-full" />
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Next Button */}
      <View className="px-4 pb-8 pt-4">
        <TouchableOpacity
          onPress={handleNext}
          disabled={!canProceed}
          className={`w-full py-4 rounded-2xl items-center ${
            canProceed
              ? 'bg-green-600'
              : 'bg-gray-700'
          }`}
          activeOpacity={canProceed ? 0.8 : 1}
        >
          <Text className={`text-base font-['SFProDisplaySemiBold'] ${
            canProceed ? 'text-white' : 'text-gray-400'
          }`}>
            {isLastQuestion ? 'Завершить' : 'Далее'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default TestComponent;