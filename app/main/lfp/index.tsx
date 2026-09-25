import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Drawer from '@/app/components/Drawer';
import useFinancialStore, { Goal } from '@/hooks/useStore';
import DropdownButton from './components/DropdownButton';
import GoalCard from './components/GoalCard';
import CrisisScenarios from './components/CrisisScenarios';
import PDFLoadingModal from './components/PDFLoadingComponent';
import { useLFPExport } from '@/hooks/useLFPExport';
import FadeInView from '@/app/components/FadeInView';
import InfoModal from '@/app/components/HintWithChat';
import { fetchTips, getCachedTips, Tip } from '@/services/api';
import { InsuranceKind, computeInsurancePlan } from '@/utils/insurance';

const INSURANCE_ROWS: { kind: InsuranceKind; label: string }[] = [
  { kind: 'life', label: 'Уход из жизни' },
  { kind: 'disability', label: 'Инвалидность' },
  { kind: 'medical', label: 'Больничный лист' },
];

const PersonalFinancialPlanScreen = () => {
  const router = useRouter();

  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedSort, setSelectedSort] = useState('1 год');

  // Подсказки раздела: сразу отдаём уже закэшированные, чтобы кнопка работала
  // без ожидания сети, а в фоне обновляем из БД (там же лежит видеоурок).
  const [hintVisible, setHintVisible] = useState(false);
  const [tips, setTips] = useState<Tip[]>(getCachedTips('lfp') || []);

  React.useEffect(() => {
    fetchTips('lfp')
      .then(setTips)
      .catch((error) => console.error('Failed to load tips:', error));
  }, []);

  // Получаем ВСЕ необходимые данные из store
  const {
    user,
    getCategoryBalance,
    goals,
    currency,
    language,
    theme,
    updatePersonalFinancialPlan,
    clearPersonalFinancialPlan,
    resetPersonalFinancialPlan,
    personalFinancialPlan,
    incomes,      // Если есть в store
    actives,      // Если есть в store  
    passives,     // Если есть в store
    expences,     // Если есть в store
    formatAmount  // Для форматирования сумм
  } = useFinancialStore();

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-black' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondaryColor = isDark ? 'text-gray-400' : 'text-gray-600';
  const inputBgColor = isDark ? 'bg-white/10' : 'bg-gray-100';
  const inputTextColor = isDark ? 'text-white' : 'text-gray-900';
  const cardBgColor = isDark ? 'bg-white/10' : 'bg-gray-100';
  const iconColor = isDark ? 'white' : '#11181C';
  const borderColor = isDark ? 'border-white' : 'border-gray-900';

  // Используем хук с ПОЛНЫМИ данными
  const {
    loadingState,
    isDataAvailable,
    exportToPDF,        // Используем эту функцию вместо generatePDF
    printPDF,
    showExportMenu,
    closeModal
  } = useLFPExport({
    personalFinancialPlan,
    currency,
    language,
    goals: goals || [],
    incomes: incomes || [],     // Передаем данные из store
    actives: actives || [],     // Передаем данные из store
    passives: passives || [],   // Передаем данные из store
    appCurrency: currency
  });

  const income = incomes ? incomes.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) : 0;
  const expence = expences ? expences.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) : 0;
  const delta = income - expence || 0;

  const totalActives = actives ? actives.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) : 0;
  const totalPassives = passives ? passives.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) : 0;
  const netWorth = totalActives - totalPassives || 0;

  // Подушка безопасности на 3 месяца = постоянные (регулярные) расходы × 3
  const regularExpenses = expences
    ? expences
        .filter((item) => item.regularity === 'regular')
        .reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
    : 0;
  const securityPillowValue = regularExpenses * 3;

  // Рекомендуемые страховые суммы — от тех же доходов и расходов, что показаны выше.
  const insurancePlan = computeInsurancePlan({
    plan: personalFinancialPlan,
    monthlyIncome: income,
    monthlyExpense: expence,
    actives: actives || [],
    passives: passives || [],
  });

  const updateInsurance = (kind: InsuranceKind, value: string) =>
    updatePersonalFinancialPlan({
      insurance: {
        life: personalFinancialPlan?.insurance?.life || '0',
        disability: personalFinancialPlan?.insurance?.disability || '0',
        medical: personalFinancialPlan?.insurance?.medical || '0',
        [kind]: value,
      },
    });
  const securityPillowFormatted = formatAmount(securityPillowValue);

  // Синхронизируем вычисленную подушку в ЛФП, чтобы она попала в PDF
  React.useEffect(() => {
    if (personalFinancialPlan && personalFinancialPlan.securityPillow !== securityPillowFormatted) {
      updatePersonalFinancialPlan({ securityPillow: securityPillowFormatted });
    }
  }, [securityPillowFormatted, personalFinancialPlan]);

  const handleSortSelect = (value: any) => {
    setSelectedSort(value);
    console.log('Selected sort:', value);
  };

  // Risk profile
  const [showRiskProfile, setShowRiskProfile] = useState(false);

  const days: string[] = Array.from({ length: 31 }, (_, i) => i + 1).map(x => x.toString());
  const months: string[] = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const risks = ['Агрессивный', "Умеренно-агрессивный", "Умеренный", "Умеренно-консервативный", "Консервативный"]

  const currentYear: number = new Date().getFullYear();
  const years: string[] = Array.from({ length: 100 }, (_, i) => currentYear - i).map(x => x.toString());

  const [showDrawerDay, setShowDrawerDay] = useState(false);
  const [showDrawerMonth, setShowDrawerMonth] = useState(false);
  const [showDrawerYear, setShowDrawerYear] = useState(false);

  // ============== ФУНКЦИИ ОБНОВЛЕНИЯ ЛФП ДАННЫХ ==============

  const updateFio = (value: string) => {
    updatePersonalFinancialPlan({ fio: value });
  };

  const updateActivity = (value: string) => {
    updatePersonalFinancialPlan({ activity: value });
  };

  const updateFinancialDependents = (value: string) => {
    updatePersonalFinancialPlan({ financialDependents: value });
  };

  const updateRiskProfile = (value: string) => {
    updatePersonalFinancialPlan({ riskProfile: value });
  };

  const updateBirthDate = (day?: string, month?: string, year?: string) => {
    updatePersonalFinancialPlan({
      birthDate: {
        day: day || personalFinancialPlan?.birthDate.day || 'День',
        month: month || personalFinancialPlan?.birthDate.month || 'Месяц',
        year: year || personalFinancialPlan?.birthDate.year || 'Год',
      }
    });
  };

  // ============== ОБРАБОТЧИКИ СОБЫТИЙ ==============

  const handleSortSelectDay = (value: string) => {
    updateBirthDate(value);
    setShowDrawerDay(false);
  };

  const handleSortSelectMonth = (value: string) => {
    updateBirthDate(undefined, value);
    setShowDrawerMonth(false);
  };

  const handleSortSelectYear = (value: string) => {
    updateBirthDate(undefined, undefined, value);
    setShowDrawerYear(false);
  };

  const handleRiskProfile = (value: string) => {
    updateRiskProfile(value);
    setShowRiskProfile(false);
  };

  // ============== ФУНКЦИИ СБРОСА И ОЧИСТКИ ==============

  const handleResetPFP = () => {
    Alert.alert(
      'Сброс данных',
      'Вы уверены, что хотите сбросить все данные ЛФП к значениям по умолчанию?',
      [
        {
          text: 'Отмена',
          style: 'cancel',
        },
        {
          text: 'Сбросить',
          style: 'destructive',
          onPress: () => {
            resetPersonalFinancialPlan();
            Alert.alert('Успешно', 'Данные ЛФП сброшены к значениям по умолчанию');
          },
        },
      ]
    );
  };

  const handleClearPFP = () => {
    Alert.alert(
      'Очистка данных',
      'Вы уверены, что хотите полностью очистить все данные ЛФП?',
      [
        {
          text: 'Отмена',
          style: 'cancel',
        },
        {
          text: 'Очистить',
          style: 'destructive',
          onPress: () => {
            clearPersonalFinancialPlan();
            Alert.alert('Успешно', 'Данные ЛФП полностью очищены');
          },
        },
      ]
    );
  };

  // ============== ОБРАБОТЧИК ГЕНЕРАЦИИ PDF ==============
  const handleGeneratePDF = async () => {
    if (!personalFinancialPlan) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните данные ЛФП');
      return;
    }

    // Используем функцию из хука, которая уже содержит всю логику
    await exportToPDF();
  };

  return (
    <SafeAreaView edges={['top']} className={`flex-1 ${bgColor}`}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <Text className={`${textColor} text-xl font-['SFProDisplaySemiBold'] flex-1 mr-3`}>
          Личный финансовый план
        </Text>
        <TouchableOpacity className="p-1" onPress={() => setHintVisible(true)}>
          <MaterialIcons name="info-outline" size={24} color={iconColor} />
        </TouchableOpacity>
      </View>

      <FadeInView style={{ flex: 1 }}>
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
      >
        {/* ============== ПОЛЕ ФИО ============== */}
        <View className="mb-4">
          <Text className={`${textSecondaryColor} text-sm font-['SFProDisplayRegular'] mb-2`}>
            ФИО
          </Text>
          <TextInput
            value={personalFinancialPlan?.fio || user?.name || ''}
            onChangeText={updateFio}
            className={`${inputBgColor} rounded-xl px-4 py-3 ${inputTextColor} text-base font-['SFProDisplayRegular']`}
            placeholder="Введите ФИО"
            placeholderTextColor={isDark ? "#666" : "#999"}
          />
        </View>

        {/* ============== ДАТА РОЖДЕНИЯ ============== */}
        <View className="mb-4">
          <Text className={`${textSecondaryColor} text-sm font-['SFProDisplayRegular'] mb-2`}>
            Дата рождения
          </Text>
          <View className="flex-row">
            <DropdownButton
              value={personalFinancialPlan?.birthDate.day || 'День'}
              onPress={() => setShowDrawerDay(true)}
            />

            <DropdownButton
              value={personalFinancialPlan?.birthDate.month || 'Месяц'}
              onPress={() => setShowDrawerMonth(true)}
            />

            <DropdownButton
              value={personalFinancialPlan?.birthDate.year || 'Год'}
              onPress={() => setShowDrawerYear(true)}
              isLast
            />
          </View>
          <Text className={`${textSecondaryColor} text-sm mt-2 font-['SFProDisplayRegular']`}>
            Точная дата нужна для расчёта страхового полиса и пенсионного планирования.
          </Text>
        </View>

        {/* ============== ДЕЯТЕЛЬНОСТЬ ============== */}
        <View className="mb-4">
          <Text className={`${textSecondaryColor} text-sm font-['SFProDisplayRegular'] mb-2`}>
            Деятельность
          </Text>
          <TextInput
            value={personalFinancialPlan?.activity || ''}
            onChangeText={updateActivity}
            className={`${inputBgColor} rounded-xl px-4 py-3 ${inputTextColor} text-base font-['SFProDisplayRegular']`}
            placeholder="Введите деятельность"
            placeholderTextColor={isDark ? "#666" : "#999"}
          />
        </View>

        {/* ============== ФИНАНСОВО-ЗАВИСИМЫЕ ЛЮДИ ============== */}
        <View className="mb-4">
          <Text className={`${textSecondaryColor} text-sm font-['SFProDisplayRegular'] mb-2`}>
            Финансово-зависимые люди
          </Text>
          <TextInput
            value={personalFinancialPlan?.financialDependents || ''}
            onChangeText={updateFinancialDependents}
            className={`${inputBgColor} rounded-xl px-4 py-3 ${inputTextColor} text-base font-['SFProDisplayRegular']`}
            placeholder="Введите количество"
            keyboardType="number-pad"
            placeholderTextColor={isDark ? "#666" : "#999"}
          />
          <Text className={`${textSecondaryColor} text-sm mt-2 font-['SFProDisplayRegular']`}>
            Сколько людей финансово зависят от вас — это учитывается в расходах и страховании.
          </Text>
        </View>

        <View className="mb-6">
          <Text className={`${textColor} text-lg font-['SFProDisplaySemiBold'] mb-4`}>
            ЛФП
          </Text>

          <View className="flex-row items-center justify-between ">
            <TouchableOpacity
              onPress={() => setShowDrawer(true)}
              className={`px-3 py-1.5 border ${borderColor} w-fit rounded-2xl flex flex-row items-center justify-center gap-2`}
            >
              <Text className={`${textColor} text-sm font-['SFProDisplayRegular']`}>
                {selectedSort}
              </Text>
              <View className="w-4 h-4 rounded items-center justify-center">
                <Ionicons name="funnel-outline" size={14} color={iconColor} />
              </View>
            </TouchableOpacity>
            <Drawer
              title='Сортировка'
              visible={showDrawer}
              onClose={() => setShowDrawer(false)}
              onSelect={handleSortSelect}
              selectedValue={selectedSort}
              options={['1 год', '5 лет', '10 лет', '20 лет', '25 лет']}
            />

            {/* ИСПРАВЛЕННАЯ КНОПКА */}
            <TouchableOpacity
              disabled={!isDataAvailable || loadingState.isVisible}
              onPress={handleGeneratePDF}  // Используем исправленную функцию
              className={`ml-4 px-3 py-2 gap-2 rounded-lg flex-row items-center ${(!isDataAvailable || loadingState.isVisible) ? 'opacity-50' : ''
                }`}
              activeOpacity={0.8}
            >
              <Text className={`${textColor} text-base font-['SFProDisplayRegular'] mr-2`}>
                {loadingState.isVisible ?
                  (loadingState.status === 'generating' ? 'Создание PDF...' :
                    loadingState.status === 'sharing' ? 'Подготовка...' :
                      loadingState.status === 'success' ? 'Готово!' : 'Скачайте файл')
                  : 'Скачайте файл'}
              </Text>
              <View className="w-4 h-4 rounded items-center justify-center">
                <Image
                  source={require('../../../assets/images/pdf.png')}
                  className="w-6 h-6"
                  resizeMode="contain"
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Financial Details */}
        <View className="mb-6">
          <Text className={`${textSecondaryColor} text-sm font-['SFProDisplayRegular'] mb-3`}>
            Расчет деталей
          </Text>

          <View className={`space-y-3 p-3 rounded-xl ${cardBgColor}`}>
            <View className="flex-row justify-between items-center">
              <Text className={`${textColor} text-base font-['SFProDisplayRegular']`}>Расходы</Text>
              <View className="flex-row items-center">
                <Text className={`${textColor} text-base font-['SFProDisplaySemiBold'] mr-2`}>{formatAmount(expence)}</Text>
                <Ionicons name="create-outline" size={16} color={iconColor} onPress={() => router.push("/main/finance/expences/main")} />
              </View>
            </View>

            <View className="flex-row justify-between items-center">
              <Text className={`${textColor} text-base font-['SFProDisplayRegular']`}>Доходы</Text>
              <View className="flex-row items-center">
                <Text className={`${textColor} text-base font-['SFProDisplaySemiBold'] mr-2`}>{formatAmount(income)}</Text>
                <Ionicons name="create-outline" size={16} color={iconColor} onPress={() => router.push("/main/finance/incomes/main")} />
              </View>
            </View>

            <View className="flex-row justify-between items-center">
              <Text className={`${textColor} text-base font-['SFProDisplayRegular']`}>Дельта</Text>
              <Text className={`${textColor} text-base font-['SFProDisplaySemiBold']`}>{formatAmount(delta)}</Text>
            </View>
          </View>
        </View>

        {/* Net Worth Calculation */}
        <View className="mb-6">
          <Text className={`${textSecondaryColor} text-sm font-['SFProDisplayRegular'] mb-3`}>
            Расчет чистого капитала
          </Text>

          <View className={`space-y-3 p-3 rounded-xl ${cardBgColor}`}>
            <View className="flex-row justify-between items-center">
              <Text className={`${textColor} text-base font-['SFProDisplayRegular']`}>Активы</Text>
              <View className="flex-row items-center">
                <Text className={`${textColor} text-base font-['SFProDisplaySemiBold'] mr-2`}>{formatAmount(totalActives)}</Text>
                <Ionicons onPress={() => router.push("/main/finance/actives/main")} name="create-outline" size={16} color={iconColor} />
              </View>
            </View>

            <View className="flex-row justify-between items-center">
              <Text className={`${textColor} text-base font-['SFProDisplayRegular']`}>Пассивы</Text>
              <View className="flex-row items-center">
                <Text className={`${textColor} text-base font-['SFProDisplaySemiBold'] mr-2`}>{formatAmount(totalPassives)}</Text>
                <Ionicons onPress={() => router.push("/main/finance/passives/main")} name="create-outline" size={16} color={iconColor} />
              </View>
            </View>

            <View className="flex-row justify-between items-center">
              <Text className={`${textColor} text-base font-['SFProDisplayRegular']`}>Чистый капитал</Text>
              <View className="flex-row items-center">
                <Text className={`${textColor} text-base font-['SFProDisplaySemiBold'] mr-2`}>{formatAmount(netWorth)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ============== ПОДУШКА БЕЗОПАСНОСТИ ============== */}
        <View className="mb-6">
          <Text className={`${textSecondaryColor} text-sm font-['SFProDisplayRegular'] mb-3`}>
            Подушка безопасности на 3 месяца
          </Text>
          <View className={`p-3 rounded-xl ${cardBgColor}`}>
            <Text className={`${textColor} text-base font-['SFProDisplaySemiBold']`}>
              {securityPillowFormatted}
            </Text>
          </View>
        </View>

        {/* ============== СТРАХОВАЯ ЗАЩИТА ============== */}
        <View className="mb-6">
          <Text className={`${textSecondaryColor} text-sm font-['SFProDisplayRegular'] mb-1`}>
            Защита жизни, здоровья и капитала
          </Text>
          <Text className={`${textSecondaryColor} text-sm font-['SFProDisplayRegular'] mb-3`}>
            {insurancePlan.yearsLeft === null
              ? 'Укажите дату рождения — рассчитаем срок страхования (до 82 лет)'
              : insurancePlan.yearsLeft > 0
                ? `Страхование доступно до 82 лет: ещё ${insurancePlan.yearsLeft} ${insurancePlan.yearsLeft % 10 === 1 && insurancePlan.yearsLeft % 100 !== 11 ? 'год' : [2, 3, 4].includes(insurancePlan.yearsLeft % 10) && ![12, 13, 14].includes(insurancePlan.yearsLeft % 100) ? 'года' : 'лет'}`
                : 'Страхование доступно до 82 лет включительно'}
          </Text>

          <View className={`p-3 rounded-xl ${cardBgColor}`}>
            {INSURANCE_ROWS.map(({ kind, label }, index) => {
              const rec = insurancePlan.recommendations.find((r) => r.kind === kind)!;
              return (
                <View key={kind} className={index > 0 ? 'mt-4' : ''}>
                  <View className="flex-row justify-between items-center">
                    <Text className={`${textColor} text-base font-['SFProDisplayRegular'] flex-1 mr-3`}>{label}</Text>
                    <TextInput
                      value={personalFinancialPlan?.insurance[kind] ?? '0'}
                      onChangeText={(val) => updateInsurance(kind, val)}
                      keyboardType="number-pad"
                      className={`${inputTextColor} text-base font-['SFProDisplayRegular'] border ${isDark ? 'border-white/20' : 'border-gray-300'} rounded-lg px-3 py-1.5 text-right w-[130px]`}
                      placeholder="0"
                      placeholderTextColor={isDark ? "#666" : "#999"}
                    />
                  </View>
                  {rec.recommended > 0 && (
                    <>
                      <View className={`h-1.5 rounded-full overflow-hidden mt-2 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                        <View
                          className="h-full rounded-full"
                          style={{ width: `${rec.coverage}%`, backgroundColor: rec.coverage >= 100 ? '#4CAF50' : rec.coverage >= 50 ? '#F59E0B' : '#EF4444' }}
                        />
                      </View>
                      <Text className={`${textSecondaryColor} text-sm mt-1 font-['SFProDisplayRegular']`}>
                        Рекомендуется {formatAmount(rec.recommended)} · покрыто {rec.coverage}%
                      </Text>
                    </>
                  )}
                  <Text className={`${textSecondaryColor} text-sm font-['SFProDisplayRegular']`}>{rec.explanation}</Text>
                </View>
              );
            })}
          </View>

          {insurancePlan.hints.length > 0 && (
            <View className={`p-3 rounded-xl mt-3 flex-row ${cardBgColor}`}>
              <Ionicons name="sparkles-outline" size={18} color="#4CAF50" style={{ marginRight: 8, marginTop: 2 }} />
              <View className="flex-1">
                {insurancePlan.hints.map((hint) => (
                  <Text key={hint} className={`${textSecondaryColor} text-sm mb-1 font-['SFProDisplayRegular']`}>
                    {hint}
                  </Text>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* ============== КРИЗИСНЫЕ СЦЕНАРИИ ============== */}
        <CrisisScenarios />

        {/* ============== РИСК-ПРОФИЛЬ ============== */}
        <View className="mb-6">
          <Text className={`${textSecondaryColor} text-sm font-['SFProDisplayRegular'] mb-3`}>
            Риск-профиль
          </Text>
          <DropdownButton
            value={personalFinancialPlan?.riskProfile || 'Агрессивный'}
            onPress={() => setShowRiskProfile(true)}
          />
        </View>

        {/* Goals */}
        <View className="mb-6">
          <Text className={`${textColor} text-base font-['SFProDisplaySemiBold'] mb-4`}>
            Цели
          </Text>

          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </View>

        {/* PDF LOADING MODAL */}
        <PDFLoadingModal
          visible={loadingState.isVisible}
          status={loadingState.status}
          message={loadingState.message}
          progress={loadingState.progress}
          onClose={closeModal}
          allowClose={loadingState.status === 'error' || loadingState.status === 'success'}
        />

        {/* Drawer для выбора дня */}
        <Drawer
          title='День'
          visible={showDrawerDay}
          onClose={() => setShowDrawerDay(false)}
          onSelect={handleSortSelectDay}
          selectedValue={personalFinancialPlan?.birthDate.day || 'День'}
          options={days}        />

        {/* Drawer для выбора месяца */}
        <Drawer
          title='Месяц'
          visible={showDrawerMonth}
          onClose={() => setShowDrawerMonth(false)}
          onSelect={handleSortSelectMonth}
          selectedValue={personalFinancialPlan?.birthDate.month || 'Месяц'}
          options={months}        />

        {/* Drawer для выбора года */}
        <Drawer
          title='Год'
          visible={showDrawerYear}
          onClose={() => setShowDrawerYear(false)}
          onSelect={handleSortSelectYear}
          selectedValue={personalFinancialPlan?.birthDate.year || 'Год'}
          options={years}        />

        {/* Drawer для выбора риск-профиля */}
        <Drawer
          title='Риск-профиль'
          visible={showRiskProfile}
          onClose={() => setShowRiskProfile(false)}
          onSelect={handleRiskProfile}
          selectedValue={personalFinancialPlan?.riskProfile || 'Агрессивный'}
          options={risks}        />
      </ScrollView>
      </FadeInView>

      <InfoModal
        visible={hintVisible}
        onClose={() => setHintVisible(false)}
        title={tips[0]?.title || 'Подсказки про ЛФП'}
        content={tips[0]?.content}
        videoUrl={tips[0]?.videoUrl}
        videoTitle={tips[0]?.videoTitle}
        enableChatGPT
      />
    </SafeAreaView>
  );
};

export default PersonalFinancialPlanScreen;