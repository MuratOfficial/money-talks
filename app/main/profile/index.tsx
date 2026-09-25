import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import ConfirmationDrawer from '@/app/components/MiniDrawer';
import Drawer from '@/app/components/Drawer';
import useFinancialStore from '@/hooks/useStore';
import AdviceAccordionModal from '@/app/components/AdviceAccordeon';
import FaceIDModal from '@/app/components/FaceIDModal';
import { ensureNotificationPermission, notificationsAvailable } from '@/lib/localNotifications';
import FadeInView from '@/app/components/FadeInView';
import { Opacity, Motion } from '@/constants/design';
import { useBiometric } from '@/hooks/useBiometric';
import ScoreRing from '@/app/components/ScoreRing';
import { computeFinancialHealth } from '@/utils/financialHealth';
import FinGuide from '@/app/components/FinGuide';
import { useGamification } from '@/hooks/useGamification';

const ProfileScreen = () => {

  const [modalVisible, setModalVisible] = useState(false);

    const { signOut, user, setTheme, theme, biometricEnabled, setBiometricEnabled, remindersEnabled, setRemindersEnabled, incomes, expences, passives, wallets, goals, currency } = useFinancialStore();
  const health = useMemo(
    () => computeFinancialHealth({ incomes, expences, passives, wallets, goals, currency }),
    [incomes, expences, passives, wallets, goals, currency]
  );
  const game = useGamification();
  const { isAvailable: biometricAvailable, label: biometricLabel } = useBiometric();
  const router = useRouter();
  
  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-black' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondaryColor = isDark ? 'text-gray-400' : 'text-gray-600';
  const cardBgColor = isDark ? 'bg-white/20' : 'bg-gray-100';
  const iconColor = isDark ? 'white' : '#11181C';
  const avatarBgColor = isDark ? 'bg-[#333333]' : 'bg-gray-200';


  const performLogout = async () => {
    try {
      await signOut();
      
      router.replace("/(auth)/login");
      
    } catch (error) {
      console.error('Ошибка при выходе:', error);
      Alert.alert('Ошибка', 'Не удалось выйти из аккаунта');
    } 
  };

  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);

  // Модалка биометрии открывается только при ВКЛЮЧЕНИИ тумблера — чтобы
  // подтвердить, что устройство действительно распознаёт пользователя.
  const [showFaceID, setShowFaceID] = useState(false);

  const handleFaceIDToggle = (value: boolean) => {
    if (value) {
      // Включаем: сначала проверим доступность, затем подтвердим биометрией.
      if (!biometricAvailable) {
        Alert.alert(
          'Биометрия недоступна',
          `Чтобы включить вход по ${biometricLabel}, настройте Face ID или отпечаток в настройках устройства.`
        );
        return;
      }
      setShowFaceID(true);
    } else {
      // Выключаем сразу.
      setBiometricEnabled(false);
    }
  };

  // Напоминания о записях, целях и челленджах — локальные, без сервера.
  const handleRemindersToggle = async (value: boolean) => {
    if (!value) {
      setRemindersEnabled(false);
      return;
    }
    if (!notificationsAvailable()) {
      Alert.alert('Недоступно', 'Напоминания работают в установленном приложении на телефоне.');
      return;
    }
    const granted = await ensureNotificationPermission();
    if (!granted) {
      Alert.alert('Нет разрешения', 'Разрешите уведомления для Money Talks в настройках телефона.');
      return;
    }
    setRemindersEnabled(true);
    Alert.alert('Готово', 'Будем напоминать о записях, сроках целей и челленджах.');
  };

  const handleFaceIDSuccess = () => {
    setShowFaceID(false);
    setBiometricEnabled(true);
    Alert.alert('Готово', `Вход по ${biometricLabel} включён`);
  };

  const handleFaceIDError = () => {
    setShowFaceID(false);
    setBiometricEnabled(false);
  };

  const adviceItems = [
    {
      id: '1',
      question: 'Что такое финансовая грамотность?',
      answer: 'Финансовая грамотность — это знание и умение управлять своими финансами: бюджетирование, сбережение, инвестиции, управление долгами и планирование будущего.'
    },
    {
      id: '2',
      question: 'Зачем мне нужна финансовая грамотность?',
      answer: 'Финансовая грамотность помогает принимать обоснованные решения о деньгах, избегать долгов, создавать сбережения и достигать финансовых целей. Это основа для финансовой независимости и стабильности.'
    },
    {
      id: '3',
      question: 'С чего начать путь к финансовой грамотности?',
      answer: 'Начните с ведения учета доходов и расходов, создания бюджета и постановки финансовых целей. Изучайте основы инвестирования, читайте книги по финансам и следите за своими тратами.'
    },
    {
      id: '4',
      question: 'Как правильно вести бюджет?',
      answer: 'Записывайте все доходы и расходы, категоризируйте траты, планируйте расходы на месяц вперед. Следуйте правилу 50/30/20: 50% на необходимые расходы, 30% на желания, 20% на сбережения и инвестиции.'
    },
    {
      id: '5',
      question: 'Что делать с долгами?',
      answer: 'Сначала погасите долги с высокой процентной ставкой. Создайте план погашения, избегайте новых долгов, рассмотрите возможность рефинансирования. Не берите кредиты на потребительские товары без крайней необходимости.'
    }
  ];


  const [showDrawerTheme, setShowDrawerTheme] = useState(false);
  const [selectedSortTheme, setSelectedSortTheme] = useState(isDark ?'Темная':'Светлая');


  const profileName = user?.name || "Unknown";

  const handleSortSelectTheme = (value:any) => {
    setSelectedSortTheme(value);
    if(value==="Темная"){
      setTheme("dark")
    }
    if(value==="Светлая"){
      setTheme("light")
    }
    
  };

  const [showDrawerCurrency, setShowDrawerCurrency] = useState(false);
  const [selectedSortCurrency, setSelectedSortCurrency] = useState('Тенге (₸)');

  const avatarUri = user?.avatar || null; 

  const handleSortSelectCurrency = (value:any) => {
    setSelectedSortCurrency(value);
    console.log('Selected sort:', value);
  };

    const [showLogoutDrawer, setShowLogoutDrawer] = useState(false);

  const menuItems = [
    {
      id: 'tips',
      title: 'Советы',
      icon: 'library-outline',
      hasArrow: true,
      onPress: () => openModal()
    },
    {
      id: 'achievements',
      title: 'Достижения',
      icon: 'diamond-outline',
      hasArrow: true,
      onPress: () => router.push('/main/profile/achievements')
    },
    {
      id: 'currency',
      title: 'Выбор валюты',
      icon: 'cash-outline',
      hasArrow: true,
      onPress: () => setShowDrawerCurrency(true)
    },
    {
      id: 'documents',
      title: 'Документы',
      icon: 'document-outline',
      hasArrow: true,
      onPress: () => router.push('/main/profile/documents')
    },
    {
      id: 'faceid',
      title: biometricLabel,
      icon: 'finger-print-outline',
      hasSwitch: true,
      switchValue: biometricEnabled,
      onSwitchChange: handleFaceIDToggle
    },
    {
      id: 'reminders',
      title: 'Напоминания',
      icon: 'notifications-outline',
      hasSwitch: true,
      switchValue: remindersEnabled,
      onSwitchChange: handleRemindersToggle
    },
    {
      id: 'theme',
      title: 'Выбор темы',
      icon: 'phone-portrait-outline',
      hasArrow: true,
      onPress: () => setShowDrawerTheme(true)
    },
    {
      id: 'logout',
      title: 'Выйти из аккаунта',
      icon: 'exit-outline',
      hasArrow: true,
      onPress: () => setShowLogoutDrawer(true)
    }
  ];

  const MenuItem = ({ item }:{item:any}) => (
    <TouchableOpacity
      onPress={item.onPress}
      className={`${cardBgColor} rounded-xl p-3.5 mb-3 flex-row items-center justify-between`}
      activeOpacity={Opacity.press}
    >
      <View className="flex-row items-center">
        <Ionicons name={item.icon} size={20} color={iconColor} />
        <Text className={`${textColor} text-sm font-['SFProDisplayRegular'] ml-3`}>
          {item.title}
        </Text>
      </View>
      
      {item.hasArrow && (
        <Ionicons name="chevron-forward" size={20} color={iconColor} />
      )}
      
      {item.hasSwitch && (
        <Switch
          value={item.switchValue}
          onValueChange={item.onSwitchChange}
          trackColor={{ false: '#767577', true: '#4CAF50' }}
          thumbColor={item.switchValue ? '#ffffff' : '#f4f3f4'}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView edges={['top']} className={`flex-1 ${bgColor}`}>
      <ScrollView 
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
      >

         <FaceIDModal
            visible={showFaceID}
            onClose={() => setShowFaceID(false)}
            onSuccess={handleFaceIDSuccess}
            onError={handleFaceIDError}
            promptMessage={`Подтвердите включение входа по ${biometricLabel}`}
          />
        {/* Header */}
        <Text className={`${textColor} text-xl font-['SFProDisplayBold'] mt-3 mb-8`}>
          Профиль
        </Text>

        {/* Profile Info */}
        <View className="items-center mb-8">
          {/* Avatar */}

          {avatarUri ? (
              <>
                <Image 
                  source={{ uri: avatarUri }} 
                  className="w-24 h-24 rounded-full"
                  resizeMode="cover"
                />
                
              </>
            ) : (

              <View className={`w-24 h-24 ${avatarBgColor} rounded-full items-center justify-center mb-4 relative`}>
                <Ionicons name="person" size={32} color={iconColor} />
              </View>
              
            )}
          
          
          {/* Name */}
          <Text className={`${textColor} text-lg font-['SFProDisplayRegular'] mb-2`}>
            {profileName}
          </Text>
          
          {/* Edit Button */}
          <TouchableOpacity className="flex-row items-center" activeOpacity={Opacity.press} onPress={()=>router.push('/main/profile/edit-profile')}>
            <Text className="text-[#4CAF50] text-base font-['SFProDisplayRegular'] mr-1">
              Редактировать
            </Text>
            <Ionicons name="pencil" size={16} color="#4CAF50" />
          </TouchableOpacity>
        </View>

        {/* Уровень и монеты (ТЗ: прогресс-бар по уровням в профиле) */}
        <TouchableOpacity
          onPress={() => router.push('/main/profile/progress')}
          activeOpacity={Opacity.press}
          className={`${cardBgColor} rounded-2xl p-4 mb-3 flex-row items-center`}
        >
          <FinGuide size={60} mood="happy" animated={false} />
          <View className="flex-1 ml-4">
            <View className="flex-row justify-between items-center">
              <Text className={`${textColor} text-base font-['SFProDisplaySemiBold']`}>{game.level.level.title}</Text>
              <Text className="text-sm text-[#F59E0B] font-['SFProDisplaySemiBold']">🪙 {game.coins.balance}</Text>
            </View>
            <Text className={`${textSecondaryColor} text-sm mb-2 font-['SFProDisplayRegular']`}>
              {game.level.next ? `${game.xp.total} / ${game.level.next.xp} XP` : `${game.xp.total} XP`}
              {game.boxes > 0 ? ` · сундуков: ${game.boxes}` : ''}
            </Text>
            <View className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
              <View className="h-full rounded-full bg-[#4CAF50]" style={{ width: `${Math.round(game.level.progress * 100)}%` }} />
            </View>
          </View>
        </TouchableOpacity>

        {/* Финансовое здоровье (ТЗ: центральный элемент профиля) */}
        <TouchableOpacity
          onPress={() => router.push('/main/profile/health')}
          activeOpacity={Opacity.press}
          className={`${cardBgColor} rounded-2xl p-4 mb-6 flex-row items-center`}
        >
          <ScoreRing score={health.score} color={health.level.color} />
          <View className="flex-1 ml-4">
            <Text className={`${textColor} text-base font-['SFProDisplaySemiBold']`}>Финансовое здоровье</Text>
            <Text className="text-sm font-['SFProDisplayRegular']" style={{ color: health.level.color }}>
              {health.level.title}
            </Text>
            <Text className="text-[#4CAF50] text-sm mt-1 font-['SFProDisplayRegular']">Как улучшить? →</Text>
          </View>
        </TouchableOpacity>


        {/* Menu Items */}
        <View className="mb-8">
          {menuItems.map((item, index) => (
            <FadeInView key={item.id} delay={index * Motion.stagger}>
              <MenuItem item={item} />
            </FadeInView>
          ))}
        </View>
        <Drawer 
            title='Выбор темы'
            visible={showDrawerTheme}
            onClose={() => setShowDrawerTheme(false)}
            onSelect={handleSortSelectTheme}
            selectedValue={selectedSortTheme}
            options={ ['Светлая', 'Темная']}
            
          />
          <Drawer 
            title='Выбор валюты'
            visible={showDrawerCurrency}
            onClose={() => setShowDrawerCurrency(false)}
            onSelect={handleSortSelectCurrency}
            selectedValue={selectedSortCurrency}
            options={ ['Доллар ($)', 'Евро (€)', 'Дирхам ( د. إ)', 'Тенге (₸)', 'Лира (₺)', 'Рубль (₽)']}
        
          />

         

           <AdviceAccordionModal
            visible={modalVisible}
            onClose={closeModal}
            title="Советы"
            items={adviceItems}
          />

        <ConfirmationDrawer
          visible={showLogoutDrawer}
          title="Выйти из аккаунта?"
          onClose={() => setShowLogoutDrawer(false)}
          onConfirm={performLogout}
          onCancel={() => console.log('Отменено')}
          confirmText="Выйти"
          cancelText="Отмена"
        />
      </ScrollView>
      
    </SafeAreaView>
  );
};

export default ProfileScreen;