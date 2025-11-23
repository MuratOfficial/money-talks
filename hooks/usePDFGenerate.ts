
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import useFinancialStore, { appStore, Asset, Goal, PersonalFinancialPlan } from './useStore';

interface PDFGeneratorOptions {
  personalFinancialPlan: PersonalFinancialPlan;
  currency?: string;
  language?: 'ru' | 'en' | 'kz';
  onStatusChange?: (status: 'generating' | 'sharing' | 'success' | 'error') => void;
  onProgressChange?: (progress: number) => void;
  onMessageChange?: (message: string) => void;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const formatDate = (birthDate: { day: string; month: string; year: string }): string => {
  return `${birthDate.day}.${birthDate.month}.${birthDate.year}`;
};

const generateLFPHtmlContent = (plan: PersonalFinancialPlan, options: PDFGeneratorOptions): string => {
  const { language = 'ru' } = options;
  
  const translations = {
    ru: {
      title: 'ГОРИЗОНТ ПЛАНИРОВАНИЯ',
      client: 'Клиент',
      birthDate: 'Дата рождения',
      fullName: 'ФИО',
      city: 'Город',
      citizenship: 'Гражданство',
      residence: 'Резиденство',
      activity: 'Деятельность',
      financialDependents: 'Финансово-зависимые люди',
      riskProfile: 'Риск-профиль',
      securityPillow: 'Подушка безопасности',
      insurance: 'Страхование',
      lifeInsurance: 'Страхование жизни',
      disabilityInsurance: 'Страхование от нетрудоспособности',
      medicalInsurance: 'Медицинское страхование',
      createdDate: 'Дата создания',
      updatedDate: 'Дата обновления'
    },
    en: {
      title: 'PLANNING HORIZON',
      client: 'Client',
      birthDate: 'Date of Birth',
      fullName: 'Full Name',
      city: 'City',
      citizenship: 'Citizenship',
      residence: 'Residence',
      activity: 'Activity',
      financialDependents: 'Financial Dependents',
      riskProfile: 'Risk Profile',
      securityPillow: 'Security Pillow',
      insurance: 'Insurance',
      lifeInsurance: 'Life Insurance',
      disabilityInsurance: 'Disability Insurance',
      medicalInsurance: 'Medical Insurance',
      createdDate: 'Created Date',
      updatedDate: 'Updated Date'
    },
    kz: {
      title: 'ЖОСПАРЛАУ КӨКЖИЕГІ',
      client: 'Клиент',
      birthDate: 'Туған күні',
      fullName: 'Толық аты-жөні',
      city: 'Қала',
      citizenship: 'Азаматтық',
      residence: 'Резиденттік',
      activity: 'Қызмет',
      financialDependents: 'Қаржылай тәуелді адамдар',
      riskProfile: 'Тәуекел-профилі',
      securityPillow: 'Қауіпсіздік жастығы',
      insurance: 'Сақтандыру',
      lifeInsurance: 'Өмір сақтандыруы',
      disabilityInsurance: 'Еңбекке жарамсыздықтан сақтандыру',
      medicalInsurance: 'Медициналық сақтандыру',
      createdDate: 'Жасалған күні',
      updatedDate: 'Жаңартылған күні'
    }
  };

  

  const storeState = appStore.getState();
    const {
      goals,
      incomes,
      actives,
      passives,
      currency: appCurrency,
      user
    } = storeState;



interface CalculatorData {
  requiredReturn: {
    startCapital: number;
    targetCapital: number;
    years: number;
    result: string;
  };
  capitalGrowth: {
    startCapital: number;
    annualReturn: number;
    years: number;
    result: number;
  };
  capitalWithDeposits: Array<{
    startCapital: number;
    monthlyDeposit: number;
    annualReturn: number;
    years: number;
    result: number;
  }>;
  monthlyInvestmentNeeded: {
    targetCapital: number;
    startCapital: number;
    annualReturn: number;
    years: number;
    result: number;
  };
}

// 1. Расчет требуемой доходности
const calculateRequiredReturn = (startCapital: number, targetCapital: number, years: number): string => {
  if (years === 0 || startCapital === 0) return '0.00';
  return ((Math.pow(targetCapital / startCapital, 1 / years) - 1) * 100).toFixed(2);
};

// 2. Расчет роста начального капитала
const calculateCapitalGrowth = (startCapital: number, annualReturn: number, years: number): number => {
  return Math.round(startCapital * Math.pow(1 + annualReturn / 100, years));
};

// 3. Расчет роста капитала с ежемесячными пополнениями
const calculateCapitalWithDeposits = (
  startCapital: number, 
  monthlyDeposit: number, 
  annualReturn: number, 
  years: number
): number => {
  const monthlyRate = annualReturn / 100 / 12;
  const months = years * 12;
  
  // Рост начального капитала
  const futureValueStart = startCapital * Math.pow(1 + monthlyRate, months);
  
  // Рост ежемесячных пополнений (аннуитет)
  if (monthlyRate === 0) {
    // Если доходность 0%, то просто сумма
    return Math.round(futureValueStart + monthlyDeposit * months);
  }
  
  const futureValueDeposits = monthlyDeposit * 
    ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
  
  return Math.round(futureValueStart + futureValueDeposits);
};

// 4. Расчет требуемого ежемесячного инвестирования
const calculateMonthlyInvestment = (
  targetCapital: number, 
  startCapital: number, 
  annualReturn: number, 
  years: number
): number => {
  const monthlyRate = annualReturn / 100 / 12;
  const months = years * 12;
  
  // Будущая стоимость начального капитала
  const futureValueStart = startCapital * Math.pow(1 + monthlyRate, months);
  
  // Оставшаяся сумма, которую нужно набрать ежемесячными взносами
  const remainingAmount = targetCapital - futureValueStart;
  
  if (remainingAmount <= 0) return 0;
  
  if (monthlyRate === 0) {
    // Если доходность 0%, то просто делим на количество месяцев
    return Math.round(remainingAmount / months);
  }
  
  // Требуемый ежемесячный взнос
  const monthlyPayment = remainingAmount / 
    ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
  
  return Math.round(monthlyPayment);
};

// Вспомогательные функции для работы с целями
const calculateYearsLeft = (timeframe: { day: string; month: string; year: string }): number => {
  const targetDate = new Date(parseInt(timeframe.year), parseInt(timeframe.month) - 1);
  const currentDate = new Date();
  return Math.max(1, targetDate.getFullYear() - currentDate.getFullYear());
};

const getCurrencySymbol = (currency: string): string => {
  if (currency === 'USD' || currency === '$') return '$';
  return '₸';
};

// Генерация данных для калькуляторов на основе целей пользователя
const generateCalculatorData = (
  goals: Goal[], 
  actives: Asset[], 
  totalActives: number
): CalculatorData => {
  const longTermGoals = goals.filter(g => g.type === 'long');
  const mediumTermGoals = goals.filter(g => g.type === 'medium');
  
  // Пример расчета для первой долгосрочной цели
  const firstLongTermGoal = longTermGoals[0];
  const targetCapital = firstLongTermGoal ? parseFloat(firstLongTermGoal.amount) || 100000 : 100000;
  const startCapital = totalActives > 0 ? totalActives * 0.1 : 10000;
  const years = firstLongTermGoal ? calculateYearsLeft(firstLongTermGoal.timeframe) : 10;
  
  return {
    requiredReturn: {
      startCapital,
      targetCapital,
      years,
      result: calculateRequiredReturn(startCapital, targetCapital, years)
    },
    
    capitalGrowth: {
      startCapital: totalActives > 0 ? totalActives * 0.3 : 100000,
      annualReturn: 10,
      years: 10,
      result: calculateCapitalGrowth(totalActives > 0 ? totalActives * 0.3 : 100000, 10, 10)
    },
    
    capitalWithDeposits: [...mediumTermGoals, ...longTermGoals].slice(0, 3).map(goal => {
      const yearsLeft = calculateYearsLeft(goal.timeframe);
      const monthlyInvestment = parseFloat(goal.monthlyInvestment) || 500;
      const startCapital = (goal.collected && parseFloat(goal.collected)) || 6000;
      const annualReturn = parseFloat(goal.returnRate) || 10;
      
      return {
        startCapital,
        monthlyDeposit: monthlyInvestment,
        annualReturn,
        years: yearsLeft,
        result: calculateCapitalWithDeposits(startCapital, monthlyInvestment, annualReturn, yearsLeft)
      };
    }),
    
    monthlyInvestmentNeeded: {
      targetCapital: mediumTermGoals[0] ? parseFloat(mediumTermGoals[0].amount) || 35000 : 35000,
      startCapital: 500,
      annualReturn: 10,
      years: mediumTermGoals[0] ? calculateYearsLeft(mediumTermGoals[0].timeframe) : 5,
      result: calculateMonthlyInvestment(
        mediumTermGoals[0] ? parseFloat(mediumTermGoals[0].amount) || 35000 : 35000,
        500,
        10,
        mediumTermGoals[0] ? calculateYearsLeft(mediumTermGoals[0].timeframe) : 5
      )
    }
  };
};
    

  // Функция для получения процентного соотношения валют
const getCurrencyRatio = (goalCurrency:string) => {
  if (goalCurrency === 'KZT' || goalCurrency === '₸') return { kzt: 1, usd: 0.0021 };
  if (goalCurrency === 'USD' || goalCurrency === '$') return { kzt: 470, usd: 1 };
  return { kzt: 1, usd: 0.0021 };
};

// Функция для форматирования суммы
const formatAmount = (amount:number, curr = appCurrency) => {
  return new Intl.NumberFormat('ru-RU').format(Math.round(amount)) + ' ' + curr;
};

// Группировка целей по типам (если переданы цели)
const shortTermGoals = goals?.filter(g => g.type === 'short') || [];
const mediumTermGoals = goals?.filter(g => g.type === 'medium') || [];
const longTermGoals = goals?.filter(g => g.type === 'long') || [];

// Расчет общих сумм для пассивного дохода (если переданы активы)
const totalIncomes = incomes?.reduce((sum, income) => sum + income.amount, 0) || 0;
const totalActives = actives?.reduce((sum, active) => sum + active.amount, 0) || 0;
const totalPassives = passives?.reduce((sum, passive) => sum + passive.amount, 0) || 0;



  const t = translations[language];

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${t.title}</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Arial', sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                padding: 20px;
                color: #333;
            }
            
