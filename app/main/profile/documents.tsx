import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import useFinancialStore from '@/hooks/useStore';
import FadeInView from '@/app/components/FadeInView';
import { Opacity, Motion } from '@/constants/design';

type DocType = 'text' | 'development';

interface DocItem {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  type: DocType;
  /** Параграфы для текстовых документов. */
  body?: string[];
}

const DOCUMENTS: DocItem[] = [
  {
    id: 'about',
    title: 'О приложении',
    icon: 'information-circle-outline',
    type: 'text',
    body: [
      'Money Talks — мобильное приложение для повышения финансовой грамотности. Оно помогает вести личный бюджет, планировать цели, формировать личный финансовый план (ЛФП) и осваивать основы инвестирования.',
      'Все ваши финансовые данные хранятся в вашем аккаунте и синхронизируются между устройствами. Приложение не передаёт ваши персональные данные третьим лицам в рекламных целях.',
      'Версия приложения: 1.0.2',
    ],
  },
  {
    id: 'license',
    title: 'Лицензионное соглашение',
    icon: 'document-text-outline',
    type: 'text',
    body: [
      'Настоящее Лицензионное соглашение регулирует условия использования мобильного приложения Money Talks (далее — «Приложение»).',
      '1. Предоставление лицензии. Вам предоставляется неисключительное право использовать Приложение на личных устройствах исключительно в личных, некоммерческих целях.',
      '2. Ограничения. Запрещается копировать, модифицировать, декомпилировать Приложение, а также использовать его для незаконной деятельности.',
      '3. Контент. Образовательные материалы, тесты и подсказки предоставляются в информационных целях и не являются индивидуальной инвестиционной рекомендацией.',
      '4. Ответственность. Приложение предоставляется «как есть». Разработчик не несёт ответственности за финансовые решения, принятые на основе данных Приложения.',
      '5. Изменения. Условия соглашения могут обновляться. Продолжая использовать Приложение, вы соглашаетесь с актуальной редакцией.',
    ],
  },
  {
    id: 'policy',
    title: 'Политика конфиденциальности',
    icon: 'shield-checkmark-outline',
    type: 'text',
    body: [
      'Мы уважаем вашу конфиденциальность и заботимся о защите ваших персональных данных.',
      '1. Какие данные мы собираем. Email и имя для авторизации, а также введённые вами финансовые данные (бюджет, цели, ЛФП).',
      '2. Как мы используем данные. Исключительно для работы приложения: авторизация, синхронизация и отображение ваших финансовых данных.',
      '3. Хранение и защита. Данные хранятся в защищённой облачной инфраструктуре. Доступ к вашему аккаунту защищён паролем, при желании — биометрией.',
      '4. Передача третьим лицам. Мы не продаём и не передаём ваши персональные данные третьим лицам в рекламных целях.',
      '5. Удаление данных. Вы можете удалить свой аккаунт и все связанные данные в разделе «Редактировать профиль».',
      '6. Контакты. По вопросам обработки данных пишите в службу поддержки приложения.',
    ],
  },
  {
    id: 'payment',
    title: 'Онлайн оплата',
    icon: 'card-outline',
    type: 'development',
  },
];

const DocumentsScreen = () => {
  const router = useRouter();
  const { theme } = useFinancialStore();
  const [activeDoc, setActiveDoc] = useState<DocItem | null>(null);

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-black' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondaryColor = isDark ? 'text-gray-300' : 'text-gray-700';
  const cardBgColor = isDark ? 'bg-white/10' : 'bg-gray-100';
  const iconColor = isDark ? '#FFF' : '#11181C';

  const Header = ({ title, onBack }: { title: string; onBack: () => void }) => (
    <View className="flex-row items-center py-3 pb-6 w-full">
      <TouchableOpacity activeOpacity={Opacity.press} onPress={onBack} className="absolute z-10">
        <Ionicons name="chevron-back" size={24} color={iconColor} />
      </TouchableOpacity>
      <Text className={`${textColor} text-center w-full text-lg font-['SFProDisplaySemiBold']`}>
        {title}
      </Text>
    </View>
  );

  // --- Детальный экран документа ---
  if (activeDoc) {
    return (
      <SafeAreaView className={`flex-1 ${bgColor}`}>
        <View className="flex-1 px-4">
          <Header title={activeDoc.title} onBack={() => setActiveDoc(null)} />

          {activeDoc.type === 'development' ? (
            <FadeInView style={{ flex: 1 }}>
              <View className="flex-1 items-center justify-center px-6 pb-20">
                <View className={`w-20 h-20 ${cardBgColor} rounded-3xl items-center justify-center mb-6`}>
                  <Ionicons name="construct-outline" size={36} color="#4CAF50" />
                </View>
                <Text className={`${textColor} text-xl font-['SFProDisplaySemiBold'] text-center mb-3`}>
                  Раздел в разработке
                </Text>
                <Text className={`${textSecondaryColor} text-base text-center leading-6 font-['SFProDisplayRegular']`}>
                  Онлайн-оплата скоро появится. Мы работаем над безопасным подключением платёжных систем — следите за обновлениями.
                </Text>
              </View>
            </FadeInView>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
              <FadeInView>
                {activeDoc.body?.map((paragraph, index) => (
                  <Text
                    key={index}
                    className={`${textSecondaryColor} text-sm leading-7 mb-4 font-['SFProDisplayRegular']`}
                  >
                    {paragraph}
                  </Text>
                ))}
              </FadeInView>
            </ScrollView>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // --- Список документов ---
  return (
    <SafeAreaView className={`flex-1 ${bgColor}`}>
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <Header title="Документы" onBack={() => router.replace('/main/profile')} />

        <View className="mb-8">
          {DOCUMENTS.map((item, index) => (
            <FadeInView key={item.id} delay={index * Motion.stagger}>
              <TouchableOpacity
                onPress={() => setActiveDoc(item)}
                className={`${cardBgColor} rounded-2xl p-4 mb-3 flex-row items-center justify-between`}
                activeOpacity={Opacity.press}
              >
                <View className="flex-row items-center flex-1">
                  <View className="w-9 h-9 rounded-xl bg-[#4CAF50]/15 items-center justify-center mr-3">
                    <Ionicons name={item.icon} size={20} color="#4CAF50" />
                  </View>
                  <Text className={`${textColor} text-sm font-['SFProDisplayRegular'] flex-1`}>
                    {item.title}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={iconColor} />
              </TouchableOpacity>
            </FadeInView>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DocumentsScreen;
