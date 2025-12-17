import { Asset, Goal, PersonalFinancialPlan } from '../useStore';
import { Translations, FinancialSummary } from './pdfTypes';
import {
    formatAmount,
    formatDate,
    calculateYearsLeft,
    getCurrencyRatio,
} from './pdfCalculations';

/**
 * Базовые стили для PDF документа
 */
export const getBaseStyles = (): string => `
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
  }
  
  .title {
    font-size: 28px;
    font-weight: bold;
    letter-spacing: 2px;
    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  }
  
  .content {
    padding: 40px;
  }
  
  .section-title {
    font-size: 20px;
    color: #4CAF50;
    margin: 30px 0 15px 0;
    padding-bottom: 10px;
    border-bottom: 2px solid #4CAF50;
    font-weight: 600;
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
  
  .highlight {
    background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
    padding: 3px 8px;
    border-radius: 4px;
    font-weight: 600;
  }
  
  .footer {
    margin-top: 40px;
    padding-top: 20px;
    border-top: 2px solid #e0e0e0;
    text-align: center;
    color: #666;
    font-size: 12px;
  }
`;

/**
 * Шаблон заголовка документа
 */
export const generateHeader = (t: Translations): string => `
  <div class="header">
    <div class="title">${t.title}</div>
  </div>
`;

/**
 * Шаблон информации о клиенте
 */
export const generateClientInfo = (
    plan: PersonalFinancialPlan,
    t: Translations,
    userName?: string
): string => `
  <div class="profile-section">
    <table class="info-table">
      <tr>
        <th>${t.fullName}</th>
        <td class="highlight">${plan.fio || userName || 'Не указано'}</td>
      </tr>
      <tr>
        <th>${t.birthDate}</th>
        <td>${formatDate(plan.birthDate)}</td>
      </tr>
      <tr>
        <th>${t.activity}</th>
        <td class="highlight">${plan.activity || 'Не указано'}</td>
      </tr>
      <tr>
        <th>${t.financialDependents}</th>
        <td class="highlight">${plan.financialDependents || '0'}</td>
      </tr>
      <tr>
        <th>${t.riskProfile}</th>
        <td class="highlight">${plan.riskProfile || 'Не указано'}</td>
      </tr>
    </table>
  </div>
`;

/**
 * Шаблон секции страхования
 */
export const generateInsuranceSection = (plan: PersonalFinancialPlan, t: Translations): string => `
  <div class="section-title">${t.securityPillow}</div>
  <div style="background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); padding: 20px; border-radius: 10px; border-left: 4px solid #2196F3;">
    <p style="font-size: 16px; color: #1976D2; font-weight: 600;">${plan.securityPillow}</p>
  </div>
  
  <div class="section-title">${t.insurance}</div>
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 20px;">
    <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 20px; border-radius: 10px; border-left: 4px solid #4CAF50;">
      <h4 style="color: #4CAF50; margin-bottom: 8px; font-size: 16px;">${t.lifeInsurance}</h4>
      <p style="color: #666; font-size: 14px;">${plan.insurance.life}</p>
    </div>
    <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 20px; border-radius: 10px; border-left: 4px solid #4CAF50;">
      <h4 style="color: #4CAF50; margin-bottom: 8px; font-size: 16px;">${t.disabilityInsurance}</h4>
      <p style="color: #666; font-size: 14px;">${plan.insurance.disability}</p>
    </div>
    <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 20px; border-radius: 10px; border-left: 4px solid #4CAF50;">
      <h4 style="color: #4CAF50; margin-bottom: 8px; font-size: 16px;">${t.medicalInsurance}</h4>
      <p style="color: #666; font-size: 14px;">${plan.insurance.medical}</p>
    </div>
  </div>
`;

/**
 * Шаблон таблицы финансовых данных
 */
