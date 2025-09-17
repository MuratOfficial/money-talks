import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Drawer from '@/app/components/Drawer';
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';
import useFinancialStore, { Goal } from '@/hooks/useStore';

const PersonalFinancialPlanScreen = () => {
  const router = useRouter();

  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedSort, setSelectedSort] = useState('1 год');

  const {user, getCategoryBalance,goals, updatePersonalFinancialPlan, clearPersonalFinancialPlan, resetPersonalFinancialPlan, personalFinancialPlan} = useFinancialStore();
  
  // Form states
  const [fio, setFio] = useState(user?.name || "");
  const [birthDay, setBirthDay] = useState('День');
  const [birthMonth, setBirthMonth] = useState('Месяц');
  const [birthYear, setBirthYear] = useState('Год');
  const [activity, setActivity] = useState('');
  const [financialInfo, setFinancialInfo] = useState('');
  const [selectedYear, setSelectedYear] = useState('1 год');

  const income = getCategoryBalance("income");
  const expence = getCategoryBalance("expence");

  const delta = income - expence || 0;

  const handleSortSelect = (value:any) => {
    setSelectedSort(value);
    console.log('Selected sort:', value);
  };
  
  // Insurance states
  const [lifeInsurance, setLifeInsurance] = useState('500 000 ₸');
  const [disability, setDisability] = useState('600 000 ₸');
  const [medicalInsurance, setMedicalInsurance] = useState('600 000 ₸');
  
  // Risk profile
  const [showRiskProfile, setShowRiskProfile] = useState(false);
  const [riskProfile, setRiskProfile] = useState('Агрессивный');
  

  const days: string[] = Array.from({ length: 31 }, (_, i) => i + 1).map(x=>x.toString());
  const months: string[] = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const risks = ['Агрессивный', "Умеренно-агрессивный", "Умеренный", "Умеренно-консервативный", "Консервативный"]

  const currentYear: number = new Date().getFullYear();
  const years: string[] = Array.from({ length: 100 }, (_, i) => currentYear - i).map(x=>x.toString());
  
  const [securityPillow, setSecurityPillow] = useState('1 000 000 ₸');

  // const handleSortSelectDay = (value:any) => {
  //   setSelectedSortDay(value);
  //   setBirthDay(value);
  // };
  
  // const handleSortSelectMonth = (value:any) => {
  //   setSelectedSortMonth(value);
  //   setBirthMonth(value);
  // };

  //  const handleRiskProfile = (value:any) => {
  //   setRiskProfile(value);
  // };
  
  // const handleSortSelectYear = (value:any) => {
  //   setSelectedSortYear(value);
  //   setBirthYear(value);
  // };

  const [showDrawerDay, setShowDrawerDay] = useState(false);
  const [selectedSortDay, setSelectedSortDay] = useState('День');
  const [showDrawerMonth, setShowDrawerMonth] = useState(false);
  const [selectedSortMonth, setSelectedSortMonth] = useState('Месяц');
  const [showDrawerYear, setShowDrawerYear] = useState(false);
  const [selectedSortYear, setSelectedSortYear] = useState('Год');

  // ============== ФУНКЦИИ ОБНОВЛЕНИЯ ЛФП ДАННЫХ ==============

// PFP field update functions
const updateFio = (value: string) => {
  updatePersonalFinancialPlan({ fio: value });
};

const updateActivity = (value: string) => {
  updatePersonalFinancialPlan({ activity: value });
};

const updateFinancialDependents = (value: string) => {
  updatePersonalFinancialPlan({ financialDependents: value });
};

const updateSecurityPillow = (value: string) => {
  updatePersonalFinancialPlan({ securityPillow: value });
};

const updateLifeInsurance = (value: string) => {
  updatePersonalFinancialPlan({ 
    insurance: { 
      ...personalFinancialPlan?.insurance, 
      life: value 
    } as any 
  });
};

