import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import useFinancialStore from '@/hooks/useStore';
import FadeInView from '@/app/components/FadeInView';
import Drawer from '@/app/components/Drawer';
import { Colors, Opacity } from '@/constants/design';
import { findCategory, getCategories } from '@/constants/categories';
import { parseStatementPdf } from '@/services/api';
import { goBack } from '@/utils/navigation';
import { buildRows, summarize, toRecords, type ImportRow, type StatementResult } from '@/utils/statementImport';

/** Сервер принимает до 4 МБ — проверяем заранее, чтобы не гонять файл зря. */
const MAX_BYTES = 4 * 1024 * 1024;
const WARNING = '#F59E0B';
const MONTHS = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

const BANKS_EXACT = ['Kaspi Gold', 'Halyk', 'Jusan / Alatau City'];

type Step =
  | { name: 'intro' }
  | { name: 'loading' }
  | { name: 'error'; message: string }
  | { name: 'preview'; result: StatementResult }
  | { name: 'done'; count: number; income: number; expense: number; regularity: 'regular' | 'irregular' };

function shortDate(day: string): string {
  const [, month, date] = day.split('-').map(Number);
  return `${date} ${MONTHS[month - 1]}`;
}

function periodLabel(result: StatementResult): string | null {
  if (!result.period) return null;
  const year = result.period.to.slice(0, 4);
  return `${shortDate(result.period.from)} – ${shortDate(result.period.to)} ${year}`;
}