export const generateFinancialTable = (
    items: Asset[],
    title: string,
    total: number,
    currency: string,
    color: string
): string => {
    if (!items || items.length === 0) {
        return '';
    }

    return `
    <div style="margin-bottom: 30px;">
      <div style="background: linear-gradient(135deg, ${color} 0%, ${color}dd 100%); color: white; padding: 12px 20px; margin-bottom: 15px; border-radius: 8px; font-weight: bold;">
        ${title}
      </div>
      
      <div style="background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 10px; overflow: hidden;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: linear-gradient(135deg, #475569 0%, #64748b 100%); color: white;">
              <th style="padding: 12px; text-align: left; border-right: 1px solid rgba(255,255,255,0.2);">Название</th>
              <th style="padding: 12px; text-align: center; border-right: 1px solid rgba(255,255,255,0.2);">Сумма</th>
              ${items.some((i) => i.yield) ? '<th style="padding: 12px; text-align: center; border-right: 1px solid rgba(255,255,255,0.2);">Доходность</th>' : ''}
              ${items.some((i) => i.regularity) ? '<th style="padding: 12px; text-align: center;">Регулярность</th>' : ''}
            </tr>
          </thead>
          <tbody>
            ${items
            .map(
                (item, index) => `
              <tr style="background: ${index % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                <td style="padding: 15px; font-weight: 600; border-right: 1px solid #e5e7eb;">${item.name}</td>
                <td style="padding: 15px; text-align: center; border-right: 1px solid #e5e7eb;">
                  ${formatAmount(item.amount, currency)}
                </td>
                ${item.yield ? `<td style="padding: 15px; text-align: center; border-right: 1px solid #e5e7eb;">${item.yield}%</td>` : ''}
                ${item.regularity ? `<td style="padding: 15px; text-align: center;">${item.regularity}</td>` : ''}
              </tr>
            `
            )
            .join('')}
          </tbody>
        </table>
        
        <div style="background: #fbbf24; padding: 12px; text-align: center; font-weight: bold; color: #92400e;">
          ИТОГО: ${formatAmount(total, currency)}
        </div>
      </div>
    </div>
  `;
};

/**
 * Шаблон таблицы целей
 */
export const generateGoalsTable = (
    goals: Goal[],
    title: string,
    color: string,
    currency: string
): string => {
    if (!goals || goals.length === 0) {
        return '';
    }

    const totalKZT = goals.reduce((sum, goal) => {
        const ratios = getCurrencyRatio(goal.currency);
        return sum + (parseFloat(goal.monthlyInvestment) || 0) * ratios.kzt;
    }, 0);

    const totalUSD = goals.reduce((sum, goal) => {
        const ratios = getCurrencyRatio(goal.currency);
        return sum + (parseFloat(goal.monthlyInvestment) || 0) * ratios.usd;
    }, 0);

    return `
    <div style="margin-bottom: 40px;">
      <div style="background: linear-gradient(135deg, ${color} 0%, ${color}dd 100%); color: white; padding: 12px 20px; margin-bottom: 15px; border-radius: 8px; font-weight: bold;">
        ${title}
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
              <th style="padding: 8px; text-align: center;">Е/И</th>
              <th style="padding: 8px; text-align: center;">В ₸</th>
              <th style="padding: 8px; text-align: center;">В $</th>
            </tr>
          </thead>
          <tbody>
            ${goals
            .map((goal, index) => {
                const yearsLeft = calculateYearsLeft(goal.timeframe);
                const monthlyInvestment = parseFloat(goal.monthlyInvestment) || 0;
                const ratios = getCurrencyRatio(goal.currency);

                return `
                <tr style="background: ${index % 2 === 0 ? '#f0fdf4' : '#dcfce7'};">
                  <td style="padding: 12px 8px; text-align: center; font-weight: bold;">${index + 1}</td>
                  <td style="padding: 12px; font-weight: 600; color: #166534;">${goal.name}</td>
                  <td style="padding: 12px; text-align: center;">${formatAmount(parseFloat(goal.amount), goal.currency === 'USD' ? '$' : '₸')}</td>
                  <td style="padding: 12px; text-align: center;">${goal.currency === 'USD' ? '$' : '₸'}</td>
                  <td style="padding: 12px; text-align: center; font-size: 11px;">${goal.timeframe.day}.${goal.timeframe.month}.${goal.timeframe.year}</td>
                  <td style="padding: 12px; text-align: center;">${goal.returnRate}%</td>
                  <td style="padding: 12px; text-align: center;">${goal.inflationRate}%</td>
                  <td style="padding: 12px; text-align: center; font-weight: bold;">${yearsLeft}</td>
                  <td style="padding: 12px; text-align: center; background: #fef3c7; font-weight: bold;">${formatAmount(monthlyInvestment, goal.currency === 'USD' ? '$' : '₸')}</td>
                  <td style="padding: 12px; text-align: center;">${formatAmount(monthlyInvestment * ratios.kzt, '₸')}</td>
                  <td style="padding: 12px; text-align: center;">${formatAmount(monthlyInvestment * ratios.usd, '$')}</td>
                </tr>`;
            })
            .join('')}
          </tbody>
        </table>
        
        <div style="background: #fbbf24; padding: 12px; text-align: center; font-weight: bold; color: #92400e;">
          ИТОГО: ${formatAmount(totalKZT, '₸')} | ${formatAmount(totalUSD, '$')}
        </div>
      </div>
    </div>
  `;
};

