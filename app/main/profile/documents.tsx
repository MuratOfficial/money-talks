import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
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

// Версию берём из сборки, чтобы она не расходилась с app.json.
const APP_VERSION = Constants.expoConfig?.version ?? '1.0.4';
const DOC_REVISION = 'Редакция от 18 сентября 2026 года.';

const DOCUMENTS: DocItem[] = [
  {
    id: 'about',
    title: 'О приложении',
    icon: 'information-circle-outline',
    type: 'text',
    body: [
      'Money Talks — мобильное приложение для повышения финансовой грамотности. Оно помогает вести доходы и расходы по категориям, следить за кошельками, ставить цели и проверять их на прочность, считать личный финансовый план (ЛФП) и страховую защиту, определять свой риск-профиль и собирать инвестиционный портфель.',
      'ФинГид — встроенный помощник. Он подсказывает следующий шаг на основе ваших данных, отвечает на вопросы в чате и ведёт вас через уровни, челленджи и достижения.',
      'Финансовые данные хранятся в вашем аккаунте и синхронизируются между устройствами. Прогресс игровой части (открытые сундуки, купленные образы ФинГида, запущенные челленджи) хранится на самом устройстве.',
      'Напоминания планируются локально на вашем телефоне и включаются переключателем «Напоминания» в профиле.',
      `Версия приложения: ${APP_VERSION}`,
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
      '3. Контент. Образовательные материалы, тесты, подсказки и видеоуроки предоставляются в информационных целях и не являются индивидуальной инвестиционной рекомендацией.',
      '4. Расчёты. Личный финансовый план, страховая защита, риск-профиль, прогнозы по целям и оценка финансового здоровья — это ориентиры, рассчитанные по введённым вами данным и общим методикам. Они не учитывают всех ваших обстоятельств.',
      '5. ИИ-ассистент. Ответы ФинГида в чате формирует языковая модель, поэтому они могут содержать неточности. Проверяйте важную информацию и не рассматривайте ответы как индивидуальную инвестиционную, юридическую или налоговую консультацию.',
      '6. Ответственность. Приложение предоставляется «как есть». Разработчик не несёт ответственности за финансовые решения, принятые на основе данных Приложения.',
      '7. Изменения. Условия соглашения могут обновляться. Продолжая использовать Приложение, вы соглашаетесь с актуальной редакцией.',
      DOC_REVISION,
    ],
  },
  {
    id: 'policy',
    title: 'Политика конфиденциальности',
    icon: 'shield-checkmark-outline',
    type: 'text',
    body: [
      'Мы уважаем вашу конфиденциальность и заботимся о защите ваших персональных данных.',
      '1. Какие данные мы собираем. Email и имя — для входа. Данные, которые вы вводите сами: доходы и расходы, кошельки, активы и пассивы, цели, личный финансовый план, результаты теста риск-профиля. Фото профиля — если вы его добавите.',
      '2. Как мы используем данные. Только для работы приложения: вход, синхронизация между вашими устройствами, расчёты и отображение. Мы не используем ваши финансовые данные в рекламных целях и не продаём их.',
      '3. Где хранятся данные. В защищённой облачной инфраструктуре на серверах в Европейском союзе (Швеция). Обмен данными идёт по защищённому соединению. Регистрируясь, вы даёте согласие на трансграничную передачу данных для этих целей.',
      '4. Вход и биометрия. Пароль хранится у провайдера авторизации в необратимом виде — мы его не видим. Face ID и отпечаток пальца проверяет само устройство: биометрические данные не покидают телефон и нам не передаются.',
      '5. ИИ-ассистент. Когда вы задаёте вопрос ФинГиду, на наш сервер и далее в сервис языковой модели уходит только текст вашего вопроса, тема подсказки и предыдущие сообщения этого диалога. Суммы, кошельки, цели и другие финансовые данные в чат не передаются.',
      '6. Напоминания. Уведомления планируются и хранятся на самом устройстве. Мы не используем push-токены и не рассылаем уведомления с сервера. Разрешение запрашивается только в момент, когда вы включаете напоминания.',
      '7. Камера и фотографии. Доступ нужен исключительно для смены фото профиля и запрашивается в момент выбора снимка. Приложение не сканирует галерею и не обращается к камере в фоне.',
      '8. Реклама и аналитика. Приложение не показывает рекламу и не использует рекламные идентификаторы.',
      '9. Удаление данных. Вы можете удалить аккаунт вместе со всеми связанными данными в разделе «Редактировать профиль». Удаление необратимо.',
      '10. Ваши права. Вы вправе запросить доступ к своим персональным данным, их исправление или удаление, а также отозвать согласие на обработку — для этого достаточно обратиться в поддержку или удалить аккаунт.',
      '11. Контакты. По вопросам обработки персональных данных напишите в службу поддержки приложения.',
      DOC_REVISION,
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
      <SafeAreaView edges={['top']} className={`flex-1 ${bgColor}`}>
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
    <SafeAreaView edges={['top']} className={`flex-1 ${bgColor}`}>
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
