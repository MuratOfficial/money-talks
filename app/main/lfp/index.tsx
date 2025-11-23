import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Drawer from '@/app/components/Drawer';
import useFinancialStore, { Goal } from '@/hooks/useStore';
import DropdownButton from './components/DropdownButton';
import GoalCard from './components/GoalCard';
import PDFLoadingModal from './components/PDFLoadingComponent';
import { useLFPExport } from '@/hooks/useLFPExport';

const PersonalFinancialPlanScreen = () => {
  const router = useRouter();

  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedSort, setSelectedSort] = useState('1 год');

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
    // ДОБАВЬТЕ ЭТИ ПОЛЯ ИЗ ВАШЕГО STORE:
    incomes,      // Если есть в store
    actives,      // Если есть в store  
    passives,     // Если есть в store
    expences      // Если есть в store
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

  const income = getCategoryBalance("income");
  const expence = getCategoryBalance("expence");
  const delta = income - expence || 0;

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
    <SafeAreaView className={`flex-1 ${bgColor}`}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <Text className={`${textColor} text-xl font-['SFProDisplaySemiBold']`}>
          Личный финансовый план
        </Text>
        <View className="w-8" />
      </View>

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
              <Text className={`${textColor} text-xs font-['SFProDisplayRegular']`}>
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
              className={`ml-4 px-3 py-2 gap-2 rounded-lg flex-row items-center ${
                (!isDataAvailable || loadingState.isVisible) ? 'opacity-50' : ''
              }`}
              activeOpacity={0.8}
            >
              <Text className={`${textColor} text-sm font-['SFProDisplayRegular'] mr-2`}>
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
              <Text className={`${textColor} text-sm font-['SFProDisplayRegular']`}>Расходы</Text>
              <View className="flex-row items-center">
                <Text className={`${textColor} text-sm font-['SFProDisplayRegular'] mr-2`}>{expence} ₸</Text>
                <Ionicons name="create-outline" size={16} color={iconColor} onPress={() => router.push("/main/finance/expences/main")}/>
              </View>
            </View>
            
            <View className="flex-row justify-between items-center">
              <Text className={`${textColor} text-sm font-['SFProDisplayRegular']`}>Доходы</Text>
              <View className="flex-row items-center">
                <Text className={`${textColor} text-sm font-['SFProDisplayRegular'] mr-2`}>{income} ₸</Text>
                <Ionicons name="create-outline" size={16} color={iconColor} onPress={() => router.push("/main/finance/incomes/main")} />
              </View>
            </View>
            
            <View className="flex-row justify-between items-center">
              <Text className={`${textColor} text-sm font-['SFProDisplayRegular']`}>Дельта</Text>
              <Text className={`${textColor} text-sm font-['SFProDisplayRegular']`}>{delta} ₸</Text>
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
              <Text className={`${textColor} text-sm font-['SFProDisplayRegular']`}>Активы</Text>
              <View className="flex-row items-center">
                <Text className={`${textColor} text-sm font-['SFProDisplayRegular'] mr-2`}>79 200 000 ₸</Text>
                <Ionicons onPress={() => router.push("/main/finance/actives/main")} name="create-outline" size={16} color={iconColor} />
              </View>
            </View>
            
            <View className="flex-row justify-between items-center">
              <Text className={`${textColor} text-sm font-['SFProDisplayRegular']`}>Пассивы</Text>
              <View className="flex-row items-center">
                <Text className={`${textColor} text-sm font-['SFProDisplayRegular'] mr-2`}>5 700 000 ₸</Text>
                <Ionicons onPress={() => router.push("/main/finance/passives/main")} name="create-outline" size={16} color={iconColor} />
              </View>
            </View>
            
            <View className="flex-row justify-between items-center">
              <Text className={`${textColor} text-sm font-['SFProDisplayRegular']`}>Чистый капитал</Text>
              <View className="flex-row items-center">
                <Text className={`${textColor} text-sm font-['SFProDisplayRegular'] mr-2`}>74 500 000 ₸</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ============== ПОДУШКА БЕЗОПАСНОСТИ ============== */}
        <View className="mb-6">
          <Text className={`${textSecondaryColor} text-sm font-['SFProDisplayRegular'] mb-3`}>
            Подушка безопасности на 3 месяца
          </Text>
          <View className={`flex-row justify-between items-center p-3 rounded-xl ${cardBgColor}`}>
            <Text className={`${textColor} text-sm font-['SFProDisplayRegular']`}>По постоянному расходу</Text>
            <Text 
              className={`${textColor} text-sm font-['SFProDisplayRegular'] bg-transparent text-right min-w-[100px]`}
            >{personalFinancialPlan?.securityPillow || ''}</Text>
          </View>
        </View>

        {/* ============== СТРАХОВАЯ ЗАЩИТА ============== */}
        <View className="mb-6">
          <Text className={`${textSecondaryColor} text-sm font-['SFProDisplayRegular'] mb-3`}>
            Страховая защита
          </Text>
          
          <View className={`space-y-3 p-3 rounded-xl ${cardBgColor}`}>
            {/* Страхование жизни */}
            <View className="flex-row justify-between items-center">
              <Text className={`${textColor} text-sm font-['SFProDisplayRegular']`}>Уход из жизни</Text>
              <Text
                className={`${textColor} text-sm font-['SFProDisplayRegular'] bg-transparent text-right min-w-[100px]`}
              >{personalFinancialPlan?.insurance.life || ''}</Text>
            </View>
            
            {/* Страхование от инвалидности */}
            <View className="flex-row justify-between items-center">
              <Text className={`${textColor} text-sm font-['SFProDisplayRegular']`}>Инвалидность</Text>
              <Text
                className={`${textColor} text-sm font-['SFProDisplayRegular'] bg-transparent text-right min-w-[100px]`}
              >{personalFinancialPlan?.insurance.disability || ''}</Text>
            </View>
            
            {/* Медицинское страхование */}
            <View className="flex-row justify-between items-center">
              <Text className={`${textColor} text-sm font-['SFProDisplayRegular']`}>Болезненный лист</Text>
              <Text
                className={`${textColor} text-sm font-['SFProDisplayRegular'] bg-transparent text-right min-w-[100px]`}
              >{personalFinancialPlan?.insurance.medical || ''}</Text>
            </View>
          </View>
        </View>

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
          options={days}
          animationType='fade'
        />

        {/* Drawer для выбора месяца */}
        <Drawer 
          title='Месяц'
          visible={showDrawerMonth}
          onClose={() => setShowDrawerMonth(false)}
          onSelect={handleSortSelectMonth}  
          selectedValue={personalFinancialPlan?.birthDate.month || 'Месяц'}
          options={months}
          animationType='fade'
        />

        {/* Drawer для выбора года */}
        <Drawer 
          title='Год'
          visible={showDrawerYear}
          onClose={() => setShowDrawerYear(false)}
          onSelect={handleSortSelectYear} 
          selectedValue={personalFinancialPlan?.birthDate.year || 'Год'}
          options={years}
          animationType='fade'
        />

        {/* Drawer для выбора риск-профиля */}
        <Drawer 
          title='Риск-профиль'
          visible={showRiskProfile}
          onClose={() => setShowRiskProfile(false)}
          onSelect={handleRiskProfile}  
          selectedValue={personalFinancialPlan?.riskProfile || 'Агрессивный'}
          options={risks}
          animationType='fade'
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default PersonalFinancialPlanScreen;