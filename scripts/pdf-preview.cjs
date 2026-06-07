/* Standalone preview of the LFP PDF: transpiles the pure PDF modules,
   feeds representative mock data, writes HTML, then prints to PDF via headless Chrome. */
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
const pdfDir = path.join(root, 'hooks', 'pdf');
const outDir = path.join(root, '.pdf-preview');
const tmpDir = path.join(outDir, 'build');
fs.mkdirSync(tmpDir, { recursive: true });

// Транспилируем нужные модули (type-only импорты из ../useStore и ./pdfTypes отсекаются)
const files = ['pdfCalculations.ts', 'pdfTranslations.ts', 'pdfTemplates.ts'];
for (const f of files) {
  const src = fs.readFileSync(path.join(pdfDir, f), 'utf8');
  const js = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019 },
    fileName: f,
  }).outputText;
  fs.writeFileSync(path.join(tmpDir, f.replace('.ts', '.js')), js);
}

const templates = require(path.join(tmpDir, 'pdfTemplates.js'));
const { translations } = require(path.join(tmpDir, 'pdfTranslations.js'));

// ---- Тестовые данные ----
const incomes = [
  { id: '1', name: 'Зарплата', amount: 600000, regularity: 'regular' },
  { id: '2', name: 'Фриланс', amount: 150000, regularity: 'irregular' },
];
const expences = [
  { id: '1', name: 'Аренда', amount: 200000, regularity: 'regular' },
  { id: '2', name: 'Еда', amount: 120000, regularity: 'regular' },
  { id: '3', name: 'Развлечения', amount: 50000, regularity: 'irregular' },
];
const actives = [
  { id: '1', name: 'Квартира', amount: 25000000, yield: 4, regularity: 'regular' },
  { id: '2', name: 'Депозит', amount: 3000000, yield: 14, regularity: 'regular' },
];
const passives = [
  { id: '1', name: 'Ипотека', amount: 15000000, additional: 1800000, yield: -12, regularity: 'regular' },
  { id: '2', name: 'Автокредит', amount: 4000000, additional: 600000, yield: -15, regularity: 'irregular' },
];
const goals = [
  { id: '1', name: 'Отпуск', type: 'short', currency: 'KZT', amount: '1500000', collected: '200000',
    inflationRate: '8', returnRate: '12', timeframe: { day: '1', month: 'Декабрь', year: '2026' } },
  { id: '2', name: 'Авто', type: 'medium', currency: 'USD', amount: '30000', collected: '5000',
    inflationRate: '5', returnRate: '10', timeframe: { day: '1', month: 'Июнь', year: '2029' } },
  { id: '3', name: 'Пенсия', type: 'long', currency: 'KZT', amount: '80000000', collected: '0',
    inflationRate: '7', returnRate: '15', timeframe: { day: '1', month: 'Январь', year: '2045' } },
];

const totalIncomes = incomes.reduce((s, i) => s + i.amount, 0);
const totalExpenses = expences.reduce((s, i) => s + i.amount, 0);
const totalActives = actives.reduce((s, i) => s + i.amount, 0);
const totalPassives = passives.reduce((s, i) => s + i.amount, 0);

// Подушка = регулярные расходы × 3 (как в приложении)
const regularExpenses = expences.filter((e) => e.regularity === 'regular').reduce((s, e) => s + e.amount, 0);
const securityPillow = new Intl.NumberFormat('ru-RU').format(regularExpenses * 3) + ' ₸';

const plan = {
  fio: 'Иванов Иван Иванович',
  birthDate: { day: '15', month: 'Март', year: '1990' },
  activity: 'IT-предприниматель',
  financialDependents: '2',
  riskProfile: 'Умеренно-агрессивный',
  securityPillow,
  insurance: { life: '50 000 000 ₸', disability: '20 000 000 ₸', medical: '10 000 000 ₸' },
  createdAt: new Date(),
  updatedAt: new Date(),
};

const currency = '₸';
const t = translations.ru;

const short = goals.filter((g) => g.type === 'short');
const medium = goals.filter((g) => g.type === 'medium');
const long = goals.filter((g) => g.type === 'long');

const summary = {
  totalIncomes, totalExpenses, totalActives, totalPassives,
  netWorth: totalActives - totalPassives,
  monthlyBalance: totalIncomes - totalExpenses,
};

const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${t.title}</title>
<style>${templates.getBaseStyles()}</style></head><body><div class="container">
${templates.generateHeader(t)}
<div class="content">
${templates.generateClientInfo(plan, t)}
${templates.generateInsuranceSection(plan, t)}
<div style="page-break-before: always; margin-top: 60px;">
<div class="section-title" style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: white; padding: 15px 25px; margin: 0 -40px 30px -40px; text-align: center; font-size: 22px;">ФИНАНСОВЫЕ ДАННЫЕ</div>
${templates.generateFinancialTable(incomes, t.incomes, totalIncomes, currency, '#1e40af')}
${templates.generateFinancialTable(expences, t.expenses, totalExpenses, currency, '#dc2626')}
${templates.generateFinancialTable(actives, t.assets, totalActives, currency, '#059669')}
${templates.generateFinancialTable(passives, t.liabilities, totalPassives, currency, '#ea580c', false)}
</div>
<div style="page-break-before: always; margin-top: 60px;">
<div class="section-title" style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white; padding: 15px 25px; margin: 0 -40px 30px -40px; text-align: center; font-size: 22px;">${t.goals}</div>
${templates.generateGoalsTable(short, 'КРАТКОСРОЧНЫЕ ЦЕЛИ (ДО 1 ГОДА)', '#3b82f6', currency)}
${templates.generateGoalsTable(medium, 'СРЕДНЕСРОЧНЫЕ ЦЕЛИ (ОТ 1 ДО 5 ЛЕТ)', '#ea580c', currency)}
${templates.generateGoalsTable(long, 'ДОЛГОСРОЧНЫЕ ЦЕЛИ (БОЛЕЕ 5 ЛЕТ)', '#059669', currency)}
</div>
${templates.generateSummary(summary, currency)}
${templates.generateFooter(plan, t)}
</div></div></body></html>`;

const htmlPath = path.join(outDir, 'lfp.html');
fs.writeFileSync(htmlPath, html);
console.log('HTML:', htmlPath);

// Печать в PDF через headless Chrome
const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const pdfPath = path.join(outDir, 'lfp.pdf');
execFileSync(chrome, [
  '--headless=new', '--disable-gpu', '--no-pdf-header-footer',
  `--print-to-pdf=${pdfPath}`, 'file:///' + htmlPath.replace(/\\/g, '/'),
], { stdio: 'inherit' });
console.log('PDF:', pdfPath);

// Печать рассчитанных взносов для проверки формулы
console.log('\n--- Проверка расчёта ежемесячного взноса (аннуитет) ---');
const calc = require(path.join(tmpDir, 'pdfCalculations.js'));
for (const g of goals) {
  const months = calc.calculateTotalMonthsLeft(g.timeframe);
  const pmt = calc.recalculateMonthlyInvestment(
    parseFloat(g.amount), parseFloat(g.inflationRate), parseFloat(g.returnRate), months, parseFloat(g.collected));
  console.log(`${g.name} [${g.type}] цель=${g.amount} ${g.currency}, мес=${months}, взнос=${Math.round(pmt)}`);
}
