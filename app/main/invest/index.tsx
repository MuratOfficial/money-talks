import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PageHeader from '@/app/components/PageHeader';
import Accordion from '@/app/components/Accordeon';
import { Link, useRouter } from 'expo-router';

const PlanScreen = () => {


  const accordionData = [
    {
      title: 'Риск-профиль инвестора',
      description: 'Это характеристика, которая показывает, насколько инвестор готов рисковать своими деньгами ради достижения финансовых целей. Он зависит от готовности человека принимать риски, его финансовых целей, опыта и эмоциональной устойчивости.'
    },
    {
      title: '5 видов риск-профилей',
      description: 'Консервативный, умеренно-консервативный, сбалансированный, умеренно-агрессивный и агрессивный. Каждый тип соответствует разной степени риска и потенциальной доходности.'
    },
    {
      title: 'Почему это важно',
      description: 'Правильное определение риск-профиля помогает выбрать инвестиционные инструменты, соответствующие вашей психологической готовности к риску и финансовым целям.'
    }
  ];

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Основной контент с прокруткой */}
      <ScrollView 
        contentContainerStyle={{ 
          padding: 16,
          paddingBottom: 80 // Добавляем отступ для кнопки
        }}
        showsVerticalScrollIndicator={false}
        className="flex-1"
      >
        <PageHeader 
          title="Инвестиции" 
          description="Не знаете, что делать? Нажмите, здесь есть подсказки!" 
        />

        <View className="space-y-4 mb-4">
          {accordionData.map((item, index) => (
            <Accordion 
              key={index}
              title={item.title}
              description={item.description}
            />
          ))}
        </View>
      </ScrollView>

      {/* Кнопка, закрепленная внизу */}
      <View className="absolute bottom-0 left-0 right-0 px-4 pb-4 bg-black">
        <TouchableOpacity
          activeOpacity={0.8}
          className="w-full bg-[#4CAF50] py-4 rounded-xl items-center justify-center"
        >
          <Link href={'/test/test'} className="text-white font-['SFProDisplaySemiBold']">
            Начать тест
          </Link>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default PlanScreen;