/**
 * Примеры использования PDF Generator
 */

import React, { useState } from 'react';
import { View, Button, Text, ActivityIndicator } from 'react-native';
import usePDFGenerate from '@/hooks/usePDFGenerate';
import { appStore } from '@/hooks/useStore';

/**
 * Пример 1: Базовое использование
 */
export const BasicExample = () => {
  const { generatePDF } = usePDFGenerate();
  const personalFinancialPlan = appStore((state) => state.personalFinancialPlan);

  const handleGenerate = async () => {
    if (!personalFinancialPlan) {
      alert('Сначала создайте ЛФП');
      return;
    }

    const success = await generatePDF({
      personalFinancialPlan,
      language: 'ru',
      currency: '₸',
    });

    if (success) {
      console.log('PDF успешно создан!');
    }
  };

  return <Button title="Сгенерировать PDF" onPress={handleGenerate} />;
};

/**
 * Пример 2: С отслеживанием прогресса
 */
export const ProgressExample = () => {
  const { generatePDF } = usePDFGenerate();
  const personalFinancialPlan = appStore((state) => state.personalFinancialPlan);
  
  const [status, setStatus] = useState<string>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [message, setMessage] = useState<string>('');

  const handleGenerate = async () => {
    if (!personalFinancialPlan) return;

    await generatePDF({
      personalFinancialPlan,
      language: 'ru',
      currency: '₸',
      onStatusChange: (newStatus) => setStatus(newStatus),
      onProgressChange: (newProgress) => setProgress(newProgress),
      onMessageChange: (newMessage) => setMessage(newMessage),
    });
  };

  return (
    <View>
      <Button title="Сгенерировать PDF" onPress={handleGenerate} />
      
      {status !== 'idle' && (
        <View style={{ marginTop: 20 }}>
          <Text>Статус: {status}</Text>
          <Text>Прогресс: {progress}%</Text>
          <Text>Сообщение: {message}</Text>
          <ActivityIndicator animating={status === 'generating'} />
        </View>
      )}
    </View>
  );
};

/**
 * Пример 3: Многоязычный PDF
 */
export const MultiLanguageExample = () => {
  const { generatePDF } = usePDFGenerate();
  const personalFinancialPlan = appStore((state) => state.personalFinancialPlan);
  const [language, setLanguage] = useState<'ru' | 'en' | 'kz'>('ru');

  const handleGenerate = async () => {
    if (!personalFinancialPlan) return;

    await generatePDF({
      personalFinancialPlan,
      language,
      currency: language === 'en' ? '$' : '₸',
    });
  };

  return (
    <View>
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
        <Button title="Русский" onPress={() => setLanguage('ru')} />
        <Button title="English" onPress={() => setLanguage('en')} />
        <Button title="Қазақша" onPress={() => setLanguage('kz')} />
      </View>
      
      <Button title={`Сгенерировать PDF (${language})`} onPress={handleGenerate} />
    </View>
  );
};

/**
 * Пример 4: Печать PDF
 */
export const PrintExample = () => {
  const { printPDF } = usePDFGenerate();
  const personalFinancialPlan = appStore((state) => state.personalFinancialPlan);

  const handlePrint = async () => {
    if (!personalFinancialPlan) return;

    await printPDF({
      personalFinancialPlan,
      language: 'ru',
      currency: '₸',
    });
  };

  return <Button title="Печать PDF" onPress={handlePrint} />;
};

/**
 * Пример 5: Полный компонент с всеми опциями
 */
export const FullExample = () => {
  const { generatePDF, printPDF } = usePDFGenerate();
  const personalFinancialPlan = appStore((state) => state.personalFinancialPlan);
  
  const [language, setLanguage] = useState<'ru' | 'en' | 'kz'>('ru');
  const [currency, setCurrency] = useState<'₸' | '$' | '€'>('₸');
  const [status, setStatus] = useState<string>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [message, setMessage] = useState<string>('');

  const options = {
    personalFinancialPlan: personalFinancialPlan!,
    language,
    currency,
    onStatusChange: setStatus,
    onProgressChange: setProgress,
    onMessageChange: setMessage,
  };

  const handleGenerate = async () => {
    if (!personalFinancialPlan) {
      alert('Сначала создайте ЛФП');
      return;
    }
    await generatePDF(options);
  };

  const handlePrint = async () => {
    if (!personalFinancialPlan) {
      alert('Сначала создайте ЛФП');
      return;
    }
    await printPDF(options);
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>
        Генератор PDF
      </Text>

      {/* Выбор языка */}
      <Text style={{ marginBottom: 10 }}>Язык:</Text>
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
        <Button
          title="Русский"
          onPress={() => setLanguage('ru')}
          color={language === 'ru' ? '#4CAF50' : '#ccc'}
        />
        <Button
          title="English"
          onPress={() => setLanguage('en')}
          color={language === 'en' ? '#4CAF50' : '#ccc'}
        />
        <Button
          title="Қазақша"
          onPress={() => setLanguage('kz')}
          color={language === 'kz' ? '#4CAF50' : '#ccc'}
        />
      </View>

      {/* Выбор валюты */}
      <Text style={{ marginBottom: 10 }}>Валюта:</Text>
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
        <Button
          title="₸ Тенге"
          onPress={() => setCurrency('₸')}
          color={currency === '₸' ? '#4CAF50' : '#ccc'}
        />
        <Button
          title="$ Доллар"
          onPress={() => setCurrency('$')}
          color={currency === '$' ? '#4CAF50' : '#ccc'}
        />
        <Button
          title="€ Евро"
          onPress={() => setCurrency('€')}
          color={currency === '€' ? '#4CAF50' : '#ccc'}
        />
      </View>

      {/* Кнопки действий */}
      <View style={{ gap: 10, marginBottom: 20 }}>
        <Button title="Сгенерировать PDF" onPress={handleGenerate} />
        <Button title="Печать PDF" onPress={handlePrint} />
      </View>

      {/* Прогресс */}
      {status !== 'idle' && (
        <View
          style={{
            padding: 15,
            backgroundColor: '#f0f0f0',
            borderRadius: 10,
          }}
        >
          <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>
            Статус: {status}
          </Text>
          <Text style={{ marginBottom: 5 }}>Прогресс: {progress}%</Text>
          <Text>{message}</Text>
          
          {status === 'generating' && (
            <ActivityIndicator
              style={{ marginTop: 10 }}
              size="large"
              color="#4CAF50"
            />
          )}
        </View>
      )}
    </View>
  );
};
