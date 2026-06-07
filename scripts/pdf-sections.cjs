const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const tmp = path.join(root, '.pdf-preview', 'build');
const templates = require(path.join(tmp, 'pdfTemplates.js'));
const { translations } = require(path.join(tmp, 'pdfTranslations.js'));
const t = translations.ru;
const cur = '₸';
const outd = path.join(root, '.pdf-preview');

const incomes = [
  { id: '1', name: 'Зарплата', amount: 600000, regularity: 'regular' },
  { id: '2', name: 'Фриланс', amount: 150000, regularity: 'irregular' },
];
const passives = [
  { id: '1', name: 'Ипотека', amount: 15000000, additional: 1800000, yield: -12, regularity: 'regular' },
  { id: '2', name: 'Автокредит', amount: 4000000, additional: 600000, yield: -15, regularity: 'irregular' },
];
const summary = { totalIncomes: 750000, totalExpenses: 370000, totalActives: 28000000, totalPassives: 19000000, netWorth: 9000000, monthlyBalance: 380000 };
const goals = [
  { id: '1', name: 'Отпуск', type: 'short', currency: 'KZT', amount: '1500000', collected: '200000', inflationRate: '8', returnRate: '12', timeframe: { day: '1', month: 'Декабрь', year: '2026' } },
  { id: '2', name: 'Авто', type: 'medium', currency: 'USD', amount: '30000', collected: '5000', inflationRate: '5', returnRate: '10', timeframe: { day: '1', month: 'Июнь', year: '2029' } },
];
const wrap = (inner) => '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>' + templates.getBaseStyles() + '</style></head><body><div class="container"><div class="content">' + inner + '</div></div></body></html>';

fs.writeFileSync(path.join(outd, 'sec_tables.html'),
  wrap(templates.generateFinancialTable(incomes, t.incomes, 750000, cur, '#1e40af') +
       templates.generateFinancialTable(passives, t.liabilities, 19000000, cur, '#ea580c', false)));
fs.writeFileSync(path.join(outd, 'sec_summary.html'), wrap(templates.generateSummary(summary, cur)));
fs.writeFileSync(path.join(outd, 'sec_goals.html'), wrap(templates.generateGoalsTable(goals, 'ЦЕЛИ (ПРИМЕР)', '#3b82f6', cur)));
console.log('ok');
