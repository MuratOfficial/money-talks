# PDF Generator Module

Модульная система генерации PDF для Личного Финансового Плана (ЛФП).

## Структура

```
hooks/
├── pdf/
│   ├── pdfTypes.ts           # Типы данных
│   ├── pdfCalculations.ts    # Финансовые калькуляторы
│   ├── pdfTranslations.ts    # Переводы (ru, en, kz)
│   ├── pdfTemplates.ts       # HTML шаблоны
│   └── pdfGenerator.ts       # Основной генератор
└── usePDFGenerate.ts         # Хук для использования
```

## Особенности

### ✅ Динамические данные
Все данные берутся из store:
- **Доходы** (incomes)
- **Расходы** (expences)
- **Активы** (actives)
- **Пассивы** (passives)
- **Цели** (goals)

### ✅ Модульная архитектура
- Разделение ответственности
- Легкая поддержка
- Возможность расширения

### ✅ Многоязычность
Поддержка трех языков:
- Русский (ru)
- English (en)
- Қазақша (kz)

### ✅ Финансовые расчеты
- Требуемая доходность
- Рост капитала
- Ежемесячные инвестиции
- Конвертация валют (₸, $, €)

## Использование

```typescript
import usePDFGenerate from '@/hooks/usePDFGenerate';
import { appStore } from '@/hooks/useStore';

const MyComponent = () => {
  const { generatePDF, printPDF } = usePDFGenerate();
  const personalFinancialPlan = appStore((state) => state.personalFinancialPlan);

  const handleGeneratePDF = async () => {
    if (!personalFinancialPlan) return;

    await generatePDF({
      personalFinancialPlan,
      language: 'ru',
      currency: '₸',
      onStatusChange: (status) => console.log('Status:', status),
      onProgressChange: (progress) => console.log('Progress:', progress),
      onMessageChange: (message) => console.log('Message:', message),
    });
  };

  return (
    <Button onPress={handleGeneratePDF} title="Сгенерировать PDF" />
  );
};
```

## API

### generatePDF(options)
Генерирует и сохраняет PDF файл.

**Параметры:**
- `personalFinancialPlan` - Данные ЛФП (обязательно)
- `language` - Язык документа ('ru' | 'en' | 'kz')
- `currency` - Валюта ('₸' | '$' | '€')
- `onStatusChange` - Callback для изменения статуса
- `onProgressChange` - Callback для прогресса (0-100)
- `onMessageChange` - Callback для сообщений

**Возвращает:** `Promise<boolean>`

### printPDF(options)
Отправляет PDF на печать.

**Параметры:** Те же, что и у `generatePDF`

**Возвращает:** `Promise<boolean>`

## Добавление новых секций

### 1. Создайте шаблон в `pdfTemplates.ts`

```typescript
export const generateMySection = (data: MyData): string => `
  <div class="my-section">
    <h2>${data.title}</h2>
    <p>${data.content}</p>
  </div>
`;
```

### 2. Используйте в `pdfGenerator.ts`

```typescript
export const generateLFPHtmlContent = (options: PDFGeneratorOptions): string => {
  // ... existing code
  
  return `
    <!DOCTYPE html>
    <html>
      <body>
        ${generateMySection(myData)}
      </body>
    </html>
  `;
};
```

## Добавление новых калькуляторов

Добавьте функцию в `pdfCalculations.ts`:

```typescript
export const calculateMyMetric = (
  param1: number,
  param2: number
): number => {
  return param1 * param2;
};
```

## Добавление переводов

Обновите `pdfTranslations.ts`:

```typescript
export const translations = {
  ru: {
    // ... existing translations
    myNewKey: 'Мой новый перевод',
  },
  en: {
    // ... existing translations
    myNewKey: 'My new translation',
  },
  kz: {
    // ... existing translations
    myNewKey: 'Менің жаңа аудармам',
  },
};
```

## Преимущества новой архитектуры

1. **Уменьшение размера файла**: С 1386 строк до ~120 строк в основном хуке
2. **Устранение дублирования**: Переиспользуемые компоненты
3. **Динамические данные**: Все из store, никаких хардкодов
4. **Легкая поддержка**: Каждый модуль отвечает за свою область
5. **Масштабируемость**: Легко добавлять новые секции и функции
6. **Типобезопасность**: Полная типизация TypeScript

## Миграция со старой версии

Старый код:
```typescript
import { generateLFPPDFWithProgress } from '@/hooks/usePDFGenerate';

await generateLFPPDFWithProgress({
  personalFinancialPlan,
  // ... options
});
```

Новый код:
```typescript
import usePDFGenerate from '@/hooks/usePDFGenerate';

const { generatePDF } = usePDFGenerate();

await generatePDF({
  personalFinancialPlan,
  // ... options
});
```

## Troubleshooting

### PDF не генерируется
- Проверьте, что `personalFinancialPlan` не null
- Убедитесь, что данные в store заполнены
- Проверьте консоль на ошибки

### Неправильные данные в PDF
- Проверьте структуру данных в store
- Убедитесь, что все поля заполнены корректно
- Проверьте форматирование чисел

### Проблемы с переводами
- Убедитесь, что язык указан правильно ('ru' | 'en' | 'kz')
- Проверьте, что все ключи переводов существуют
