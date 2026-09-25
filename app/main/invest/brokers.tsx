import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import useFinancialStore from '@/hooks/useStore';
import FadeInView from '@/app/components/FadeInView';
import { Opacity } from '@/constants/design';
import { goBack } from '@/utils/navigation';
import { Broker, fetchInvestContent, getCachedInvestContent } from '@/services/api';

/** Реестр лицензий АРРФР — единственный источник правды по брокерам в РК. */
const ARDFM_URL = 'https://www.gov.kz/memleket/entities/ardfm';

const CHECKLIST = [
  'Лицензия. Проверьте компанию в реестре АРРФР — без лицензии дальше можно не смотреть.',
  'Порог входа. Сколько нужно на старте и есть ли плата за обслуживание счёта.',
  'Комиссии. За сделку, за ввод и вывод денег, за неактивность — считайте все три.',
  'Инструменты. Есть ли то, что вам нужно: облигации, индексные фонды, иностранные акции.',
  'Поддержка и приложение. Насколько понятно, как купить, продать и вывести деньги.',
];

const openUrl = async (url: string) => {
  try {
    if (await Linking.canOpenURL(url)) await Linking.openURL(url);
  } catch (error) {
    console.error('Error opening URL:', error);
  }
};

/**
 * Справочник брокеров. Содержимое ведёт админ в панели: придумывать условия
 * и комиссии на стороне приложения нельзя — они быстро устаревают.
 */
const BrokersScreen = () => {
  const { theme } = useFinancialStore();
  const isDark = theme === 'dark';

  const bgColor = isDark ? 'bg-black' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondaryColor = isDark ? 'text-gray-400' : 'text-gray-600';
  const cardBgColor = isDark ? 'bg-white/10' : 'bg-gray-100';
  const iconColor = isDark ? 'white' : '#11181C';

  const cached = getCachedInvestContent();
  const [brokers, setBrokers] = useState<Broker[]>(cached?.brokers || []);
  const [loaded, setLoaded] = useState(cached !== null);

  useEffect(() => {
    let cancelled = false;
    fetchInvestContent().then((content) => {
      if (cancelled) return;
      setBrokers(content.brokers);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const row = (label: string, value?: string | null) =>
    value ? (
      <View className="flex-row justify-between mt-1">
        <Text className={`${textSecondaryColor} text-sm font-['SFProDisplayRegular']`}>{label}</Text>
        <Text className={`${textColor} text-sm font-['SFProDisplayRegular'] flex-1 text-right ml-3`}>{value}</Text>
      </View>
    ) : null;

  return (
    <SafeAreaView edges={['top']} className={`flex-1 ${bgColor}`}>
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity activeOpacity={Opacity.press} onPress={() => goBack('/main/invest')}>
          <Ionicons name="chevron-back" size={24} color={iconColor} />
        </TouchableOpacity>
        <Text className={`${textColor} flex-1 text-center text-lg font-['SFProDisplaySemiBold'] mr-6`}>
          Выбор брокера
        </Text>
      </View>

      <FadeInView style={{ flex: 1 }}>
        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
          <View className={`${cardBgColor} rounded-xl p-4 mb-4`}>
            <Text className={`${textColor} text-base font-['SFProDisplaySemiBold'] mb-2`}>На что смотреть</Text>
            {CHECKLIST.map((item, index) => (
              <View key={item} className={`flex-row ${index > 0 ? 'mt-2' : ''}`}>
                <Text className="text-[#4CAF50] text-sm mr-2 font-['SFProDisplaySemiBold']">{index + 1}</Text>
                <Text className={`${textSecondaryColor} text-sm leading-5 flex-1 font-['SFProDisplayRegular']`}>
                  {item}
                </Text>
              </View>
            ))}
          </View>

          {brokers.map((broker) => (
            <View key={broker.id} className={`${cardBgColor} rounded-xl p-4 mb-3`}>
              <Text className={`${textColor} text-base font-['SFProDisplaySemiBold']`}>{broker.name}</Text>
              {!!broker.description && (
                <Text className={`${textSecondaryColor} text-sm leading-5 mt-1 font-['SFProDisplayRegular']`}>
                  {broker.description}
                </Text>
              )}
              <View className="mt-2">
                {row('Лицензия', broker.license)}
                {row('Порог входа', broker.minAmount)}
                {row('Комиссии', broker.commission)}
              </View>
              {!!broker.url && (
                <TouchableOpacity
                  onPress={() => openUrl(broker.url!)}
                  activeOpacity={Opacity.press}
                  className="flex-row items-center justify-center mt-3 py-2.5 rounded-lg border border-[#4CAF50]"
                >
                  <MaterialIcons name="open-in-new" size={16} color="#4CAF50" style={{ marginRight: 6 }} />
                  <Text className="text-[#4CAF50] text-sm font-['SFProDisplayRegular']">Открыть сайт</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}

          {loaded && brokers.length === 0 && (
            <View className={`${cardBgColor} rounded-xl p-4 mb-3`}>
              <Text className={`${textSecondaryColor} text-sm leading-5 font-['SFProDisplayRegular']`}>
                Список брокеров пока не заполнен. Проверить лицензию любой компании можно прямо в реестре
                регулятора — это надёжнее любого рейтинга.
              </Text>
            </View>
          )}

          <TouchableOpacity
            onPress={() => openUrl(ARDFM_URL)}
            activeOpacity={Opacity.press}
            className="bg-[#4CAF50] rounded-xl py-3.5 px-4 mt-2 mb-10 flex-row items-center justify-center"
          >
            <MaterialIcons name="verified-user" size={18} color="white" style={{ marginRight: 8 }} />
            <Text className="text-white text-base font-['SFProDisplayRegular']">Проверить брокера в реестре АРРФР</Text>
          </TouchableOpacity>
        </ScrollView>
      </FadeInView>
    </SafeAreaView>
  );
};

export default BrokersScreen;
