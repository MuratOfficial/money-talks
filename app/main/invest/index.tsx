import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import TestComponent, { TestResult } from '@/app/components/TestComponent';
import { fetchQuestions, fetchTips, getCachedQuestions, getCachedTips, Question, Tip } from '@/services/api';
import InfoModal from '@/app/components/HintWithChat';
import useFinancialStore from '@/hooks/useStore';
import LoadingAnimation from '@/app/components/LoadingAnimation';
import FadeInView from '@/app/components/FadeInView';
import { Opacity } from '@/constants/design';
import { FINGUIDE_RISK_TIP, RISK_PROFILES, allocationText, riskProfileByPercentage } from '@/constants/riskProfiles';

interface AccordionItem {
  id: string;
  title: string;
  content: string;
}

/** Подразделы «Инвестиций»: шаблоны портфелей, симулятор, словарь, брокеры. */
const INVEST_SECTIONS: {
  title: string;
  subtitle: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  route: string;
}[] = [
  {
    title: 'Первые инвестиции',
    subtitle: 'Готовые шаблоны портфелей',
    icon: 'pie-chart',
    route: '/main/invest/portfolios',
  },
  {
    title: 'Симулятор',
    subtitle: 'Что даст сумма в месяц',
    icon: 'show-chart',
    route: '/main/invest/simulator',
  },
  {
    title: 'Словарь инвестора',
    subtitle: 'Термины простыми словами',
    icon: 'menu-book',
    route: '/main/invest/glossary',
  },
  {
    title: 'Выбор брокера',
    subtitle: 'На что смотреть и где проверить',
    icon: 'verified-user',
    route: '/main/invest/brokers',
  },
];

