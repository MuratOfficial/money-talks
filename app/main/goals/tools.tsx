import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import useFinancialStore, { GoalAnalysis } from '@/hooks/useStore';
import FadeInView from '@/app/components/FadeInView';
import { Opacity } from '@/constants/design';
import { goBack } from '@/utils/navigation';
import {
  ANALYSIS_TOOLS,
  AnalysisTool,
  DESCARTES_QUESTIONS,
  SMARTER_QUESTIONS,
  WHY_QUESTIONS,
  cleanAnalysis,
  isToolComplete,
  sameAnalysis,
} from '@/constants/goalAnalysis';

/**
 * Проработка цели: «5 Почему», SMARTER и «Квадрат Декарта» (ТЗ, раздел «Цели»).
 * Цель выбирается на экране целей через pickEditGoal.
 */
const GoalToolsScreen = () => {
  const router = useRouter();
  const { currentGoalChangeId, getGoalById, updateGoal, theme } = useFinancialStore();
  const goal = getGoalById(currentGoalChangeId);

  const [tool, setTool] = useState<AnalysisTool>('whys');
  const [analysis, setAnalysis] = useState<GoalAnalysis>(() => ({
    whys: goal?.analysis?.whys ?? [],
    smarter: goal?.analysis?.smarter ?? {},
    descartes: goal?.analysis?.descartes ?? {},
  }));

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-black' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondaryColor = isDark ? 'text-gray-400' : 'text-gray-600';
  const inputBgColor = isDark ? 'bg-gray-800' : 'bg-gray-100';
  const cardBgColor = isDark ? 'bg-gray-800' : 'bg-gray-100';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-300';
  const iconColor = isDark ? 'white' : '#11181C';

  const goBackToGoals = () => goBack('/main/goals/main');

  if (!goal) {
    return (
      <SafeAreaView edges={['top']} className={`flex-1 ${bgColor} items-center justify-center px-6`}>
        <Text className={`${textColor} text-base text-center mb-4 font-['SFProDisplayRegular']`}>
          Цель не найдена
        </Text>
        <TouchableOpacity onPress={goBackToGoals} activeOpacity={Opacity.press}>
          <Text className="text-[#4CAF50] text-base font-['SFProDisplayRegular']">К списку целей</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const current = ANALYSIS_TOOLS.find((t) => t.key === tool)!;

  const setWhy = (index: number, value: string) =>
    setAnalysis((prev) => {
      const whys = [...(prev.whys ?? [])];
      whys[index] = value;
      return { ...prev, whys };
    });

  // Выход назад тоже сохраняет: иначе набранные ответы молча терялись бы.
  const handleBack = () => {
    // updatedAt цели меняется при каждом updateGoal и запускает синхронизацию —
    // без изменений не трогаем.
    if (!sameAnalysis(goal.analysis, analysis)) {
      updateGoal(goal.id, { analysis: cleanAnalysis(analysis) });
    }
    goBackToGoals();
  };

  const handleSave = () => {
    const wasComplete = isToolComplete(goal.analysis, tool);
    const cleaned = cleanAnalysis(analysis);
    updateGoal(goal.id, { analysis: cleaned });

    const nowComplete = isToolComplete(cleaned, tool);
    Alert.alert(
      nowComplete && !wasComplete ? 'ФинГид' : 'Сохранено',
      nowComplete && !wasComplete ? current.doneMessage : 'Ответы сохранены — можно вернуться к ним позже.'
    );
  };

  // Обычная функция, а не компонент: компонент, объявленный внутри экрана,
  // пересоздавался бы на каждый ввод, и поле теряло бы фокус после буквы.
  const renderField = (key: string, label: string, value: string | undefined, onChange: (v: string) => void, prefix?: string) => (
    <View key={key} className="mb-4">
      <Text className={`${textSecondaryColor} text-sm mb-2 font-['SFProDisplayRegular']`}>
        {prefix ? <Text className="text-[#4CAF50] font-['SFProDisplaySemiBold']">{prefix} — </Text> : null}
        {label}
      </Text>
      <TextInput
        value={value ?? ''}
        onChangeText={onChange}
        placeholder="Ваш ответ"
        placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
        multiline
        className={`${inputBgColor} ${textColor} px-4 py-3 rounded-2xl border ${borderColor} min-h-[52px] font-['SFProDisplayRegular']`}
        style={{ textAlignVertical: 'top' }}
      />
    </View>
  );

  return (
    <SafeAreaView edges={['top']} className={`flex-1 ${bgColor}`}>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3">
          <TouchableOpacity onPress={handleBack} activeOpacity={Opacity.press} className="p-2">
            <Ionicons name="chevron-back" size={24} color={iconColor} />
          </TouchableOpacity>
          <View className="flex-1 items-center">
            <Text className={`${textColor} text-lg font-['SFProDisplaySemiBold']`}>Проработка цели</Text>
            <Text className={`${textSecondaryColor} text-sm font-['SFProDisplayRegular']`} numberOfLines={1}>
              {goal.name}
            </Text>
          </View>
          <View className="w-10" />
        </View>

        {/* Tool tabs */}
        <View className="flex-row px-4 mb-4 gap-2">
          {ANALYSIS_TOOLS.map((t) => {
            const selected = t.key === tool;
            const done = isToolComplete(analysis, t.key);
            return (
              <TouchableOpacity
                key={t.key}
                onPress={() => setTool(t.key)}
                activeOpacity={Opacity.press}
                className={`flex-1 flex-row items-center justify-center py-2 rounded-full border ${
                  selected ? 'bg-[#4CAF50] border-[#4CAF50]' : borderColor
                }`}
              >
                {done && (
                  <Ionicons name="checkmark-circle" size={14} color={selected ? 'white' : '#4CAF50'} style={{ marginRight: 4 }} />
                )}
                <Text
                  className={`text-xs font-['SFProDisplayRegular'] ${selected ? 'text-white' : textSecondaryColor}`}
                  numberOfLines={1}
                >
                  {t.shortTitle}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <FadeInView key={tool} style={{ flex: 1 }}>
          <ScrollView className="flex-1 px-4" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {/* ФинГид */}
            <View className={`${cardBgColor} rounded-2xl p-4 mb-6 flex-row`}>
              <Ionicons name="sparkles-outline" size={20} color="#4CAF50" style={{ marginRight: 10, marginTop: 2 }} />
              <View className="flex-1">
                <Text className={`${textColor} text-sm font-['SFProDisplaySemiBold'] mb-1`}>ФинГид</Text>
                <Text className={`${textSecondaryColor} text-sm font-['SFProDisplayRegular'] leading-5`}>
                  {tool === 'whys' ? 'Чем глубже ты понимаешь свою цель — тем выше шанс её достичь.' : current.tagline}
                </Text>
              </View>
            </View>

            {tool === 'whys' &&
              WHY_QUESTIONS.map((q, i) => (
                renderField(`why-${i}`, q, analysis.whys?.[i], (v) => setWhy(i, v), `${i + 1}`)
              ))}

            {tool === 'smarter' &&
              SMARTER_QUESTIONS.map(({ key, letter, question }) => (
                renderField(
                  key,
                  question,
                  analysis.smarter?.[key],
                  (v) => setAnalysis((prev) => ({ ...prev, smarter: { ...prev.smarter, [key]: v } })),
                  letter
                )
              ))}

            {tool === 'descartes' &&
              DESCARTES_QUESTIONS.map(({ key, question }) => (
                renderField(
                  key,
                  question,
                  analysis.descartes?.[key],
                  (v) => setAnalysis((prev) => ({ ...prev, descartes: { ...prev.descartes, [key]: v } }))
                )
              ))}

            <View className="h-4" />
          </ScrollView>
        </FadeInView>

        <View className="px-4 pb-6 pt-3">
          <TouchableOpacity
            onPress={handleSave}
            activeOpacity={Opacity.press}
            className="w-full bg-[#4CAF50] py-4 rounded-2xl items-center"
          >
            <Text className="text-white text-base font-['SFProDisplaySemiBold']">Сохранить</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default GoalToolsScreen;
