import { generateCrisisSection, generateFooter } from '@/hooks/pdf/pdfTemplates';
import { translations } from '@/hooks/pdf/pdfTranslations';
import { DEFAULT_APP_SETTINGS, mergeAppSettings } from '@/constants/appSettings';
import { CRISIS_SCENARIOS, evaluateScenario } from '@/utils/crisisScenarios';
import type { PersonalFinancialPlan } from '@/hooks/useStore';

const plan = {
  id: 'p1',
  fio: 'Иванов Иван',
  birthDate: { day: '1', month: 'Январь', year: '1990' },
  activity: '',
  financialDependents: '2',
  securityPillow: '0',
  insurance: { life: '0', disability: '0', medical: '0' },
  riskProfile: 'Умеренный',
  createdAt: new Date(2026, 0, 10),
  updatedAt: new Date(2026, 1, 10),
} as PersonalFinancialPlan;

describe('generateFooter', () => {
  it('переносит строки подписи и экранирует спецсимволы', () => {
    const html = generateFooter(plan, translations.ru, 'Первая строка\nВторая & <третья>');
    expect(html).toContain('Первая строка<br>Вторая &amp; &lt;третья&gt;');
  });

  it('печатает контакты советника из настроек', () => {
    const html = generateFooter(plan, translations.ru, DEFAULT_APP_SETTINGS.lfpPdfFooter);
    expect(html).toContain('Раушан Итжанова');
    expect(html).toContain('rb.finexpert@gmail.com');
    // Старая системная подпись должна была уйти.
    expect(html).not.toContain('Создано с помощью приложения Money Talks');
  });
});

describe('mergeAppSettings', () => {
  it('берёт текст сервера, когда он есть', () => {
    expect(mergeAppSettings({ lfpPdfFooter: 'Новый текст' }).lfpPdfFooter).toBe('Новый текст');
  });

  it('подставляет умолчание на пустой, кривой или отсутствующий ответ', () => {
    expect(mergeAppSettings({ lfpPdfFooter: '   ' })).toEqual(DEFAULT_APP_SETTINGS);
    expect(mergeAppSettings({ lfpPdfFooter: 42 })).toEqual(DEFAULT_APP_SETTINGS);
    expect(mergeAppSettings(null)).toEqual(DEFAULT_APP_SETTINGS);
  });
});

describe('generateCrisisSection', () => {
  it('выводит строку на каждый сценарий и советы', () => {
    const input = {
      monthlyIncome: 500_000,
      monthlyExpense: 400_000,
      requiredExpense: 300_000,
      liquidSavings: 900_000,
      monthlyDebtPayment: 0,
    };
    const results = CRISIS_SCENARIOS.map((scenario) => evaluateScenario(input, scenario));
    const html = generateCrisisSection(results, [{ id: 's', title: 'Совет', detail: 'Детали & подробности' }], '₸');

    expect(html).toContain('КРИЗИСНЫЕ СЦЕНАРИИ');
    CRISIS_SCENARIOS.forEach((scenario) => expect(html).toContain(scenario.title));
    expect(html).toContain('дефицита нет');
    expect(html).toContain('Детали &amp; подробности');
  });
});