const InvestmentsPage: React.FC = () => {
  const { theme, riskProfile, setRiskProfile } = useFinancialStore();

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-black' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondaryColor = isDark ? 'text-gray-300' : 'text-gray-700';
  const cardBgColor = isDark ? 'bg-[#333333]' : 'bg-gray-100';
  const iconColor = isDark ? '#9CA3AF' : '#6B7280';

    const [showTest, setShowTest] = useState(false);

      // Если данные уже в кэше — показываем их сразу, без экрана загрузки.
      const cachedQuestions = getCachedQuestions();
      const [questions, setQuestions] = useState<Question[]>(cachedQuestions || []);
      // Полноэкранный лоадер показываем только при ПЕРВОЙ загрузке (кэш пуст).
      const [loading, setLoading] = useState(cachedQuestions === null);
      const [error, setError] = useState<string | null>(null);

      useEffect(() => {
        loadQuestions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);

      const loadQuestions = async () => {
        try {
          setError(null);
          const data = await fetchQuestions();

          if (data.length === 0) {
            setError('Вопросы не найдены. Добавьте вопросы в админ-панели.');
          } else {
            setQuestions(data);
          }
        } catch (err) {
          console.error('Failed to load questions:', err);
          // Ошибку показываем только если показать нечего (кэш пуст).
          if (questions.length === 0) {
            setError('Не удалось загрузить вопросы. Проверьте соединение.');
          }
        } finally {
          setLoading(false);
        }
      };

  // Профиль кладём в стор: он персистится локально и уезжает на сервер
  // ближайшей синхронизацией (см. useSync — riskProfile в списке зависимостей).
  const handleTestComplete = (result: TestResult) => {
    setRiskProfile({
      title: result.title,
      percentage: result.percentage,
      score: result.score,
      totalQuestions: result.totalQuestions,
      completedAt: new Date().toISOString(),
    });
  };



  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const router = useRouter();

  const [modalVisible, setModalVisible] = useState(false);

  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);

    const [tips, setTips] = useState<Tip[]>(getCachedTips('invest') || []);

    useEffect(() => {
      loadTips();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadTips = async () => {
      try {
        const data = await fetchTips('invest');
        setTips(data);
      } catch (error) {
        console.error('Failed to load tips:', error);
      }
    };


  // Профиль пересчитываем по проценту: у прошедших тест раньше мог
  // сохраниться «Сбалансированный» из прежней шкалы на четыре профиля.
  const currentProfile = riskProfile ? riskProfileByPercentage(riskProfile.percentage) : null;

  const accordionData: AccordionItem[] = [
    ...(currentProfile
      ? [{
          id: 'my-profile',
          title: `Рекомендации для профиля «${currentProfile.title}»`,
          content: `Распределение портфеля: ${allocationText(currentProfile)}.\n\n${currentProfile.recommendations.map((r) => `• ${r}`).join('\n')}\n\nФинГид: «${FINGUIDE_RISK_TIP}»`,
        }]
      : []),
    {
      id: '1',
      title: 'Риск-профиль инвестора',
      content: 'Это характеристика, которая показывает, насколько инвестор готов рисковать своими деньгами ради достижения финансовых целей. Он влияет на готовность человека принимать риски, его финансовых целей, опыта в инвестиционной деятельности. Риск-профиль помогает выбрать подходящие инвестиционные инструменты и стратегии.'
    },
    {
      id: '2',
      title: 'Виды риск-профилей',
      content: RISK_PROFILES.map((p) => `${p.title} — ${p.description.charAt(0).toLowerCase()}${p.description.slice(1)}.\nПортфель: ${allocationText(p)}.`).join('\n\n')
    },
    {
      id: '3',
      title: 'Почему это важно?',
      content: 'Определение риск-профиля помогает подобрать инвестиционную стратегию, которая соответствует вашим целям, временному горизонту и психологической готовности к рискам. Это основа для построения эффективного инвестиционного портфеля.'
    },
    {
      id: '4',
      title: 'Остерегайтесь мошенников',
      content: 'Примеры финпирамид: обещания "100% прибыли за неделю", выплаты за счёт привлечения новых участников.\n\nПризнаки мошенничества:\n• Отсутствие лицензии\n• "Гарантии дохода"\n• Нет реального продукта или услуги\n• Давление на быстрое принятие решения\n• Требование привлечения новых участников\n\nВсегда проверяйте брокеров и финансовые компании в официальных реестрах!'
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

  const handleOpenBrokerCheck = async () => {
    // Агентство РК по регулированию и развитию финансового рынка (АРРФР):
    // реестр лицензий и предупреждения о нелицензированных компаниях.
    const url = 'https://www.gov.kz/memleket/entities/ardfm';
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.error("Don't know how to open this URL: " + url);
      }
    } catch (error) {
      console.error('Error opening URL:', error);
    }
  };

  // Показываем загрузку при первой загрузке
  if (loading) {
    return (
      <View className={`flex-1 ${bgColor}`}>
        <LoadingAnimation 
          fullScreen 
          message="Загрузка вопросов теста..." 
        />
      </View>
    );
  }

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
  <SafeAreaView edges={['top']} className={`flex-1 ${bgColor}`}>
      {/* Header */}
      <View className="flex-row items-start justify-between px-4 py-3 pb-6">
        <Text className={`${textColor} text-xl font-['SFProDisplaySemiBold']`}>
          Инвестиции
        </Text>
        <TouchableOpacity className="p-1" onPress={openModal}>
          <MaterialIcons name="info-outline" size={24} color={iconColor} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <FadeInView style={{ flex: 1 }}>
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {/* Разделы блока «Первые инвестиции» из ТЗ */}
        <View className="flex-row flex-wrap justify-between mb-3">
          {INVEST_SECTIONS.map((section) => (
            <TouchableOpacity
              key={section.route}
              onPress={() => router.push(section.route as any)}
              activeOpacity={Opacity.press}
              className={`${cardBgColor} rounded-xl p-4 mb-3`}
              style={{ width: '48.5%' }}
            >
              <MaterialIcons name={section.icon} size={22} color="#4CAF50" />
              <Text className={`${textColor} text-sm mt-2 font-['SFProDisplaySemiBold']`}>{section.title}</Text>
              <Text className={`${textSecondaryColor} text-xs mt-1 leading-4 font-['SFProDisplayRegular']`}>
                {section.subtitle}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {accordionData.map((item) => (
          <View key={item.id} className="mb-3">
            <TouchableOpacity
              onPress={() => toggleExpanded(item.id)}
              className={`${cardBgColor} rounded-xl p-4 flex-row items-center justify-between`}
              activeOpacity={Opacity.press}
            >
              <Text className={`${textColor} text-base font-medium flex-1 mr-3 font-['SFProDisplayRegular']`}>
                {item.title}
              </Text>
              <View className="ml-2">
                <MaterialIcons 
                  name={isExpanded(item.id) ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                  size={24} 
                  color={iconColor} 
                />
              </View>
            </TouchableOpacity>
            
            {isExpanded(item.id) && (
              <View className={`${cardBgColor} rounded-b-lg px-4 pb-4 -mt-2`}>
               
                <Text className={`${textSecondaryColor} text-sm leading-6 font-['SFProDisplayRegular']`}>
                  {item.content}
                </Text>
                
                {/* Кнопка для проверки брокеров (только для 4-го элемента) */}
                {item.id === '4' && (
                  <TouchableOpacity
                    onPress={handleOpenBrokerCheck}
                    className="bg-blue-600 rounded-lg py-3 px-4 mt-4 flex-row items-center justify-center"
                    activeOpacity={Opacity.press}
                  >
                    <MaterialIcons name="open-in-new" size={20} color="white" style={{ marginRight: 8 }} />
                    <Text className="text-white text-sm font-semibold font-['SFProDisplayRegular']">
                      Проверить брокера на сайте АРРФР
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        ))}
      </ScrollView>
      </FadeInView>

      {/* Bottom Button */}
      <View className="px-4 pb-8 pt-4">
        {riskProfile && (
          <View className={`${cardBgColor} rounded-xl px-4 py-3 mb-3 flex-row items-center justify-between`}>
            <View className="flex-1 mr-3">
              <Text className={`${textSecondaryColor} text-xs font-['SFProDisplayRegular']`}>
                Ваш тип инвестора
              </Text>
              <Text className={`${textColor} text-base font-['SFProDisplaySemiBold']`}>
                {currentProfile?.title}
              </Text>
              <Text className={`${textSecondaryColor} text-xs font-['SFProDisplayRegular']`}>
                Защита {currentProfile?.protectiveShare}% · Рост {100 - (currentProfile?.protectiveShare ?? 0)}%
              </Text>
            </View>
            <Text className="text-[#4CAF50] text-lg font-['SFProDisplaySemiBold']">
              {riskProfile.percentage}%
            </Text>
          </View>
        )}

        <TouchableOpacity
          className="bg-[#4CAF50] rounded-xl py-4 items-center"
          activeOpacity={Opacity.press}
          onPress={() => setShowTest(true)}
        >
          <Text className="text-white text-base font-semibold font-['SFProDisplayRegular']">
            {riskProfile ? 'Пройти тест заново' : 'Начать тест'}
          </Text>
        </TouchableOpacity>
      </View>

      <InfoModal
        visible={modalVisible}
        onClose={closeModal}
        title={tips[0]?.title || "Подсказки про инвестиции"}
        content={tips[0]?.content}
        videoUrl={tips[0]?.videoUrl}
        videoTitle={tips[0]?.videoTitle}
        enableChatGPT={true}
      />
    </SafeAreaView>
  );
};

export default InvestmentsPage;