            .container {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                border-radius: 15px;
                box-shadow: 0 15px 35px rgba(0,0,0,0.1);
                overflow: hidden;
            }
            
            .header {
                background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
                color: white;
                padding: 30px;
                text-align: center;
                position: relative;
            }
            
            .title {
                font-size: 28px;
                font-weight: bold;
                letter-spacing: 2px;
                position: relative;
                z-index: 1;
                text-shadow: 0 2px 4px rgba(0,0,0,0.3);
            }
            
            .content {
                padding: 40px;
            }
            
            .profile-section {
                display: flex;
                gap: 30px;
                margin-bottom: 40px;
            }
            
            .profile-info {
                flex: 1;
            }
            
            .profile-photo {
                width: 150px;
                height: 150px;
                border-radius: 50%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 48px;
                font-weight: bold;
                box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            }
            
            .info-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 30px;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            }
            
            .info-table th,
            .info-table td {
                padding: 15px 20px;
                text-align: left;
                border-bottom: 1px solid #e0e0e0;
            }
            
            .info-table th {
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                font-weight: 600;
                color: #495057;
                width: 40%;
            }
            
            .info-table td {
                background: white;
                color: #333;
            }
            
            .info-table tr:last-child th,
            .info-table tr:last-child td {
                border-bottom: none;
            }
            
            .section-title {
                font-size: 20px;
                color: #4CAF50;
                margin: 30px 0 15px 0;
                padding-bottom: 10px;
                border-bottom: 2px solid #4CAF50;
                font-weight: 600;
            }
            
            .insurance-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin-top: 20px;
            }
            
            .insurance-item {
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                padding: 20px;
                border-radius: 10px;
                border-left: 4px solid #4CAF50;
                box-shadow: 0 3px 10px rgba(0,0,0,0.1);
            }
            
            .insurance-item h4 {
                color: #4CAF50;
                margin-bottom: 8px;
                font-size: 16px;
            }
            
            .insurance-item p {
                color: #666;
                font-size: 14px;
            }
            
            .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 2px solid #e0e0e0;
                text-align: center;
                color: #666;
                font-size: 12px;
            }
            
            .highlight {
                background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
                padding: 3px 8px;
                border-radius: 4px;
                font-weight: 600;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="title">${t.title}</div>
            </div>
            
            <div class="content">
                <div class="profile-section">
                    <div class="profile-info">
                        <table class="info-table">
                            <tr>
                                <th>${t.client}</th>
                                <td>Не указано</td>
                            </tr>
                            <tr>
                                <th>${t.birthDate}</th>
                                <td>${formatDate(plan.birthDate)}</td>
                            </tr>
                            <tr>
                                <th>${t.fullName}</th>
                                <td class="highlight">${plan.fio || user?.name}</td>
                            </tr>
                            <tr>
                                <th>${t.city}</th>
                                <td>Алматы</td>
                            </tr>
                            <tr>
                                <th>${t.citizenship}</th>
                                <td>Казахстан</td>
                            </tr>
                            <tr>
                                <th>${t.residence}</th>
                                <td>Казахстан</td>
                            </tr>
                            <tr>
                                <th>${t.activity}</th>
                                <td class="highlight">${plan.activity}</td>
                            </tr>
                            <tr>
                                <th>${t.financialDependents}</th>
                                <td class="highlight">${plan.financialDependents}</td>
                            </tr>
                            <tr>
                                <th>${t.riskProfile}</th>
                                <td class="highlight">${plan.riskProfile}</td>
                            </tr>
                        </table>
                    </div>
                    
                    <div class="profile-photo">
                        ${plan.fio.charAt(0).toUpperCase()}
                    </div>
                </div>
                
                <div class="section-title">${t.securityPillow}</div>
                <div style="background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); padding: 20px; border-radius: 10px; border-left: 4px solid #2196F3;">
                    <p style="font-size: 16px; color: #1976D2; font-weight: 600;">${plan.securityPillow}</p>
                </div>
                
                <div class="section-title">${t.insurance}</div>
                <div class="insurance-grid">
                    <div class="insurance-item">
                        <h4>${t.lifeInsurance}</h4>
                        <p>${plan.insurance.life}</p>
                    </div>
                    <div class="insurance-item">
                        <h4>${t.disabilityInsurance}</h4>
                        <p>${plan.insurance.disability}</p>
                    </div>
                    <div class="insurance-item">
                        <h4>${t.medicalInsurance}</h4>
                        <p>${plan.insurance.medical}</p>
                    </div>
                </div>
                <!-- ДОБАВИТЬ ЭТОТ КОД ПЕРЕД ЗАКРЫВАЮЩИМ </div> контейнера content -->

<!-- БЛОК РАСЧЕТА КАПИТАЛА И ИНВЕСТИРОВАНИЯ -->
<div style="page-break-before: always; margin-top: 60px;">
    <div class="section-title" style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: white; padding: 15px 25px; margin: 0 -40px 30px -40px; text-align: center; font-size: 22px;">
        РАСЧЕТ КАПИТАЛА И ЕЖЕМЕСЯЧНОГО ИНВЕСТИРОВАНИЯ
    </div>

    <!-- БЛОК 1: ПАССИВНЫЙ ДОХОД -->
    <div style="margin-bottom: 40px;">
        <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 12px 20px; margin-bottom: 15px; border-radius: 8px; font-weight: bold;">
            БЛОК 1 - ПАССИВНЫЙ ДОХОД
        </div>
        
        <div style="background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 10px; overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: linear-gradient(135deg, #475569 0%, #64748b 100%); color: white;">
                        <th style="padding: 12px; text-align: left; border-right: 1px solid rgba(255,255,255,0.2);">Первоначальная Инвестиция</th>
                        <th style="padding: 12px; text-align: center; border-right: 1px solid rgba(255,255,255,0.2);">В основной валюте</th>
                        <th style="padding: 12px; text-align: center;">В конвертируемой валюте</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="background: #fef3c7;">
                        <td style="padding: 15px; font-weight: 600; border-right: 1px solid #e5e7eb;">Основной</td>
                        <td style="padding: 15px; text-align: center; border-right: 1px solid #e5e7eb;">
                            ${formatAmount(totalActives * 0.3)}
                        </td>
                        <td style="padding: 15px; text-align: center;">
                            ${formatAmount(totalActives * 0.3 * 0.0021, '$')}
                        </td>
                    </tr>
                    <tr style="background: #fde68a;">
                        <td style="padding: 15px; font-weight: 600; border-right: 1px solid #e5e7eb;">Минимальный</td>
                        <td style="padding: 15px; text-align: center; border-right: 1px solid #e5e7eb;">
                            ${formatAmount(totalActives * 0.2)}
                        </td>
                        <td style="padding: 15px; text-align: center;">
                            ${formatAmount(totalActives * 0.2 * 0.0021, '$')}
                        </td>
                    </tr>
                    <tr style="background: #fed7aa;">
                        <td style="padding: 15px; font-weight: 600; border-right: 1px solid #e5e7eb;">Амбициозный</td>
                        <td style="padding: 15px; text-align: center; border-right: 1px solid #e5e7eb;">
                            ${formatAmount(totalActives * 0.4)}
                        </td>
                        <td style="padding: 15px; text-align: center;">
                            ${formatAmount(totalActives * 0.4 * 0.0021, '$')}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <div style="margin-top: 15px; display: flex; justify-content: space-between; font-size: 12px; color: #64748b;">
            <div>
                <p><em>*Е/И</em> - Ежемесячное инвестирование</p>
                <p>Средняя доходность капитала для <strong>Пассивного Дохода</strong>: <span style="color: #dc2626; font-weight: bold;">5,00%</span></p>
            </div>
            <div style="text-align: right;">
                <p>Средняя доходность в валюте: <span style="color: #dc2626; font-weight: bold;">10,00%</span></p>
                <p>Средняя инфляция в валюте: <span style="color: #dc2626; font-weight: bold;">3,00%</span></p>
            </div>
        </div>
    </div>

    <!-- БЛОК 2: ДОЛГОСРОЧНЫЕ ЦЕЛИ (условно показывается если есть долгосрочные цели) -->
    <div style="margin-bottom: 40px;">
        <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; padding: 12px 20px; margin-bottom: 15px; border-radius: 8px; font-weight: bold;">
            БЛОК 2 - ДОЛГОСРОЧНЫЕ ЦЕЛИ (БОЛЕЕ 5 ЛЕТ)
        </div>
        
        <div style="background: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 10px; overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: linear-gradient(135deg, #166534 0%, #22c55e 100%); color: white; font-size: 11px;">
                        <th style="padding: 8px 4px; text-align: center;">№</th>
                        <th style="padding: 8px; text-align: left;">Название цели</th>
                        <th style="padding: 8px; text-align: center;">Оценка цели</th>
                        <th style="padding: 8px; text-align: center;">Валюта</th>
                        <th style="padding: 8px; text-align: center;">Дата</th>
                        <th style="padding: 8px; text-align: center;">Доходность</th>
                        <th style="padding: 8px; text-align: center;">Инфляция</th>
                        <th style="padding: 8px; text-align: center;">Осталось лет</th>
                        <th style="padding: 8px; text-align: center;">Е/И с учетом имеющихся накоплений</th>
                        <th style="padding: 8px; text-align: center;">В основной валюте</th>
                        <th style="padding: 8px; text-align: center;">В конвертируемой валюте</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- Здесь будет цикл по долгосрочным целям -->
                    // <tr style="background: #f0fdf4;">
                    //     <td style="padding: 12px 8px; text-align: center; font-weight: bold;">1</td>
                    //     <td style="padding: 12px; font-weight: 600; color: #166534;">Образование сына Асана</td>
                    //     <td style="padding: 12px; text-align: center;">45 000 $</td>
                    //     <td style="padding: 12px; text-align: center;">USD</td>
                    //     <td style="padding: 12px; text-align: center; font-size: 11px;">01.09.2029</td>
                    //     <td style="padding: 12px; text-align: center;">10%</td>
                    //     <td style="padding: 12px; text-align: center;">3,00%</td>
                    //     <td style="padding: 12px; text-align: center; font-weight: bold;">9</td>
                    //     <td style="padding: 12px; text-align: center; background: #fef3c7; font-weight: bold;">500 $</td>
                    //     <td style="padding: 12px; text-align: center;">270 765 ₸</td>
                    //     <td style="padding: 12px; text-align: center;">500 $</td>
                    // </tr>
                    <!-- Дополнительные строки для других долгосрочных целей -->
                </tbody>
            </table>
            
            <div style="background: #fbbf24; padding: 12px; text-align: center; font-weight: bold; color: #92400e;">
                ИТОГО: 270 765 ₸ | 500 $
            </div>
        </div>
    </div>

    <!-- БЛОК 3: СРЕДНЕСРОЧНЫЕ ЦЕЛИ (условно показывается если есть среднесрочные цели) -->
    <div style="margin-bottom: 40px;">
        <div style="background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); color: white; padding: 12px 20px; margin-bottom: 15px; border-radius: 8px; font-weight: bold;">
            БЛОК 3 - СРЕДНЕСРОЧНЫЕ ЦЕЛИ (ОТ 1 ДО 5 ЛЕТ)
        </div>
        
        <div style="background: #fefce8; border: 2px solid #fed7aa; border-radius: 10px; overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: linear-gradient(135deg, #c2410c 0%, #ea580c 100%); color: white; font-size: 11px;">
                        <th style="padding: 8px 4px; text-align: center;">№</th>
                        <th style="padding: 8px; text-align: left;">Название цели</th>
                        <th style="padding: 8px; text-align: center;">Оценка цели</th>
                        <th style="padding: 8px; text-align: center;">Валюта</th>
                        <th style="padding: 8px; text-align: center;">Дата</th>
                        <th style="padding: 8px; text-align: center;">Доходность</th>
                        <th style="padding: 8px; text-align: center;">Инфляция</th>
                        <th style="padding: 8px; text-align: center;">Осталось лет</th>
                        <th style="padding: 8px; text-align: center;">Е/И с учетом имеющихся накоплений</th>
                        <th style="padding: 8px; text-align: center;">В основной валюте</th>
                        <th style="padding: 8px; text-align: center;">В конвертируемой валюте</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- Здесь будет цикл по среднесрочным целям -->
                    <tr style="background: #fefce8;">
                        // <td style="padding: 12px 8px; text-align: center; font-weight: bold;">1</td>
                        // <td style="padding: 12px; font-weight: 600; color: #c2410c;">Образование Адели</td>
                        // <td style="padding: 12px; text-align: center;">35 000 $</td>
                        // <td style="padding: 12px; text-align: center;">USD</td>
                        // <td style="padding: 12px; text-align: center; font-size: 11px;">01.09.2026</td>
                        // <td style="padding: 12px; text-align: center;">10,00%</td>
                        // <td style="padding: 12px; text-align: center;">3,00%</td>
                        // <td style="padding: 12px; text-align: center; font-weight: bold;">5</td>
                        // <td style="padding: 12px; text-align: center; background: #fef3c7; font-weight: bold;">488 $</td>
                        // <td style="padding: 12px; text-align: center;">264 004 ₸</td>
                        // <td style="padding: 12px; text-align: center;">488 $</td>
                    </tr>
                    <tr style="background: #fef3c7;">
                        // <td style="padding: 12px 8px; text-align: center; font-weight: bold;">2</td>
                        // <td style="padding: 12px; font-weight: 600; color: #c2410c;">Образование Адия</td>
                        // <td style="padding: 12px; text-align: center;">10 000 $</td>
                        // <td style="padding: 12px; text-align: center;">USD</td>
                        // <td style="padding: 12px; text-align: center; font-size: 11px;">01.01.2026</td>
                        // <td style="padding: 12px; text-align: center;">10,00%</td>
                        // <td style="padding: 12px; text-align: center;">3,00%</td>
                        // <td style="padding: 12px; text-align: center; font-weight: bold;">2</td>
                        // <td style="padding: 12px; text-align: center; background: #fef3c7; font-weight: bold;">493 $</td>
                        // <td style="padding: 12px; text-align: center;">267 169 ₸</td>
                        // <td style="padding: 12px; text-align: center;">493 $</td>
                    </tr>
                </tbody>
            </table>
            
            <div style="background: #fbbf24; padding: 12px; text-align: center; font-weight: bold; color: #92400e;">
                ИТОГО: 531 173 ₸ | 981 $
            </div>
        </div>
    </div>

    <!-- ИТОГОВЫЙ БЛОК -->
    <div style="margin-top: 30px; background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white; padding: 20px; border-radius: 12px; text-align: center;">
        <h3 style="margin: 0 0 15px 0; font-size: 18px;">ОБЩИЙ ЕЖЕМЕСЯЧНЫЙ ПЛАН ИНВЕСТИРОВАНИЯ</h3>
        <div style="display: flex; justify-content: space-around; font-size: 16px; font-weight: bold;">
            <div>
                <div>В тенге:</div>
                <div style="font-size: 20px; margin-top: 5px;">801 938 ₸</div>
            </div>
            <div>
                <div>В долларах:</div>
                <div style="font-size: 20px; margin-top: 5px;">1 481 $</div>
            </div>
        </div>
    </div>
</div>
                
                <div class="footer">
                    <p><strong>${t.createdDate}:</strong> ${plan.createdAt}</p>
                    <p><strong>${t.updatedDate}:</strong> ${plan.updatedAt}</p>
                    <p style="margin-top: 10px; font-style: italic;">Создано с помощью приложения Личный Финансовый Планировщик</p>
                </div>
            </div>
        </div>

${longTermGoals.length > 0 ? `
<div style="margin-bottom: 40px;">
    <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; padding: 12px 20px; margin-bottom: 15px; border-radius: 8px; font-weight: bold;">
        БЛОК 2 - ДОЛГОСРОЧНЫЕ ЦЕЛИ (БОЛЕЕ 5 ЛЕТ)
    </div>
    
    <div style="background: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 10px; overflow: hidden;">
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <!-- заголовки таблицы -->
            </thead>
            <tbody>
                ${longTermGoals.map((goal, index) => {
                    const yearsLeft = calculateYearsLeft(goal.timeframe);
                    const monthlyInvestment = parseFloat(goal.monthlyInvestment) || 0;
                    const ratios = getCurrencyRatio(goal.currency);
                    
                    return `
                    <tr style="background: ${index % 2 === 0 ? '#f0fdf4' : '#dcfce7'};">
                        <td style="padding: 12px 8px; text-align: center; font-weight: bold;">${index + 1}</td>
                        <td style="padding: 12px; font-weight: 600; color: #166534;">${goal.name}</td>
                        <td style="padding: 12px; text-align: center;">${formatAmount(parseFloat(goal.amount))}</td>
                        <td style="padding: 12px; text-align: center;">${goal.currency === 'USD' ? '$' : '₸'}</td>
                        <td style="padding: 12px; text-align: center; font-size: 11px;">${goal.timeframe.day}.${goal.timeframe.month}.${goal.timeframe.year}</td>
                        <td style="padding: 12px; text-align: center;">${goal.returnRate}%</td>
                        <td style="padding: 12px; text-align: center;">${goal.inflationRate}%</td>
                        <td style="padding: 12px; text-align: center; font-weight: bold;">${yearsLeft}</td>
                        <td style="padding: 12px; text-align: center; background: #fef3c7; font-weight: bold;">${formatAmount(monthlyInvestment, goal.currency === 'USD' ? '$' : '₸')}</td>
                        <td style="padding: 12px; text-align: center;">${formatAmount(monthlyInvestment * ratios.kzt, '₸')}</td>
                        <td style="padding: 12px; text-align: center;">${formatAmount(monthlyInvestment * ratios.usd, '$')}</td>
                    </tr>`;
                }).join('')}
            </tbody>
        </table>
        
        <div style="background: #fbbf24; padding: 12px; text-align: center; font-weight: bold; color: #92400e;">
            ИТОГО: ${formatAmount(longTermGoals.reduce((sum, goal) => {
                const ratios = getCurrencyRatio(goal.currency);
                return sum + (parseFloat(goal.monthlyInvestment) || 0) * ratios.kzt;
            }, 0), '₸')} | ${formatAmount(longTermGoals.reduce((sum, goal) => {
                const ratios = getCurrencyRatio(goal.currency);
                return sum + (parseFloat(goal.monthlyInvestment) || 0) * ratios.usd;
            }, 0), '$')}
        </div>
    </div>
</div>
` : ''}

${mediumTermGoals.length > 0 ? `
<div style="margin-bottom: 40px;">
    <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; padding: 12px 20px; margin-bottom: 15px; border-radius: 8px; font-weight: bold;">
        БЛОК 2 - ДОЛГОСРОЧНЫЕ ЦЕЛИ (БОЛЕЕ 5 ЛЕТ)
    </div>
    
    <div style="background: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 10px; overflow: hidden;">
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
            </thead>
            <tbody>
                ${mediumTermGoals.map((goal, index) => {
                    const yearsLeft = calculateYearsLeft(goal.timeframe);
                    const monthlyInvestment = parseFloat(goal.monthlyInvestment) || 0;
                    const ratios = getCurrencyRatio(goal.currency);
                    
                    return `
                    <tr style="background: ${index % 2 === 0 ? '#f0fdf4' : '#dcfce7'};">
                        <td style="padding: 12px 8px; text-align: center; font-weight: bold;">${index + 1}</td>
                        <td style="padding: 12px; font-weight: 600; color: #166534;">${goal.name}</td>
                        <td style="padding: 12px; text-align: center;">${formatAmount(parseFloat(goal.amount))}</td>
                        <td style="padding: 12px; text-align: center;">${goal.currency === 'USD' ? '$' : '₸'}</td>
                        <td style="padding: 12px; text-align: center; font-size: 11px;">${goal.timeframe.day}.${goal.timeframe.month}.${goal.timeframe.year}</td>
                        <td style="padding: 12px; text-align: center;">${goal.returnRate}%</td>
                        <td style="padding: 12px; text-align: center;">${goal.inflationRate}%</td>
                        <td style="padding: 12px; text-align: center; font-weight: bold;">${yearsLeft}</td>
                        <td style="padding: 12px; text-align: center; background: #fef3c7; font-weight: bold;">${formatAmount(monthlyInvestment, goal.currency === 'USD' ? '$' : '₸')}</td>
                        <td style="padding: 12px; text-align: center;">${formatAmount(monthlyInvestment * ratios.kzt, '₸')}</td>
                        <td style="padding: 12px; text-align: center;">${formatAmount(monthlyInvestment * ratios.usd, '$')}</td>
                    </tr>`;
                }).join('')}
            </tbody>
        </table>
        
        <div style="background: #fbbf24; padding: 12px; text-align: center; font-weight: bold; color: #92400e;">
            ИТОГО: ${formatAmount(mediumTermGoals.reduce((sum, goal) => {
                const ratios = getCurrencyRatio(goal.currency);
                return sum + (parseFloat(goal.monthlyInvestment) || 0) * ratios.kzt;
            }, 0), '₸')} | ${formatAmount(mediumTermGoals.reduce((sum, goal) => {
                const ratios = getCurrencyRatio(goal.currency);
                return sum + (parseFloat(goal.monthlyInvestment) || 0) * ratios.usd;
            }, 0), '$')}
        </div>
    </div>
</div>
` : ''}

<!-- ДИНАМИЧЕСКАЯ СЕКЦИЯ КАЛЬКУЛЯТОРОВ - ЗАМЕНИТЬ СТАТИЧЕСКУЮ ВЕРСИЮ -->

${goals.length > 0 || actives.length > 0 ? `
<div style="page-break-before: always; margin-top: 60px;">
    <div class="section-title" style="background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%); color: white; padding: 15px 25px; margin: 0 -40px 30px -40px; text-align: center; font-size: 22px;">
        КАЛЬКУЛЯТОРЫ
    </div>

    <!-- РАСЧЕТ ТРЕБУЕМОЙ ДОХОДНОСТИ -->
    ${longTermGoals.length > 0 ? `
    <div style="margin-bottom: 30px;">
        <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 8px 15px; margin-bottom: 10px; border-radius: 6px; font-weight: bold; font-size: 14px;">
            РАСЧЕТ ТРЕБУЕМОЙ ДОХОДНОСТИ
        </div>
        
        <div style="background: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 8px; overflow: hidden;">
             <table style="width: 100%; border-collapse: collapse;">    
            <thead>
                    <tr style="background: linear-gradient(135deg, #991b1b 0%, #dc2626 100%); color: white; font-size: 11px;">
                        <th style="padding: 6px; text-align: center; border-right: 1px solid rgba(255,255,255,0.2);">Смартовое вложение и ежемесячное пополнение</th>
                        <th style="padding: 6px; text-align: center; border-right: 1px solid rgba(255,255,255,0.2);">Целевой капитал</th>
                        <th style="padding: 6px; text-align: center; border-right: 1px solid rgba(255,255,255,0.2);">Стартовый капитал</th>
                        <th style="padding: 6px; text-align: center; border-right: 1px solid rgba(255,255,255,0.2);">Доходность</th>
                        <th style="padding: 6px; text-align: center; border-right: 1px solid rgba(255,255,255,0.2);">Срок, лет</th>
                        <th style="padding: 6px; text-align: center;">Ежемесячная инвестиция</th>
                    </tr>
                </thead>
                <tbody>
                    ${mediumTermGoals.map((goal, index) => {
                        const yearsLeft = calculateYearsLeft(goal.timeframe);
                        const targetAmount = parseFloat(goal.amount) || 0;
                        const startCapital = (goal.collected && parseFloat(goal.collected)) || 500;
                        const annualReturn = parseFloat(goal.returnRate) || 10;
                        const monthlyInvestmentNeeded = calculateMonthlyInvestment(targetAmount, startCapital, annualReturn, yearsLeft);
                        
                        return `
                        <tr style="background: ${index % 2 === 0 ? '#fef2f2' : '#fee2e2'};">
                            <td style="padding: 10px; text-align: center; color: #991b1b; font-weight: 600; font-size: 12px;">${goal.name}</td>
                            <td style="padding: 10px; text-align: center; font-size: 12px;">${formatAmount(targetAmount, goal.currency === 'USD' ? '$':'₸')}
                <thead>
                    <tr style="background: linear-gradient(135deg, #166534 0%, #22c55e 100%); color: white; font-size: 12px;">
                        <th style="padding: 8px; text-align: center; border-right: 1px solid rgba(255,255,255,0.2);">Единоразовое вложение с капитализацией</th>
                        <th style="padding: 8px; text-align: center; border-right: 1px solid rgba(255,255,255,0.2);">Стартовый капитал</th>
                        <th style="padding: 8px; text-align: center; border-right: 1px solid rgba(255,255,255,0.2);">Целевой капитал</th>
                        <th style="padding: 8px; text-align: center; border-right: 1px solid rgba(255,255,255,0.2);">Срок, лет</th>
                        <th style="padding: 8px; text-align: center;">Требуемая доходность, %</th>
                    </tr>
                </thead>
                <tbody>`})}
                    ${longTermGoals.map((goal, index) => {
                        const yearsLeft = calculateYearsLeft(goal.timeframe);
                        const targetAmount = parseFloat(goal.amount) || 0;
                        const startCapital = (goal.collected && parseFloat(goal.collected)) || (totalActives * 0.1) || 10000;
                        const requiredReturn = calculateRequiredReturn(startCapital, targetAmount, yearsLeft);
                        
                        return `
                        <tr style="background: ${index % 2 === 0 ? '#f0fdf4' : '#dcfce7'};">
                            <td style="padding: 12px; text-align: center; color: #166534; font-weight: 600;">${goal.name}</td>
                            <td style="padding: 12px; text-align: center;">${formatAmount(startCapital)}</td>
                            <td style="padding: 12px; text-align: center;">${formatAmount(targetAmount)}</td>
                            <td style="padding: 12px; text-align: center;">${yearsLeft}</td>
                            <td style="padding: 12px; text-align: center; background: #fef3c7; font-weight: bold;">${requiredReturn}%</td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
        </div>
    </div>`:''}
    

    ${totalActives > 0 ? `
    <div style="margin-bottom: 30px;">
        <div style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: white; padding: 8px 15px; margin-bottom: 10px; border-radius: 6px; font-weight: bold; font-size: 14px;">
            РАСЧЕТ РОСТА НАЧАЛЬНОГО КАПИТАЛА
        </div>
        
        <div style="background: #fefce8; border: 2px solid #fed7aa; border-radius: 8px; overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: linear-gradient(135deg, #c2410c 0%, #ea580c 100%); color: white; font-size: 12px;">
                        <th style="padding: 8px; text-align: center; border-right: 1px solid rgba(255,255,255,0.2);">Единоразовое вложение с капитализацией</th>
                        <th style="padding: 8px; text-align: center; border-right: 1px solid rgba(255,255,255,0.2);">Стартовый капитал</th>
                        <th style="padding: 8px; text-align: center; border-right: 1px solid rgba(255,255,255,0.2);">Доходность</th>
                        <th style="padding: 8px; text-align: center; border-right: 1px solid rgba(255,255,255,0.2);">Срок, лет</th>
                        <th style="padding: 8px; text-align: center;">Итоговая сумма</th>
                    </tr>
                </thead>
                <tbody>
                    ${[5, 10, 15, 20].map((years, index) => {
                        const startCapital = totalActives * 0.3;
                        const annualReturn = 10; // Можно взять из настроек пользователя
                        const finalAmount = calculateCapitalGrowth(startCapital, annualReturn, years);
                        
                        return `
                        <tr style="background: ${index % 2 === 0 ? '#fefce8' : '#fef3c7'};">
                            <td style="padding: 12px; text-align: center; color: #c2410c; font-weight: 600;">Основной сценарий (${years} лет)</td>
                            <td style="padding: 12px; text-align: center;">${formatAmount(startCapital)}</td>
                            <td style="padding: 12px; text-align: center;">${annualReturn}%</td>
                            <td style="padding: 12px; text-align: center;">${years}</td>
                            <td style="padding: 12px; text-align: center; background: #fef3c7; font-weight: bold;">${formatAmount(finalAmount)}</td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
        </div>
    </div>
    ` : ''}

    <!-- РАСЧЕТ РОСТА КАПИТАЛА С УЧЕТОМ ПОПОЛНЕНИЙ -->
    ${[...mediumTermGoals, ...longTermGoals].length > 0 ? `
    <div style="margin-bottom: 30px;">
        <div style="background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); color: white; padding: 8px 15px; margin-bottom: 10px; border-radius: 6px; font-weight: bold; font-size: 14px;">
            РАСЧЕТ РОСТА КАПИТАЛА С УЧЕТОМ ПОПОЛНЕНИЙ
        </div>
        
        <div style="background: #f3f4f6; border: 2px solid #d1d5db; border-radius: 8px; overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: linear-gradient(135deg, #6b21a8 0%, #8b5cf6 100%); color: white; font-size: 11px;">
                        <th style="padding: 6px; text-align: center; border-right: 1px solid rgba(255,255,255,0.2);">Смартовое вложение и ежемесячное пополнение</th>
                        <th style="padding: 6px; text-align: center; border-right: 1px solid rgba(255,255,255,0.2);">Стартовый капитал</th>
                        <th style="padding: 6px; text-align: center; border-right: 1px solid rgba(255,255,255,0.2);">Ежемесячное пополнение</th>
                        <th style="padding: 6px; text-align: center; border-right: 1px solid rgba(255,255,255,0.2);">Доходность</th>
                        <th style="padding: 6px; text-align: center; border-right: 1px solid rgba(255,255,255,0.2);">Срок, лет</th>
                        <th style="padding: 6px; text-align: center;">Итоговая сумма</th>
                    </tr>
                </thead>
                <tbody>
                    ${[...mediumTermGoals, ...longTermGoals].slice(0, 3).map((goal, index) => {
                        const yearsLeft = calculateYearsLeft(goal.timeframe);
                        const monthlyInvestment = parseFloat(goal.monthlyInvestment) || 0;
                        const startCapital = (goal.collected && parseFloat(goal.collected)) || 6000;
                        const annualReturn = parseFloat(goal.returnRate) || 10;
                        const finalAmount = calculateCapitalWithDeposits(startCapital, monthlyInvestment, annualReturn, yearsLeft);
                        const ratios = getCurrencyRatio(goal.currency);
                        
                        return `
                        <tr style="background: ${index % 2 === 0 ? '#f9fafb' : '#f3f4f6'};">
                            <td style="padding: 10px; text-align: center; color: #6b21a8; font-weight: 600; font-size: 12px;">${goal.name}</td>
                            <td style="padding: 10px; text-align: center; font-size: 12px;">${formatAmount(startCapital, goal.currency === 'USD' ? '$' : '₸')}</td>
                            <td style="padding: 10px; text-align: center; font-size: 12px;">${formatAmount(monthlyInvestment, goal.currency === 'USD' ? '$' : '₸')}</td>
                            <td style="padding: 10px; text-align: center; font-size: 12px;">${annualReturn}%</td>
                            <td style="padding: 10px; text-align: center; font-size: 12px;">${yearsLeft}</td>
                            <td style="padding: 10px; text-align: center; background: #fef3c7; font-weight: bold; font-size: 12px;">${formatAmount(finalAmount, goal.currency === 'USD' ? '$' : '₸')}</td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
        </div>
    </div>
    ` : ''}



    <!-- РАСЧЕТ РОСТА НАЧАЛЬНОГО КАПИТАЛА -->
    ${totalActives > 0 ? `
    <div style="margin-bottom: 30px;">
        <div style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: white; padding: 8px 15px; margin-bottom: 10px; border-radius: 6px; font-weight: bold; font-size: 14px;">
            РАСЧЕТ РОСТА НАЧАЛЬНОГО КАПИТАЛА
        </div>
        
        <div style="background: #fefce8; border: 2px solid #fed7aa; border-radius: 8px; overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: linear-gradient(135deg, #c2410c 0%, #ea580c 100%); color: white; font-size: 12px;">
                        <th style="padding: 8px; text-align: center; border-right: 1px solid rgba(255,255,255,0.2);">Единоразовое вложение с капитализацией</th>
                        <th style="padding: 8px; text-align: center; border-right: 1px solid rgba(255,255,255,0.2);">Стартовый капитал</th>
                        <th style="padding: 8px; text-align: center; border-right: 1px solid rgba(255,255,255,0.2);">Доходность</th>
                        <th style="padding: 8px; text-align: center; border-right: 1px solid rgba(255,255,255,0.2);">Срок, лет</th>
                        <th style="padding: 8px; text-align: center;">Итоговая сумма</th>
                    </tr>
                </thead>
                <tbody>
                    ${[5, 10, 15, 20].map((years, index) => {
                        const startCapital = totalActives * 0.3;
                        const annualReturn = 10; // Можно взять из настроек пользователя
                        const finalAmount = calculateCapitalGrowth(startCapital, annualReturn, years);
                        
                        return `
                        <tr style="background: ${index % 2 === 0 ? '#fefce8' : '#fef3c7'};">
                            <td style="padding: 12px; text-align: center; color: #c2410c; font-weight: 600;">Основной сценарий (${years} лет)</td>
                            <td style="padding: 12px; text-align: center;">${formatAmount(startCapital)}</td>
                            <td style="padding: 12px; text-align: center;">${annualReturn}%</td>
                            <td style="padding: 12px; text-align: center;">${years}</td>
                            <td style="padding: 12px; text-align: center; background: #fef3c7; font-weight: bold;">${formatAmount(finalAmount)}</td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
        </div>
    </div>
    ` : ''}

    <!-- РАСЧЕТ РОСТА КАПИТАЛА С УЧЕТОМ ПОПОЛНЕНИЙ -->
    ${[...mediumTermGoals, ...longTermGoals].length > 0 ? `
    <div style="margin-bottom: 30px;">
        <div style="background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); color: white; padding: 8px 15px; margin-bottom: 10px; border-radius: 6px; font-weight: bold; font-size: 14px;">
            РАСЧЕТ РОСТА КАПИТАЛА С УЧЕТОМ ПОПОЛНЕНИЙ
        </div>
        
        <div style="background: #f3f4f6; border: 2px solid #d1d5db; border-radius: 8px; overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: linear-gradient(135deg, #6b21a8 0%, #8b5cf6 100%); color: white; font-size: 11px;">
                        <th style="padding: 6px; text-align: center; border-right: 1px solid rgba(255,255,255,0.2);">Смартовое вложение и ежемесячное пополнение</th>
                        <th style="padding: 6px; text-align: center; border-right: 1px solid rgba(255,255,255,0.2);">Стартовый капитал</th>
                        <th style="padding: 6px; text-align: center; border-right: 1px solid rgba(255,255,255,0.2);">Ежемесячное пополнение</th>
                        <th style="padding: 6px; text-align: center; border-right: 1px solid rgba(255,255,255,0.2);">Доходность</th>
                        <th style="padding: 6px; text-align: center; border-right: 1px solid rgba(255,255,255,0.2);">Срок, лет</th>
                        <th style="padding: 6px; text-align: center;">Итоговая сумма</th>
                    </tr>
                </thead>
                <tbody>
                    ${[...mediumTermGoals, ...longTermGoals].slice(0, 3).map((goal, index) => {
                        const yearsLeft = calculateYearsLeft(goal.timeframe);
                        const monthlyInvestment = parseFloat(goal.monthlyInvestment) || 0;
                        const startCapital = (goal.collected && parseFloat(goal.collected)) || 6000;
                        const annualReturn = parseFloat(goal.returnRate) || 10;
                        const finalAmount = calculateCapitalWithDeposits(startCapital, monthlyInvestment, annualReturn, yearsLeft);
                        
                        
                        return `
                        <tr style="background: ${index % 2 === 0 ? '#f9fafb' : '#f3f4f6'};">
                            <td style="padding: 10px; text-align: center; color: #6b21a8; font-weight: 600; font-size: 12px;">${goal.name}</td>
                            <td style="padding: 10px; text-align: center; font-size: 12px;">${formatAmount(startCapital, goal.currency === 'USD' ? '$' : '₸')}</td>
                            <td style="padding: 10px; text-align: center; font-size: 12px;">${formatAmount(monthlyInvestment, goal.currency === 'USD' ? '$' : '₸')}</td>
                            <td style="padding: 10px; text-align: center; font-size: 12px;">${annualReturn}%</td>
                            <td style="padding: 10px; text-align: center; font-size: 12px;">${yearsLeft}</td>
                            <td style="padding: 10px; text-align: center; background: #fef3c7; font-weight: bold; font-size: 12px;">${formatAmount(finalAmount, goal.currency === 'USD' ? '$' : '₸')}</td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
        </div>
    </div>
    ` : ''}



    <!-- РАСЧЕТ РОСТА НАЧАЛЬНОГО КАПИТАЛА -->
    ${totalActives > 0 ? `
    <div style="margin-bottom: 30px;">
        <div style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: white; padding: 8px 15px; margin-bottom: 10px; border-radius: 6px; font-weight: bold; font-size: 14px;">
            РАСЧЕТ РОСТА НАЧАЛЬНОГО КАПИТАЛА
        </div>
        
        <div style="background: #fefce8; border: 2px solid #fed7aa; border-radius: 8px; overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: linear-gradient(135deg, #c2410c 0%, #ea580c 100%); color: white; font-size: 12px;">
                        <th style="padding: 8px; text-align: center; border-right: 1px solid rgba(255,255,255,0.2);">Единоразовое вложение с капитализацией</th>
                        <th style="padding: 8px; text-align: center; border-right: 1px solid rgba(255,255,255,0.2);">Стартовый капитал</th>
                        <th style="padding: 8px; text-align: center; border-right: 1px solid rgba(255,255,255,0.2);">Доходность</th>
                        <th style="padding: 8px; text-align: center; border-right: 1px solid rgba(255,255,255,0.2);">Срок, лет</th>
                        <th style="padding: 8px; text-align: center;">Итоговая сумма</th>
                    </tr>
                </thead>
                <tbody>
                    ${[5, 10, 15, 20].map((years, index) => {
                        const startCapital = totalActives * 0.3;
                        const annualReturn = 10; // Можно взять из настроек пользователя
                        const finalAmount = calculateCapitalGrowth(startCapital, annualReturn, years);
                        
                        return `
                        <tr style="background: ${index % 2 === 0 ? '#fefce8' : '#fef3c7'};">
                            <td style="padding: 12px; text-align: center; color: #c2410c; font-weight: 600;">Основной сценарий (${years} лет)</td>
                            <td style="padding: 12px; text-align: center;">${formatAmount(startCapital)}</td>
                            <td style="padding: 12px; text-align: center;">${annualReturn}%</td>
                            <td style="padding: 12px; text-align: center;">${years}</td>
                            <td style="padding: 12px; text-align: center; background: #fef3c7; font-weight: bold;">${formatAmount(finalAmount)}</td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
        </div>
    </div>
    ` : ''}

    <!-- РАСЧЕТ РОСТА КАПИТАЛА С УЧЕТОМ ПОПОЛНЕНИЙ -->
    ${[...mediumTermGoals, ...longTermGoals].length > 0 ? `
    <div style="margin-bottom: 30px;">
        <div style="background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); color: white; padding: 8px 15px; margin-bottom: 10px; border-radius: 6px; font-weight: bold; font-size: 14px;">
            РАСЧЕТ РОСТА КАПИТАЛА С УЧЕТОМ ПОПОЛНЕНИЙ
        </div>
        
        <div style="background: #f3f4f6; border: 2px solid #d1d5db; border-radius: 8px; overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: linear-gradient(135deg, #6b21a8 0%, #8b5cf6 100%); color: white; font-size: 11px;">
                        <th style="padding: 6px; text-align: center; border-right: 1px solid rgba(255,255,255,0.2);">Смартовое вложение и ежемесячное пополнение</th>
                        <th style="padding: 6px; text-align: center; border-right: 1px solid rgba(255,255,255,0.2);">Стартовый капитал</th>
                        <th style="padding: 6px; text-align: center; border-right: 1px solid rgba(255,255,255,0.2);">Ежемесячное пополнение</th>
                        <th style="padding: 6px; text-align: center; border-right: 1px solid rgba(255,255,255,0.2);">Доходность</th>
                        <th style="padding: 6px; text-align: center; border-right: 1px solid rgba(255,255,255,0.2);">Срок, лет</th>
                        <th style="padding: 6px; text-align: center;">Итоговая сумма</th>
                    </tr>
                </thead>
                <tbody>
                    ${[...mediumTermGoals, ...longTermGoals].slice(0, 3).map((goal, index) => {
                        const yearsLeft = calculateYearsLeft(goal.timeframe);
                        const monthlyInvestment = parseFloat(goal.monthlyInvestment) || 0;
                        const startCapital = (goal.collected && parseFloat(goal.collected)) || 6000;
                        const annualReturn = parseFloat(goal.returnRate) || 10;
                        const finalAmount = calculateCapitalWithDeposits(startCapital, monthlyInvestment, annualReturn, yearsLeft);
                        const ratios = getCurrencyRatio(goal.currency);
                        
                        return `
                        <tr style="background: ${index % 2 === 0 ? '#f9fafb' : '#f3f4f6'};">
                            <td style="padding: 10px; text-align: center; color: #6b21a8; font-weight: 600; font-size: 12px;">${goal.name}</td>
                            <td style="padding: 10px; text-align: center; font-size: 12px;">${formatAmount(startCapital, goal.currency === 'USD' ? '$' : '₸')}</td>
                            <td style="padding: 10px; text-align: center; font-size: 12px;">${formatAmount(monthlyInvestment, goal.currency === 'USD' ? '$' : '₸')}</td>
                            <td style="padding: 10px; text-align: center; font-size: 12px;">${annualReturn}%</td>
                            <td style="padding: 10px; text-align: center; font-size: 12px;">${yearsLeft}</td>
                            <td style="padding: 10px; text-align: center; background: #fef3c7; font-weight: bold; font-size: 12px;">${formatAmount(finalAmount, goal.currency === 'USD' ? '$' : '₸')}</td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
        </div>
    </div>
    ` : ''}

    <!-- РАСЧЕТ ЕЖЕМЕСЯЧНОГО ИНВЕСТИРОВАНИЯ ДЛЯ ДОСТИЖЕНИЯ КАПИТАЛА -->
    ${mediumTermGoals.length > 0 ? `
    <div style="margin-bottom: 30px;">
        <div style="background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%); color: white; padding: 8px 15px; margin-bottom: 10px; border-radius: 6px; font-weight: bold; font-size: 14px;">
            РАСЧЕТ ЕЖЕМЕСЯЧНОГО ИНВЕСТИРОВАНИЯ ДЛЯ ДОСТИЖЕНИЯ КАПИТАЛА
        </div>
        
        <div style="background: #fef2f2; border: 2px solid #fecaca; border-radius: 8px; overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse;"> : '₸')}</td>
                        </tr>
                    }).join('')}
                </tbody>
            </table>
        </div>
    </div>
    ` : ''}
</div>
` : ''}
                // <thead>
                //     <tr style="background: linear-gradient(135deg, #166534 0%, #22c55e 100%); color: white; font-size: 12px;">
                //         <th style="padding: 8px; text-align: center; border-right: 1px solid rgba(255,255,255,0.2);">Единоразовое вложение с капитализацией</th>
                //         <th style="padding: 8px; text-align: center; border-right: 1px solid rgba(255,255,255,0.2);">Стартовый капитал</th>
                //         <th style="padding: 8px; text-align: center; border-right: 1px solid rgba(255,255,255,0.2);">Целевой капитал</th>
                //         <th style="padding: 8px; text-align: center; border-right: 1px solid rgba(255,255,255,0.2);">Срок, лет</th>
                //         <th style="padding: 8px; text-align: center;">Требуемая доходность, %</th>
                //     </tr>
                // </thead>
                <tbody>
                    ${longTermGoals.map((goal, index) => {
                        const yearsLeft = calculateYearsLeft(goal.timeframe);
                        const targetAmount = parseFloat(goal.amount) || 0;
                        const startCapital = (goal.collected && parseFloat(goal.collected)) || (totalActives * 0.1) || 10000;
                        const requiredReturn = calculateRequiredReturn(startCapital, targetAmount, yearsLeft);
                        
                        return `
                        <tr style="background: ${index % 2 === 0 ? '#f0fdf4' : '#dcfce7'};">
                            <td style="padding: 12px; text-align: center; color: #166534; font-weight: 600;">${goal.name}</td>
                            <td style="padding: 12px; text-align: center;">${formatAmount(startCapital)}</td>
                            <td style="padding: 12px; text-align: center;">${formatAmount(targetAmount)}</td>
                            <td style="padding: 12px; text-align: center;">${yearsLeft}</td>
                            <td style="padding: 12px; text-align: center; background: #fef3c7; font-weight: bold;">${requiredReturn}%</td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
        </div>
    </div>
   

    <!-- РАСЧЕТ РОСТА НАЧАЛЬНОГО КАПИТАЛА -->
    ${totalActives > 0 ? `
    <div style="margin-bottom: 30px;">
        <div style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: white; padding: 8px 15px; margin-bottom: 10px; border-radius: 6px; font-weight: bold; font-size: 14px;">
            РАСЧЕТ РОСТА НАЧАЛЬНОГО КАПИТАЛА
        </div>
        
        <div style="background: #fefce8; border: 2px solid #fed7aa; border-radius: 8px; overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: linear-gradient(135deg, #c2410c 0%, #ea580c 100%); color: white; font-size: 12px;">
                        <th style="padding: 8px; text-align: center; border-right: 1px solid rgba(255,255,255,0.2);">Единоразовое вложение с капитализацией</th>
                        <th style="padding: 8px; text-align: center; border-right: 1px solid rgba(255,255,255,0.2);">Стартовый капитал</th>
                        <th style="padding: 8px; text-align: center; border-right: 1px solid rgba(255,255,255,0.2);">Доходность</th>
                        <th style="padding: 8px; text-align: center; border-right: 1px solid rgba(255,255,255,0.2);">Срок, лет</th>
                        <th style="padding: 8px; text-align: center;">Итоговая сумма</th>
                    </tr>
                </thead>
                <tbody>
                    ${[5, 10, 15, 20].map((years, index) => {
                        const startCapital = totalActives * 0.3;
                        const annualReturn = 10; // Можно взять из настроек пользователя
                        const finalAmount = calculateCapitalGrowth(startCapital, annualReturn, years);
                        
                        return `
                        <tr style="background: ${index % 2 === 0 ? '#fefce8' : '#fef3c7'};">
                            <td style="padding: 12px; text-align: center; color: #c2410c; font-weight: 600;">Основной сценарий (${years} лет)</td>
                            <td style="padding: 12px; text-align: center;">${formatAmount(startCapital)}</td>
                            <td style="padding: 12px; text-align: center;">${annualReturn}%</td>
                            <td style="padding: 12px; text-align: center;">${years}</td>
                            <td style="padding: 12px; text-align: center; background: #fef3c7; font-weight: bold;">${formatAmount(finalAmount)}</td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
        </div>
    </div>
    ` : ''}

    <!-- РАСЧЕТ РОСТА КАПИТАЛА С УЧЕТОМ ПОПОЛНЕНИЙ -->
    ${[...mediumTermGoals, ...longTermGoals].length > 0 ? `
    <div style="margin-bottom: 30px;">
        <div style="background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); color: white; padding: 8px 15px; margin-bottom: 10px; border-radius: 6px; font-weight: bold; font-size: 14px;">
            РАСЧЕТ РОСТА КАПИТАЛА С УЧЕТОМ ПОПОЛНЕНИЙ
        </div>
        
        <div style="background: #f3f4f6; border: 2px solid #d1d5db; border-radius: 8px; overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: linear-gradient(135deg, #6b21a8 0%, #8b5cf6 100%); color: white; font-size: 11px;">
                        <th style="padding: 6px; text-align: center; border-right: 1px solid rgba(255,255,255,0.2);">Смартовое вложение и ежемесячное пополнение</th>
                        <th style="padding: 6px; text-align: center; border-right: 1px solid rgba(255,255,255,0.2);">Стартовый капитал</th>
                        <th style="padding: 6px; text-align: center; border-right: 1px solid rgba(255,255,255,0.2);">Ежемесячное пополнение</th>
                        <th style="padding: 6px; text-align: center; border-right: 1px solid rgba(255,255,255,0.2);">Доходность</th>
                        <th style="padding: 6px; text-align: center; border-right: 1px solid rgba(255,255,255,0.2);">Срок, лет</th>
                        <th style="padding: 6px; text-align: center;">Итоговая сумма</th>
                    </tr>
                </thead>
                <tbody>
                    ${[...mediumTermGoals, ...longTermGoals].slice(0, 3).map((goal, index) => {
                        const yearsLeft = calculateYearsLeft(goal.timeframe);
                        const monthlyInvestment = parseFloat(goal.monthlyInvestment) || 0;
                        const startCapital = (goal.collected && parseFloat(goal.collected)) || 6000;
                        const annualReturn = parseFloat(goal.returnRate) || 10;
                        const finalAmount = calculateCapitalWithDeposits(startCapital, monthlyInvestment, annualReturn, yearsLeft);
                        const ratios = getCurrencyRatio(goal.currency);
                        
                        return `
                        <tr style="background: ${index % 2 === 0 ? '#f9fafb' : '#f3f4f6'};">
                            <td style="padding: 10px; text-align: center; color: #6b21a8; font-weight: 600; font-size: 12px;">${goal.name}</td>
                            <td style="padding: 10px; text-align: center; font-size: 12px;">${formatAmount(startCapital, goal.currency === 'USD' ? '$' : '₸')}</td>
                            <td style="padding: 10px; text-align: center; font-size: 12px;">${formatAmount(monthlyInvestment, goal.currency === 'USD' ? '$' : '₸')}</td>
                            <td style="padding: 10px; text-align: center; font-size: 12px;">${annualReturn}%</td>
                            <td style="padding: 10px; text-align: center; font-size: 12px;">${yearsLeft}</td>
                            <td style="padding: 10px; text-align: center; background: #fef3c7; font-weight: bold; font-size: 12px;">${formatAmount(finalAmount, goal.currency === 'USD' ? '$' : '₸')}</td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
        </div>
    </div>
    ` : ''}

   
    </body>
    </html>
  `;
};

// Основная функция для генерации PDF с прогрессом
export const generateLFPPDFWithProgress = async (options: PDFGeneratorOptions): Promise<boolean> => {
  try {
    const { personalFinancialPlan, onStatusChange, onProgressChange, onMessageChange } = options;
    
    if (!personalFinancialPlan) {
      Alert.alert('Ошибка', 'Данные ЛФП не найдены');
      return false;
    }

    // Этап 1: Инициализация
    onStatusChange?.('generating');
    onMessageChange?.('Инициализация процесса...');
    onProgressChange?.(10);
    await delay(500);

    // Этап 2: Генерация HTML
    onMessageChange?.('Генерация HTML контента...');
    onProgressChange?.(25);
    const htmlContent = generateLFPHtmlContent(personalFinancialPlan, options);
    await delay(800);

    // Этап 3: Создание PDF
    onMessageChange?.('Создание PDF файла...');
    onProgressChange?.(60);
    await delay(1000);

    const { uri } = await Print.printToFileAsync({ 
      html: htmlContent,
      base64: false,
      width: 595,
      height: 842,
      margins: {
        top: 20,
        bottom: 20,
        left: 20,
        right: 20,
      }
    });

    console.log('PDF создан:', uri);

    // Этап 4: Подготовка к отправке
    onStatusChange?.('sharing');
    onMessageChange?.('Подготовка файла для сохранения...');
    onProgressChange?.(85);
    await delay(500);

    // Этап 5: Показ меню сохранения
    onProgressChange?.(100);
    await Sharing.shareAsync(uri, { 
      UTI: '.pdf', 
      mimeType: 'application/pdf',
      dialogTitle: `Личный Финансовый План - ${personalFinancialPlan.fio}`
    });

    // Успех
    onStatusChange?.('success');
    onMessageChange?.('PDF файл успешно создан и готов к использованию!');
    
    return true;

  } catch (error) {
    console.error('Ошибка при создании PDF:', error);
    return false;
  }
};

// Функция для печати с прогрессом
export const printLFPPDFWithProgress = async (options: PDFGeneratorOptions): Promise<boolean> => {
  try {
    const { personalFinancialPlan, onStatusChange, onProgressChange, onMessageChange } = options;
    
    if (!personalFinancialPlan) {
      Alert.alert('Ошибка', 'Данные ЛФП не найдены');
      return false;
    }

    onStatusChange?.('generating');
    onMessageChange?.('Подготовка к печати...');
    onProgressChange?.(20);
    await delay(500);

    const htmlContent = generateLFPHtmlContent(personalFinancialPlan, options);
    
    onMessageChange?.('Отправка на печать...');
    onProgressChange?.(80);
    await delay(700);
    
    await Print.printAsync({
      html: htmlContent,
      printerUrl: undefined,
    });

    onStatusChange?.('success');
    onMessageChange?.('Документ отправлен на печать!');
    onProgressChange?.(100);
    
    return true;

  } catch (error) {
    console.error('Ошибка при печати PDF:', error);
    return false;
  }
};