/**
 * Шаблон итоговой сводки
 */
export const generateSummary = (summary: FinancialSummary, currency: string): string => `
  <div style="margin-top: 30px; background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white; padding: 20px; border-radius: 12px;">
    <h3 style="margin: 0 0 15px 0; font-size: 18px; text-align: center;">ФИНАНСОВАЯ СВОДКА</h3>
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; font-size: 14px;">
      <div>
        <div style="opacity: 0.9;">Общий доход:</div>
        <div style="font-size: 18px; font-weight: bold; margin-top: 5px;">${formatAmount(summary.totalIncomes, currency)}</div>
      </div>
      <div>
        <div style="opacity: 0.9;">Общие расходы:</div>
        <div style="font-size: 18px; font-weight: bold; margin-top: 5px;">${formatAmount(summary.totalExpenses, currency)}</div>
      </div>
      <div>
        <div style="opacity: 0.9;">Активы:</div>
        <div style="font-size: 18px; font-weight: bold; margin-top: 5px;">${formatAmount(summary.totalActives, currency)}</div>
      </div>
      <div>
        <div style="opacity: 0.9;">Пассивы:</div>
        <div style="font-size: 18px; font-weight: bold; margin-top: 5px;">${formatAmount(summary.totalPassives, currency)}</div>
      </div>
      <div style="grid-column: span 2; border-top: 2px solid rgba(255,255,255,0.3); padding-top: 15px; margin-top: 10px;">
        <div style="opacity: 0.9;">Чистый капитал:</div>
        <div style="font-size: 22px; font-weight: bold; margin-top: 5px;">${formatAmount(summary.netWorth, currency)}</div>
      </div>
      <div style="grid-column: span 2;">
        <div style="opacity: 0.9;">Месячный баланс:</div>
        <div style="font-size: 22px; font-weight: bold; margin-top: 5px; color: ${summary.monthlyBalance >= 0 ? '#86efac' : '#fca5a5'};">${formatAmount(summary.monthlyBalance, currency)}</div>
      </div>
    </div>
  </div>
`;

/**
 * Шаблон футера
 */
export const generateFooter = (plan: PersonalFinancialPlan, t: Translations): string => `
  <div class="footer">
    <p><strong>${t.createdDate}:</strong> ${plan.createdAt instanceof Date ? plan.createdAt.toLocaleDateString('ru-RU') : new Date(plan.createdAt).toLocaleDateString('ru-RU')}</p>
    <p><strong>${t.updatedDate}:</strong> ${plan.updatedAt instanceof Date ? plan.updatedAt.toLocaleDateString('ru-RU') : new Date(plan.updatedAt).toLocaleDateString('ru-RU')}</p>
    <p style="margin-top: 10px; font-style: italic;">Создано с помощью приложения Money Talks</p>
  </div>
`;
