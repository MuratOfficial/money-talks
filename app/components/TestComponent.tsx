import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Question } from '@/services/api';



interface RiskProfile {
  title: string;
  description: string;
  recommendations: string[];
}

export interface TestResult extends RiskProfile {
  score: number;
  totalQuestions: number;
  percentage: number;
}

/**
 * Варианты ответа в вопросах упорядочены от самого осторожного к самому
 * рискованному, и `correctAnswer` указывает на самый рискованный. Поэтому
 * доля таких ответов и есть мера готовности пользователя к риску — чем она
 * выше, тем агрессивнее профиль.
 */
const getRiskProfile = (percentage: number): RiskProfile => {
  if (percentage >= 75) {
    return {
      title: 'Агрессивный',
      description: 'Вы готовы к высокой волатильности ради высокой доходности',
      recommendations: [
        'Держите долю рисковых активов высокой, но фиксируйте правила выхода заранее',
        'Не вкладывайте в один инструмент больше, чем готовы потерять целиком',
        'Обязательно держите подушку безопасности отдельно от инвестиций',
        'Пересматривайте портфель регулярно — агрессивная стратегия требует внимания',
      ],
    };
  }

  if (percentage >= 50) {
    return {
      title: 'Сбалансированный',
      description: 'Вы принимаете умеренный риск ради роста капитала',
      recommendations: [
        'Разделите портфель между защитными и растущими активами',
        'Диверсифицируйте по классам активов и валютам',
        'Реинвестируйте доход — на длинном горизонте это даёт основной эффект',
        'Раз в полгода проверяйте, не сместились ли доли от плановых',
      ],
    };
  }

  if (percentage >= 25) {
    return {
      title: 'Умеренный',
      description: 'Вы предпочитаете предсказуемый результат заметному риску',
      recommendations: [
        'Основу портфеля держите в надёжных инструментах',
        'Рисковую часть вводите небольшими долями и постепенно',
        'Ставьте цели с конкретным сроком — так проще подобрать инструменты',
        'Избегайте решений на эмоциях после просадок рынка',
      ],
    };
  }

  return {
    title: 'Консервативный',
    description: 'Для вас сохранность капитала важнее доходности',
    recommendations: [
      'Выстраивайте защитные стратегии и планируйте вдолгую',
      'Отдавайте приоритет инструментам с предсказуемой доходностью',
      'Сформируйте подушку безопасности на 6 месяцев расходов',
      'Защищайте капитал от инфляции — она главный риск для этого профиля',
    ],
  };
};

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
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(
    questions?.length ? new Array(questions.length).fill(-1) : []
  );
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);

  // Проверка на наличие вопросов
  if (!questions || questions.length === 0) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-black">
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

        {/* Error Message */}
        <View className="flex-1 items-center justify-center px-8">
          <View className="items-center">
            <View className="w-20 h-20 bg-gray-800 rounded-full items-center justify-center mb-6">
              <Ionicons name="cloud-offline-outline" size={40} color="#9CA3AF" />
            </View>
            <Text className="text-white text-2xl font-semibold mb-3 text-center font-['SFProDisplaySemiBold']">
              Нет данных
            </Text>
            <Text className="text-gray-400 text-base text-center mb-8 font-['SFProDisplayRegular']">
              Не удалось загрузить вопросы с сервера. Пожалуйста, проверьте подключение к интернету и попробуйте снова.
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="bg-[#4CAF50] px-8 py-4 rounded-2xl"
              activeOpacity={0.8}
            >
              <Text className="text-white text-base font-semibold font-['SFProDisplaySemiBold']">
                Вернуться назад
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

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

    const testResult: TestResult = {
      score,
      totalQuestions: questions.length,
      percentage,
      ...getRiskProfile(percentage),
    };

    setResult(testResult);
    setShowResult(true);
    onComplete?.(testResult);
  };

  if (showResult && result) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-black">
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
              <Text className="text-gray-400 mb-2 font-['SFProDisplayRegular']">Ваш тип инвестора</Text>
              <Text className="text-white text-4xl font-bold mb-2 font-['SFProDisplaySemiBold']">
                {result.title}
              </Text>
              <Text className="text-gray-300 font-['SFProDisplayRegular']">
                {result.description}
              </Text>
            </View>

            <View className="bg-gray-800 rounded-2xl p-6 mb-6">
              <Text className="text-gray-300 text-sm leading-6 font-['SFProDisplayRegular']">
                Готовность к риску: {result.percentage}%. Вы выбрали {result.score} из{' '}
                {result.totalQuestions} наиболее рискованных вариантов ответа. Это ориентир, а не
                финансовая рекомендация — при выборе инструментов учитывайте ещё и срок цели, и
                размер подушки безопасности.
              </Text>
            </View>

            <View className="space-y-4">
              {result.recommendations.map((text, index) => (
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
    <SafeAreaView edges={['top']} className="flex-1 bg-black">
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
                      ? 'bg-[#4CAF50] border-[#4CAF50]'
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
              ? 'bg-[#4CAF50]'
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