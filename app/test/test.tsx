import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import TestComponent from '../components/TestComponent';
import { fetchQuestions, Question, saveTestResult } from '@/services/api';

const TestScreen: React.FC = () => {
  const [showTest, setShowTest] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadQuestions();
  }, []);

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

  const handleTestComplete = async (result: any) => {
    console.log('Test completed:', result);
    
    try {
      // Сохраняем результат на сервер
      await saveTestResult({
        score: result.score,
        totalQuestions: result.totalQuestions,
        percentage: (result.score / result.totalQuestions) * 100,
        answers: result.answers,
      });
      
      Alert.alert(
        'Тест завершен!',
        `Ваш результат: ${result.score} из ${result.totalQuestions}`,
        [{ text: 'OK', onPress: () => setShowTest(false) }]
      );
    } catch (err) {
      console.error('Failed to save result:', err);
      Alert.alert(
        'Внимание',
        'Результат не сохранен, но вы можете продолжить использование приложения',
        [{ text: 'OK', onPress: () => setShowTest(false) }]
      );
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-100 items-center justify-center">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="text-gray-600 mt-4">Загрузка вопросов...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-gray-100 items-center justify-center px-4">
        <Text className="text-red-600 text-lg font-semibold mb-4 text-center">
          {error}
        </Text>
        <TouchableOpacity
          onPress={loadQuestions}
          className="bg-blue-600 px-8 py-4 rounded-2xl"
          activeOpacity={0.8}
        >
          <Text className="text-white text-lg font-semibold">
            Попробовать снова
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (showTest) {
    return (
      <TestComponent
        questions={questions}
        testTitle="Тест на определение типа инвестора"
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
      <Text className="text-gray-600 text-sm mb-6 text-center">
        Вопросов: {questions.length}
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