const updateDisabilityInsurance = (value: string) => {
  updatePersonalFinancialPlan({ 
    insurance: { 
      ...personalFinancialPlan?.insurance, 
      disability: value 
    } as any 
  });
};

const updateMedicalInsurance = (value: string) => {
  updatePersonalFinancialPlan({ 
    insurance: { 
      ...personalFinancialPlan?.insurance, 
      medical: value 
    } as any 
  });
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


  // Функция генерации PDF с Tailwind CSS

interface ExcelCell {
  value: string | number;
}

interface ExcelRow {
  [key: number]: ExcelCell;
}

interface ExcelSheet {
  rows?: ExcelRow[];
}

interface ExcelData {
  sheets: {
    [key: string]: ExcelSheet;
  };
}

interface LiquidAsset {
  name: string;
  currency: string;
  ownership: string;
  value: number;
}

// Создаем функцию для преобразования ваших данных в формат ExcelData
const prepareExcelData = (): ExcelData => {
  // Примерные данные на основе вашего компонента
  const portfolioRows: ExcelRow[] = [
    { 0: { value: 'Название актива' }, 1: { value: 'Валюта' }, 2: { value: 'Доля владения' }, 3: { value: 'Стоимость' } },
    { 0: { value: 'Депозит в банке' }, 1: { value: 'KZT' }, 2: { value: '100%' }, 3: { value: securityPillow.replace(/[^\d]/g, '') || 1000000 } },
    { 0: { value: 'Акции' }, 1: { value: 'USD' }, 2: { value: '100%' }, 3: { value: 500000 } },
    { 0: { value: 'Облигации' }, 1: { value: 'KZT' }, 2: { value: '100%' }, 3: { value: 300000 } },
    { 0: { value: 'Неликвидные активы' } }, // Маркер окончания ликвидных активов
    // Дополнительные строки для типов инструментов (строки 18-30)
    { 18: { value: 'Акции роста' } },
    { 18: { value: 'Дивидендные акции' } },
    { 18: { value: 'Государственные облигации' } },
    { 18: { value: 'Корпоративные облигации' } },
    { 18: { value: 'Недвижимость' } },
    { 18: { value: 'Драгоценные металлы' } }
  ];

  const instrumentsRows: ExcelRow[] = [
    { 0: { value: 'Год' }, 1: { value: 'Сумма' } },
    { 0: { value: '1' }, 1: { value: delta > 0 ? delta * 12 : 1200000 } },
    { 0: { value: '2' }, 1: { value: delta > 0 ? delta * 24 : 2400000 } },
    { 0: { value: '3' }, 1: { value: delta > 0 ? delta * 36 : 3600000 } },
    { 0: { value: '4' }, 1: { value: delta > 0 ? delta * 48 : 4800000 } },
    { 0: { value: '5' }, 1: { value: delta > 0 ? delta * 60 : 6000000 } },
    // Рентная корзина (столбцы 7-8)
    { 7: { value: '1' }, 8: { value: 600000 } },
    { 7: { value: '2' }, 8: { value: 1200000 } },
    { 7: { value: '3' }, 8: { value: 1800000 } },
    // Активная корзина (столбцы 14-15)
    { 14: { value: '1' }, 15: { value: 400000 } },
    { 14: { value: '2' }, 15: { value: 800000 } },
    { 14: { value: '3' }, 15: { value: 1200000 } }
  ];

  return {
    sheets: {
      'DEVИнвест. Портфель': { rows: portfolioRows },
      'DEV_Инструменты': { rows: instrumentsRows }
    }
  };
};

const generatePDF = async (): Promise<void> => {
  try {
    // Используем подготовленные данные вместо переданных
    const excelData = prepareExcelData();
    const currentDate = new Date().toLocaleDateString('ru-RU');
    
    // Извлекаем данные из Excel
    const portfolioData = excelData.sheets['DEVИнвест. Портфель'] || {};
    const instrumentsData = excelData.sheets['DEV_Инструменты'] || {};
    
    // Извлекаем ликвидные активы
    const liquidAssets: LiquidAsset[] = [];
    if (portfolioData.rows) {
      for (let i = 3; i < portfolioData.rows.length; i++) {
        const row = portfolioData.rows[i];
        if (row && row[0] && row[0].value && row[0].value !== 'Неликвидные активы') {
          liquidAssets.push({
            name: row[0]?.value?.toString() || '',
            currency: row[1]?.value?.toString() || '',
            ownership: row[2]?.value?.toString() || '',
            value: Number(row[3]?.value) || 0
          });
        } else {
          break;
        }
      }
    }

    // Извлекаем инструменты
    const regularBasket: ExcelRow[] = instrumentsData.rows ? instrumentsData.rows.slice(1, 6) : [];
    const rentalBasket: ExcelRow[] = instrumentsData.rows ? instrumentsData.rows.slice(6, 9) : [];
    const activeBasket: ExcelRow[] = instrumentsData.rows ? instrumentsData.rows.slice(9, 12) : [];

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          body { font-family: 'Inter', sans-serif; }
          .progress-bar { background: linear-gradient(to right, #10B981 var(--progress, 0%), #E5E7EB var(--progress, 0%)); }
          .asset-table { border-collapse: collapse; width: 100%; }
          .asset-table th, .asset-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .asset-table th { background-color: #f8fafc; }
        </style>
      </head>
      <body class="bg-gray-50">
        <div class="max-w-4xl mx-auto p-8 bg-white shadow-lg">
          <!-- Header -->
          <div class="text-center border-b-4 border-blue-500 pb-6 mb-8">
            <h1 class="text-3xl font-bold text-blue-600 mb-2">Инвестиционный Портфель</h1>
            <p class="text-gray-600">Сгенерировано: ${currentDate}</p>
            <p class="text-gray-600">Клиент: ${fio || 'Не указано'}</p>
            <p class="text-gray-600">Профиль риска: ${riskProfile}</p>
          </div>

          <!-- Ликвидные активы -->
          <div class="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
            <h2 class="text-xl font-semibold text-blue-700 mb-4 border-b-2 border-blue-300 pb-2">Ликвидные активы</h2>
            <div class="overflow-x-auto">
              <table class="asset-table">
                <thead>
                  <tr>
                    <th>Название</th>
                    <th>Валюта</th>
                    <th>Доля владения</th>
                    <th>Стоимость</th>
                  </tr>
                </thead>
                <tbody>
                  ${liquidAssets.map(asset => `
                    <tr>
                      <td>${asset.name}</td>
                      <td>${asset.currency}</td>
                      <td>${asset.ownership}</td>
                      <td>${asset.value.toLocaleString('ru-RU')} ₸</td>
                    </tr>
                  `).join('')}
                  <tr class="bg-blue-50 font-semibold">
                    <td colspan="3">Общая стоимость ликвидных активов:</td>
                    <td>${liquidAssets.reduce((sum, asset) => sum + asset.value, 0).toLocaleString('ru-RU')} ₸</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Финансовая подушка и страховки -->
          <div class="mb-8 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6 border border-yellow-200">
            <h2 class="text-xl font-semibold text-yellow-700 mb-4 border-b-2 border-yellow-300 pb-2">Финансовая безопасность</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="bg-white p-4 rounded-lg border border-yellow-200">
                <h3 class="text-lg font-semibold text-yellow-600 mb-2">Финансовая подушка</h3>
                <p class="text-2xl font-bold">${securityPillow}</p>
              </div>
              <div class="bg-white p-4 rounded-lg border border-yellow-200">
                <h3 class="text-lg font-semibold text-yellow-600 mb-2">Страхование жизни</h3>
                <p class="text-xl">${lifeInsurance}</p>
              </div>
              <div class="bg-white p-4 rounded-lg border border-yellow-200">
                <h3 class="text-lg font-semibold text-yellow-600 mb-2">Страхование от нетрудоспособности</h3>
                <p class="text-xl">${disability}</p>
              </div>
              <div class="bg-white p-4 rounded-lg border border-yellow-200">
                <h3 class="text-lg font-semibold text-yellow-600 mb-2">Медицинское страхование</h3>
                <p class="text-xl">${medicalInsurance}</p>
              </div>
            </div>
          </div>

          <!-- Инвестиционные корзины -->
          <div class="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
            <h2 class="text-xl font-semibold text-green-700 mb-4 border-b-2 border-green-300 pb-2">Инвестиционные стратегии</h2>
            
            <!-- Регулярная корзина -->
            <div class="mb-6">
              <h3 class="text-lg font-semibold text-green-600 mb-3">Регулярная корзина</h3>
              <div class="bg-white p-4 rounded-lg border border-green-200">
                ${regularBasket.length > 0 ? `
                  <table class="asset-table">
                    <thead>
                      <tr>
                        <th>Год</th>
                        <th>Сумма</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${regularBasket.map((row, index) => `
                        <tr>
                          <td>${row[0]?.value?.toString() || index + 1}</td>
                          <td>${row[1]?.value ? Number(row[1].value).toLocaleString('ru-RU') + ' ₸' : '0 ₸'}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                ` : '<p class="text-gray-500">Данные не доступны</p>'}
              </div>
            </div>

            <!-- Рентная корзина -->
            <div class="mb-6">
              <h3 class="text-lg font-semibold text-blue-600 mb-3">Рентная корзина</h3>
              <div class="bg-white p-4 rounded-lg border border-blue-200">
                ${rentalBasket.length > 0 ? `
                  <table class="asset-table">
                    <thead>
                      <tr>
                        <th>Год</th>
                        <th>Сумма</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${rentalBasket.map((row, index) => `
                        <tr>
                          <td>${row[7]?.value?.toString() || index + 1}</td>
                          <td>${row[8]?.value ? Number(row[8].value).toLocaleString('ru-RU') + ' ₸' : '0 ₸'}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                ` : '<p class="text-gray-500">Данные не доступны</p>'}
              </div>
            </div>

            <!-- Активная корзина -->
            <div>
              <h3 class="text-lg font-semibold text-purple-600 mb-3">Активная корзина</h3>
              <div class="bg-white p-4 rounded-lg border border-purple-200">
                ${activeBasket.length > 0 ? `
                  <table class="asset-table">
                    <thead>
                      <tr>
                        <th>Год</th>
                        <th>Сумма</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${activeBasket.map((row, index) => `
                        <tr>
                          <td>${row[14]?.value?.toString() || index + 1}</td>
                          <td>${row[15]?.value ? Number(row[15].value).toLocaleString('ru-RU') + ' ₸' : '0 ₸'}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                ` : '<p class="text-gray-500">Данные не доступны</p>'}
              </div>
            </div>
          </div>

          <!-- Типы инструментов -->
          <div class="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
            <h2 class="text-xl font-semibold text-purple-700 mb-4 border-b-2 border-purple-300 pb-2">Типы инвестиционных инструментов</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              ${portfolioData.rows && portfolioData.rows.length > 18 ? 
                portfolioData.rows.slice(18, 30).filter(row => row[18] && row[18].value).map(row => `
                  <div class="bg-white p-3 rounded-lg border border-purple-200 flex items-center">
                    <div class="w-2 h-6 bg-purple-500 rounded mr-3"></div>
                    <span class="text-gray-700">${row[18].value?.toString()}</span>
                  </div>
                `).join('') : 
                '<p class="text-gray-500 col-span-2">Данные о типах инструментов не доступны</p>'
              }
            </div>
          </div>

          <!-- Финансовые цели -->
          ${goals && goals.length > 0 ? `
          <div class="mb-8 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg p-6 border border-teal-200">
            <h2 class="text-xl font-semibold text-teal-700 mb-4 border-b-2 border-teal-300 pb-2">Финансовые цели</h2>
            <div class="space-y-3">
              ${goals.map((goal: any) => `
                <div class="p-4 bg-white rounded-lg border-l-4 border-teal-500">
                  <p class="text-gray-700 font-semibold">${goal.name || 'Цель'}</p>
                  <p class="text-gray-600">Сумма: ${goal.amount ? Number(goal.amount).toLocaleString('ru-RU') + ' ₸' : 'Не указана'}</p>
                  <p class="text-gray-600">Срок: ${goal.deadline || 'Не указан'}</p>
                </div>
              `).join('')}
            </div>
          </div>
          ` : ''}

          <!-- Рекомендации -->
          <div class="mb-8 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg p-6 border border-gray-200">
            <h2 class="text-xl font-semibold text-gray-700 mb-4 border-b-2 border-gray-300 pb-2">Инвестиционные рекомендации</h2>
            <div class="space-y-3">
              <div class="p-4 bg-white rounded-lg border-l-4 border-blue-500">
                <p class="text-gray-700">• Диверсифицируйте портфель между различными типами активов</p>
              </div>
              <div class="p-4 bg-white rounded-lg border-l-4 border-green-500">
                <p class="text-gray-700">• Регулярно ребалансируйте портфель в соответствии с инвестиционной стратегией</p>
              </div>
              <div class="p-4 bg-white rounded-lg border-l-4 border-yellow-500">
                <p class="text-gray-700">• Учитывайте валютные риски при инвестировании в иностранные активы</p>
              </div>
              <div class="p-4 bg-white rounded-lg border-l-4 border-purple-500">
                <p class="text-gray-700">• Мониторьте ликвидность активов для обеспечения финансовой гибкости</p>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="text-center pt-6 border-t-2 border-blue-500">
            <p class="text-sm text-gray-500">
              Инвестиционный портфель сгенерирован на основе предоставленных данных.<br>
              Рекомендуется регулярный мониторинг и корректировка инвестиционной стратегии.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Создаем PDF
    const { uri } = await (Print as any).printToFileAsync({ 
      html: htmlContent,
      base64: false 
    });

    console.log('PDF создан:', uri);

    // Показываем меню для сохранения/поделиться
    await (shareAsync as any)(uri, { 
      UTI: '.pdf', 
      mimeType: 'application/pdf',
      dialogTitle: 'Сохранить инвестиционный портфель'
    });

  } catch (error) {
    console.error('Ошибка при создании PDF:', error);
    Alert.alert('Ошибка', 'Не удалось создать PDF файл');
  }
};

  const DropdownButton = ({ value, onPress, isFirst = false, isLast = false }:any) => (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-1 bg-white/10 rounded-xl px-3 py-3 flex-row items-center justify-between ${
        !isLast ? 'mr-2' : ''
      }`}
      activeOpacity={0.7}
    >
      <Text className="text-white text-sm font-['SFProDisplayRegular']">
        {value}
      </Text>
      <Ionicons name="chevron-down" size={16} color="white" />
    </TouchableOpacity>
  );

 const CircularProgress = ( {progress}:{progress:number}) => {
       const radius = 35;
    const strokeWidth = 6;
    const normalizedRadius = radius - strokeWidth * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDasharray = `${circumference} ${circumference}`;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <View className="relative">
        <svg
          height={radius * 2}
          width={radius * 2}
          className="transform -rotate-90"
        >
          <circle
            stroke="#374151"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke="#4CAF50"
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        <View className="absolute inset-0 items-center justify-center">
          <Text className="text-white text-sm font-['SFProDisplayBold']">
            {progress.toFixed(1)}%
          </Text>
        </View>
      </View>
    );
  };

  const GoalCard = ({ goal }:{goal:Goal}) => (
    <View className="bg-gray-800 rounded-xl p-4 mb-3">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 mr-3">
          <Text className="text-white text-base font-['SFProDisplaySemiBold'] mb-1">
            {goal.name}
          </Text>
          {goal.timeframe ? 
                      <Text className="text-gray-400 text-sm font-['SFProDisplayRegular'] mb-1">
                        Срок достижения цели {goal.timeframe.day} {goal.timeframe.month} {goal.timeframe.year}
                      </Text>:<Text className="text-gray-400 text-sm font-['SFProDisplayRegular'] mb-1">
                        Выберите срок
                        </Text>}
          <Text className="text-gray-400 text-xs font-['SFProDisplayRegular'] mb-1">
            {goal.amount}
          </Text>
          {goal.monthlyInvestment && (
            <Text className="text-gray-400 text-xs font-['SFProDisplayRegular']">
              {goal.monthlyInvestment}
            </Text>
          )}
        </View>
        <CircularProgress 
          progress={goal.progress ?? 0} 
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <Text className="text-white text-xl font-['SFProDisplaySemiBold']">
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
        <Text className="text-gray-400 text-sm font-['SFProDisplayRegular'] mb-2">
          ФИО
        </Text>
        <TextInput
          value={personalFinancialPlan?.fio || user?.name || ''}
          onChangeText={updateFio}  
          className="bg-white/10 rounded-xl px-4 py-3 text-white text-base font-['SFProDisplayRegular']"
          placeholder="Введите ФИО"
          placeholderTextColor="#666"
        />
      </View>

        {/* ============== ДАТА РОЖДЕНИЯ ============== */}
        <View className="mb-4">
          <Text className="text-gray-400 text-sm font-['SFProDisplayRegular'] mb-2">
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
          <Text className="text-gray-400 text-sm font-['SFProDisplayRegular'] mb-2">
            Деятельность
          </Text>
          <TextInput
            value={personalFinancialPlan?.activity || ''}
            onChangeText={updateActivity}
            className="bg-white/10 rounded-xl px-4 py-3 text-white text-base font-['SFProDisplayRegular']"
            placeholder="Введите деятельность"
            placeholderTextColor="#666"
          />
        </View>

        {/* ============== ФИНАНСОВО-ЗАВИСИМЫЕ ЛЮДИ ============== */}
        <View className="mb-4">
          <Text className="text-gray-400 text-sm font-['SFProDisplayRegular'] mb-2">
            Финансово-зависимые люди
          </Text>
          <TextInput
            value={personalFinancialPlan?.financialDependents || ''}
            onChangeText={updateFinancialDependents} 
            className="bg-white/10 rounded-xl px-4 py-3 text-white text-base font-['SFProDisplayRegular']"
            placeholder="Введите количество"
            keyboardType="number-pad"
            placeholderTextColor="#666"
          />
        </View>

        <View className="mb-6">
          <Text className="text-white text-lg font-['SFProDisplaySemiBold'] mb-4">
            ЛФП
          </Text>
          
          <View className="flex-row items-center justify-between ">
            <TouchableOpacity
              onPress={() => setShowDrawer(true)}
              className=" px-3 py-1.5 border border-white w-fit rounded-2xl flex flex-row items-center justify-center gap-2"
            >
              <Text className="text-white text-xs font-['SFProDisplayRegular']">
                {selectedSort}
              </Text>
              <View className="w-4 h-4  rounded items-center justify-center">
                      <Ionicons name="funnel-outline" size={14} color="white" />
                    </View>
            </TouchableOpacity>
            <Drawer 
              title='Сортировка'
              visible={showDrawer}
              onClose={() => setShowDrawer(false)}
              onSelect={handleSortSelect}
              selectedValue={selectedSort}
              options={ ['1 год', '5 лет', '10  лет', '20 лет', '25 лет']}
            />

            <TouchableOpacity 
              onPress={generatePDF}
              className="ml-4 px-3 py-2 gap-2 rounded-lg flex-row items-center "
              activeOpacity={0.8}
            >
              <Text className="text-white text-sm font-['SFProDisplayRegular'] mr-2">
                Скачайте файл
              </Text>
              <View className="w-4 h-4  rounded items-center justify-center">
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
          <Text className="text-gray-400 text-sm font-['SFProDisplayRegular'] mb-3">
            Расчет деталей
          </Text>
          
          <View className="space-y-3 p-3 rounded-xl bg-white/10">
            <View className="flex-row justify-between items-center">
              <Text className="text-white text-sm font-['SFProDisplayRegular']">Расходы</Text>
              <View className="flex-row items-center">
                <Text className="text-white text-sm font-['SFProDisplayRegular'] mr-2">{expence} ₸</Text>
                <Ionicons name="create-outline" size={16} color="white" onPress={()=>router.push("/main/finance/expences/main")}/>
              </View>
            </View>
            
            <View className="flex-row justify-between items-center">
              <Text className="text-white text-sm font-['SFProDisplayRegular']">Доходы</Text>
              <View className="flex-row items-center">
                <Text className="text-white text-sm font-['SFProDisplayRegular'] mr-2">{income} ₸</Text>
                <Ionicons name="create-outline" size={16} color="white" onPress={()=>router.push("/main/finance/incomes/main")} />
              </View>
            </View>
            
            <View className="flex-row justify-between items-center">
              <Text className="text-white text-sm font-['SFProDisplayRegular']">Дельта</Text>
              <Text className="text-white text-sm font-['SFProDisplayRegular']">{delta} ₸</Text>
            </View>
          </View>
        </View>

        {/* Net Worth Calculation */}
        <View className="mb-6">
          <Text className="text-gray-400 text-sm font-['SFProDisplayRegular'] mb-3">
            Расчет чистого капитала
          </Text>
          
          <View className="space-y-3 p-3 rounded-xl bg-white/10">
            <View className="flex-row justify-between items-center">
              <Text className="text-white text-sm font-['SFProDisplayRegular']">Активы</Text>
              <View className="flex-row items-center">
                <Text className="text-white text-sm font-['SFProDisplayRegular'] mr-2">79 200 000 ₸</Text>
                <Ionicons onPress={()=>router.push("/main/finance/actives/main")} name="create-outline" size={16} color="white" />
              </View>
            </View>
            
            <View className="flex-row justify-between items-center">
              <Text className="text-white text-sm font-['SFProDisplayRegular']">Пассивы</Text>
              <View className="flex-row items-center">
                <Text className="text-white text-sm font-['SFProDisplayRegular'] mr-2">5 700 000 ₸</Text>
                <Ionicons onPress={()=>router.push("/main/finance/passives/main")} name="create-outline" size={16} color="white" />
              </View>
            </View>
            
            <View className="flex-row justify-between items-center">
              <Text className="text-white text-sm font-['SFProDisplayRegular']">Чистый капитал</Text>
              <View className="flex-row items-center">
                <Text className="text-white text-sm font-['SFProDisplayRegular'] mr-2">74 500 000 ₸</Text>
                
              </View>
            </View>
          </View>
        </View>

        {/* ============== ПОДУШКА БЕЗОПАСНОСТИ ============== */}
        <View className="mb-6">
          <Text className="text-gray-400 text-sm font-['SFProDisplayRegular'] mb-3">
            Подушка безопасности на 3 месяца
          </Text>
          <View className="flex-row justify-between items-center p-3 rounded-xl bg-white/10">
            <Text className="text-white text-sm font-['SFProDisplayRegular']">По постоянному расходу</Text>
            <TextInput
              value={personalFinancialPlan?.securityPillow || ''}
              onChangeText={updateSecurityPillow}  
              className="text-white text-sm font-['SFProDisplayRegular'] bg-transparent text-right min-w-[100px]"
              placeholder="1 000 000 ₸"
              placeholderTextColor="#666"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* ============== СТРАХОВАЯ ЗАЩИТА ============== */}
        <View className="mb-6">
          <Text className="text-gray-400 text-sm font-['SFProDisplayRegular'] mb-3">
            Страховая защита
          </Text>
          
          <View className="space-y-3 p-3 rounded-xl bg-white/10">
            {/* Страхование жизни */}
            <View className="flex-row justify-between items-center">
              <Text className="text-white text-sm font-['SFProDisplayRegular']">Уход из жизни</Text>
              <TextInput
                value={personalFinancialPlan?.insurance.life || ''}
                onChangeText={updateLifeInsurance}  
                className="text-white text-sm font-['SFProDisplayRegular'] bg-transparent text-right min-w-[100px]"
                placeholder="500 000 ₸"
                placeholderTextColor="#666"
                keyboardType="numeric"
              />
            </View>
            
            {/* Страхование от инвалидности */}
            <View className="flex-row justify-between items-center">
              <Text className="text-white text-sm font-['SFProDisplayRegular']">Инвалидность</Text>
              <TextInput
                value={personalFinancialPlan?.insurance.disability || ''}
                onChangeText={updateDisabilityInsurance} 
                className="text-white text-sm font-['SFProDisplayRegular'] bg-transparent text-right min-w-[100px]"
                placeholder="600 000 ₸"
                placeholderTextColor="#666"
                keyboardType="numeric"
              />
            </View>
            
            {/* Медицинское страхование */}
            <View className="flex-row justify-between items-center">
              <Text className="text-white text-sm font-['SFProDisplayRegular']">Болезненный лист</Text>
              <TextInput
                value={personalFinancialPlan?.insurance.medical || ''}
                onChangeText={updateMedicalInsurance}  
                className="text-white text-sm font-['SFProDisplayRegular'] bg-transparent text-right min-w-[100px]"
                placeholder="600 000 ₸"
                placeholderTextColor="#666"
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* ============== РИСК-ПРОФИЛЬ ============== */}
        <View className="mb-6">
          <Text className="text-gray-400 text-sm font-['SFProDisplayRegular'] mb-3">
            Риск-профиль
          </Text>
          {/* Вызывает handleRiskProfile через Drawer */}
          <DropdownButton 
            value={personalFinancialPlan?.riskProfile || 'Агрессивный'} 
            onPress={() => setShowRiskProfile(true)} 
          />
        </View>

        {/* Goals */}
        <View className="mb-6">
          <Text className="text-white text-base font-['SFProDisplaySemiBold'] mb-4">
            Цели
          </Text>
          
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </View>

        {/* Drawer для выбора дня - onSelect вызывает handleSortSelectDay */}
        <Drawer 
          title='День'
          visible={showDrawerDay}
          onClose={() => setShowDrawerDay(false)}
          onSelect={handleSortSelectDay}  
          selectedValue={personalFinancialPlan?.birthDate.day || 'День'}
          options={days}
          animationType='fade'
        />

        {/* Drawer для выбора месяца - onSelect вызывает handleSortSelectMonth */}
        <Drawer 
          title='Месяц'
          visible={showDrawerMonth}
          onClose={() => setShowDrawerMonth(false)}
          onSelect={handleSortSelectMonth}  
          selectedValue={personalFinancialPlan?.birthDate.month || 'Месяц'}
          options={months}
          animationType='fade'
        />

        {/* Drawer для выбора года - onSelect вызывает handleSortSelectYear */}
        <Drawer 
          title='Год'
          visible={showDrawerYear}
          onClose={() => setShowDrawerYear(false)}
          onSelect={handleSortSelectYear} 
          selectedValue={personalFinancialPlan?.birthDate.year || 'Год'}
          options={years}
          animationType='fade'
        />

        {/* Drawer для выбора риск-профиля - onSelect вызывает handleRiskProfile */}
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