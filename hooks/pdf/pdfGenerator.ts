import { appStore } from '../useStore';
import { PDFGeneratorOptions, FinancialSummary } from './pdfTypes';
import { translations } from './pdfTranslations';
import {
    getBaseStyles,
    generateHeader,
    generateClientInfo,
    generateInsuranceSection,
    generateFinancialTable,
    generateGoalsTable,
    generateSummary,
    generateFooter,
} from './pdfTemplates';

/**
 * Генерирует полный HTML контент для PDF документа
 */
export const generateLFPHtmlContent = (options: PDFGeneratorOptions): string => {
    const { personalFinancialPlan, language = 'ru', currency = '₸' } = options;

    // Получаем данные из store
    const storeState = appStore.getState();
    const { goals, incomes, actives, passives, expences, user } = storeState;

    // Получаем переводы
    const t = translations[language];

    // Группировка целей по типам
    const shortTermGoals = goals?.filter((g) => g.type === 'short') || [];
    const mediumTermGoals = goals?.filter((g) => g.type === 'medium') || [];
    const longTermGoals = goals?.filter((g) => g.type === 'long') || [];

    // Расчет общих сумм
    const totalIncomes = incomes?.reduce((sum, income) => sum + income.amount, 0) || 0;
    const totalExpenses = expences?.reduce((sum, expense) => sum + expense.amount, 0) || 0;
    const totalActives = actives?.reduce((sum, active) => sum + active.amount, 0) || 0;
    const totalPassives = passives?.reduce((sum, passive) => sum + passive.amount, 0) || 0;

    // Финансовая сводка
    const financialSummary: FinancialSummary = {
        totalIncomes,
        totalExpenses,
        totalActives,
        totalPassives,
        netWorth: totalActives - totalPassives,
        monthlyBalance: totalIncomes - totalExpenses,
    };

    // Генерация HTML
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${t.title}</title>
      <style>
        ${getBaseStyles()}
      </style>
    </head>
    <body>
      <div class="container">
        ${generateHeader(t)}
        
        <div class="content">
          ${generateClientInfo(personalFinancialPlan, t, user?.name)}
          
          ${generateInsuranceSection(personalFinancialPlan, t)}
          
          <!-- Финансовые данные -->
          <div style="page-break-before: always; margin-top: 60px;">
            <div class="section-title" style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: white; padding: 15px 25px; margin: 0 -40px 30px -40px; text-align: center; font-size: 22px;">
              ФИНАНСОВЫЕ ДАННЫЕ
            </div>

            ${generateFinancialTable(incomes || [], t.incomes, totalIncomes, currency, '#1e40af')}
            
            ${generateFinancialTable(expences || [], t.expenses, totalExpenses, currency, '#dc2626')}
            
            ${generateFinancialTable(actives || [], t.assets, totalActives, currency, '#059669')}
            
            ${generateFinancialTable(passives || [], t.liabilities, totalPassives, currency, '#ea580c')}
          </div>

          <!-- Цели -->
          ${goals && goals.length > 0
            ? `
          <div style="page-break-before: always; margin-top: 60px;">
            <div class="section-title" style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white; padding: 15px 25px; margin: 0 -40px 30px -40px; text-align: center; font-size: 22px;">
              ${t.goals}
            </div>

            ${shortTermGoals.length > 0 ? generateGoalsTable(shortTermGoals, 'КРАТКОСРОЧНЫЕ ЦЕЛИ (ДО 1 ГОДА)', '#3b82f6', currency) : ''}
            
            ${mediumTermGoals.length > 0 ? generateGoalsTable(mediumTermGoals, 'СРЕДНЕСРОЧНЫЕ ЦЕЛИ (ОТ 1 ДО 5 ЛЕТ)', '#ea580c', currency) : ''}
            
            ${longTermGoals.length > 0 ? generateGoalsTable(longTermGoals, 'ДОЛГОСРОЧНЫЕ ЦЕЛИ (БОЛЕЕ 5 ЛЕТ)', '#059669', currency) : ''}
          </div>
          `
            : ''
        }

          <!-- Итоговая сводка -->
          ${generateSummary(financialSummary, currency)}
          
          ${generateFooter(personalFinancialPlan, t)}
        </div>
      </div>
    </body>
    </html>
  `;
};