const ImportStatementScreen = () => {
  const router = useRouter();
  const { theme, incomes, expences, currency, formatAmount, importRecords, setRegOption } = useFinancialStore();
  const isDark = theme === 'dark';

  const bgColor = isDark ? 'bg-black' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondaryColor = isDark ? 'text-gray-400' : 'text-gray-600';
  const cardBgColor = isDark ? 'bg-white/10' : 'bg-gray-100';
  const borderColor = isDark ? 'border-white/10' : 'border-gray-200';
  const iconColor = isDark ? 'white' : '#11181C';
  const mutedIcon = isDark ? '#9CA3AF' : '#6B7280';

  const [step, setStep] = useState<Step>({ name: 'intro' });
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [editing, setEditing] = useState<ImportRow | null>(null);

  const totals = useMemo(() => summarize(rows), [rows]);

  const pickFile = async () => {
    const picked = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (picked.canceled || !picked.assets?.length) return;

    const asset = picked.assets[0];
    if (asset.size && asset.size > MAX_BYTES) {
      setStep({ name: 'error', message: 'Файл больше 4 МБ. Выгрузите выписку за период покороче.' });
      return;
    }

    setStep({ name: 'loading' });
    try {
      const result = await parseStatementPdf({
        uri: asset.uri,
        name: asset.name || 'statement.pdf',
        mimeType: asset.mimeType,
        file: (asset as { file?: File }).file,
      });
      setRows(buildRows(result, { incomes, expences }, currency));
      setStep({ name: 'preview', result });
    } catch (error) {
      setStep({ name: 'error', message: error instanceof Error ? error.message : 'Не получилось разобрать выписку.' });
    }
  };

  const toggle = useCallback((key: string) => {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, selected: !row.selected } : row)));
  }, []);

  const allSelected = rows.length > 0 && rows.every((row) => row.selected);
  const toggleAll = () => setRows((current) => current.map((row) => ({ ...row, selected: !allSelected })));

  const changeCategory = (name: string) => {
    if (!editing) return;
    const category = getCategories(editing.kind).find((c) => c.name === name);
    if (category) {
      setRows((current) =>
        current.map((row) => (row.key === editing.key ? { ...row, category: category.id, subcategory: undefined } : row))
      );
    }
    setEditing(null);
  };

  const runImport = () => {
    const records = toRecords(rows);
    importRecords(records);
    // Раздел «Расходы» откроем на той вкладке, где больше импортированных записей.
    const regular = records.expences.filter((r) => r.regularity === 'regular').length;
    setStep({ name: 'done', ...totals, regularity: regular > records.expences.length / 2 ? 'regular' : 'irregular' });
  };

  const openExpenses = (regularity: 'regular' | 'irregular') => {
    setRegOption(regularity);
    // У импортированных операций даты из выписки — «Сегодня» их бы скрыл.
    router.replace({ pathname: '/main/finance/expences/main', params: { period: 'Все время' } });
  };

  const categoryName = (row: ImportRow) => {
    const category = findCategory(row.kind, row.category);
    const sub = category?.subcategories.find((s) => s.id === row.subcategory);
    return sub ? `${category?.name} · ${sub.name}` : category?.name ?? 'Прочее';
  };

  const renderRow = ({ item }: { item: ImportRow }) => {
    const income = item.kind === 'income';
    return (
      <View className={`flex-row items-start py-3 border-b ${borderColor}`}>
        <TouchableOpacity activeOpacity={Opacity.press} onPress={() => toggle(item.key)} className="pr-3 pt-0.5" hitSlop={8}>
          <Ionicons
            name={item.selected ? 'checkbox' : 'square-outline'}
            size={24}
            color={item.selected ? Colors.primary : mutedIcon}
          />
        </TouchableOpacity>
        <View className="flex-1 mr-3">
          <Text className={`${textColor} text-base font-['SFProDisplayRegular']`} numberOfLines={2}>
            {item.name}
          </Text>
          <TouchableOpacity activeOpacity={Opacity.press} onPress={() => setEditing(item)} className="flex-row items-center mt-1">
            <Text className={`${textSecondaryColor} text-sm font-['SFProDisplayRegular']`}>
              {shortDate(item.tx.date)} · {categoryName(item)}
            </Text>
            <Ionicons name="chevron-down" size={14} color={mutedIcon} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
          {item.note && (
            <Text className="text-sm mt-1 font-['SFProDisplayRegular']" style={{ color: WARNING }}>
              {item.note}
            </Text>
          )}
        </View>
        <Text
          className={`text-base font-['SFProDisplaySemiBold'] ${income ? 'text-[#4CAF50]' : textColor}`}
          style={item.selected ? undefined : { opacity: Opacity.disabled }}
        >
          {income ? '+' : '−'}
          {formatAmount(item.amount)}
        </Text>
      </View>
    );
  };

  const header = (title: string) => (
    <View className="flex-row items-center px-4 py-3">
      <TouchableOpacity activeOpacity={Opacity.press} onPress={() => goBack('/main/profile')}>
        <Ionicons name="chevron-back" size={24} color={iconColor} />
      </TouchableOpacity>
      <Text className={`${textColor} flex-1 text-center text-lg font-['SFProDisplaySemiBold'] mr-6`}>{title}</Text>
    </View>
  );

  const primaryButton = (label: string, onPress: () => void, disabled = false) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={Opacity.press}
      className="bg-[#4CAF50] rounded-xl py-3.5 items-center"
      style={disabled ? { opacity: Opacity.disabled } : undefined}
    >
      <Text className="text-white text-base font-['SFProDisplaySemiBold']">{label}</Text>
    </TouchableOpacity>
  );

  if (step.name === 'preview') {
    const { result } = step;
    const check = result.checks[0];
    const period = periodLabel(result);
    return (
      <SafeAreaView edges={['top', 'bottom']} className={`flex-1 ${bgColor}`}>
        {header('Проверьте операции')}
        <FlatList
          data={rows}
          keyExtractor={(row) => row.key}
          renderItem={renderRow}
          className="flex-1 px-4"
          initialNumToRender={20}
          ListHeaderComponent={
            <View className="mb-2">
              <View className={`${cardBgColor} rounded-2xl p-4 mb-3`}>
                <Text className={`${textColor} text-base font-['SFProDisplaySemiBold']`}>{result.bankName}</Text>
                <Text className={`${textSecondaryColor} text-sm mt-1 font-['SFProDisplayRegular']`}>
                  {[period, `операций: ${result.transactions.length}`].filter(Boolean).join(' · ')}
                </Text>
                {check?.ok && (
                  <View className="flex-row items-center mt-3">
                    <Ionicons name="shield-checkmark" size={18} color={Colors.primary} />
                    <Text className="text-sm ml-2 flex-1 font-['SFProDisplayRegular']" style={{ color: Colors.primary }}>
                      Сверено с остатками в выписке — прочитаны все операции
                    </Text>
                  </View>
                )}
                {result.warnings.map((warning) => (
                  <View key={warning} className="flex-row items-start mt-3">
                    <Ionicons name="alert-circle" size={18} color={WARNING} style={{ marginTop: 1 }} />
                    <Text className="text-sm ml-2 flex-1 font-['SFProDisplayRegular']" style={{ color: WARNING }}>
                      {warning}
                    </Text>
                  </View>
                ))}
              </View>
              <View className="flex-row items-center justify-between">
                <Text className={`${textSecondaryColor} text-sm font-['SFProDisplayRegular']`}>
                  Отмечено {totals.count} из {rows.length}
                </Text>
                <TouchableOpacity activeOpacity={Opacity.press} onPress={toggleAll} hitSlop={8}>
                  <Text className="text-[#4CAF50] text-sm font-['SFProDisplayRegular']">
                    {allSelected ? 'Снять все' : 'Отметить все'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          }
        />
        <View className={`px-4 pt-3 pb-2 border-t ${borderColor}`}>
          <Text className={`${textSecondaryColor} text-sm text-center mb-2 font-['SFProDisplayRegular']`}>
            Доходы +{formatAmount(totals.income)} · расходы −{formatAmount(totals.expense)}
          </Text>
          {primaryButton(totals.count ? `Добавить операции: ${totals.count}` : 'Отметьте операции', runImport, !totals.count)}
        </View>

        <Drawer
          title="Категория"
          visible={!!editing}
          onClose={() => setEditing(null)}
          onSelect={changeCategory}
          selectedValue={editing ? findCategory(editing.kind, editing.category)?.name : undefined}
          options={editing ? getCategories(editing.kind).map((c) => c.name) : []}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} className={`flex-1 ${bgColor}`}>
      {header('Импорт выписки')}
      <FadeInView style={{ flex: 1 }}>
        {/* flexGrow, а не flex: 1 — так индикатор загрузки центрируется, а длинный
            текст на маленьком экране прокручивается. */}
        <ScrollView className="flex-1 px-4" contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
          {step.name === 'intro' && (
            <>
              <View className={`${cardBgColor} rounded-2xl p-4 mb-4`}>
                <Ionicons name="document-text-outline" size={32} color={Colors.primary} />
                <Text className={`${textColor} text-lg mt-2 font-['SFProDisplaySemiBold']`}>Загрузите выписку из банка</Text>
                <Text className={`${textSecondaryColor} text-sm leading-5 mt-2 font-['SFProDisplayRegular']`}>
                  Скачайте выписку по карте в приложении банка в формате PDF и выберите её здесь. Мы покажем операции,
                  а вы отметите, какие добавить в доходы и расходы.
                </Text>
              </View>

              <View className={`${cardBgColor} rounded-2xl p-4 mb-4`}>
                <Text className={`${textColor} text-base mb-2 font-['SFProDisplaySemiBold']`}>Какие банки поддерживаются</Text>
                {BANKS_EXACT.map((bank) => (
                  <View key={bank} className="flex-row items-center mt-1.5">
                    <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
                    <Text className={`${textColor} text-sm ml-2 font-['SFProDisplayRegular']`}>{bank}</Text>
                  </View>
                ))}
                <Text className={`${textSecondaryColor} text-sm leading-5 mt-3 font-['SFProDisplayRegular']`}>
                  Выписки Forte, БЦК, Freedom и других банков читаются общим способом — перед импортом проверьте суммы.
                </Text>
              </View>

              {primaryButton('Выбрать PDF', pickFile)}

              <View className="flex-row items-start mt-4 px-1">
                <Ionicons name="lock-closed-outline" size={16} color={mutedIcon} style={{ marginTop: 2 }} />
                <Text className={`${textSecondaryColor} text-sm leading-5 ml-2 flex-1 font-['SFProDisplayRegular']`}>
                  Выбирая файл, вы соглашаетесь отправить его на сервер Money Talks для распознавания. Сам файл
                  не сохраняется: сервер читает его и сразу забывает.
                </Text>
              </View>
            </>
          )}

          {step.name === 'loading' && (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text className={`${textSecondaryColor} text-base mt-4 font-['SFProDisplayRegular']`}>Читаем выписку…</Text>
            </View>
          )}

          {step.name === 'error' && (
            <View className={`${cardBgColor} rounded-2xl p-4`}>
              <Ionicons name="alert-circle-outline" size={32} color={WARNING} />
              <Text className={`${textColor} text-base mt-2 font-['SFProDisplaySemiBold']`}>Не получилось прочитать выписку</Text>
              <Text className={`${textSecondaryColor} text-sm leading-5 mt-2 mb-4 font-['SFProDisplayRegular']`}>{step.message}</Text>
              {primaryButton('Выбрать другой файл', pickFile)}
            </View>
          )}

          {step.name === 'done' && (
            <View className={`${cardBgColor} rounded-2xl p-4`}>
              <Ionicons name="checkmark-circle" size={36} color={Colors.primary} />
              <Text className={`${textColor} text-lg mt-2 font-['SFProDisplaySemiBold']`}>Добавлено операций: {step.count}</Text>
              <Text className={`${textSecondaryColor} text-sm leading-5 mt-2 mb-4 font-['SFProDisplayRegular']`}>
                Доходы +{formatAmount(step.income)}, расходы −{formatAmount(step.expense)}. Записи появились в разделах
                с датами из выписки.
              </Text>
              {primaryButton('Открыть расходы', () => openExpenses(step.regularity))}
              <TouchableOpacity activeOpacity={Opacity.press} onPress={() => setStep({ name: 'intro' })} className="items-center mt-4">
                <Text className="text-[#4CAF50] text-base font-['SFProDisplayRegular']">Загрузить ещё выписку</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </FadeInView>
    </SafeAreaView>
  );
};

export default ImportStatementScreen;
