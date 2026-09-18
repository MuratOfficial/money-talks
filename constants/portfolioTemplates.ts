// Блок «Первые инвестиции» из ТЗ: готовые шаблоны портфелей под риск-профиль.
//
// Эти значения — резерв на случай, когда админка недоступна или шаблоны туда
// ещё не занесли. Боевой список редактируется в админ-панели (модель
// PortfolioTemplate) и приезжает через /api/public/invest.

export interface PortfolioSlice {
  label: string;
  /** Доля в портфеле, %. Сумма долей шаблона — 100. */
  percent: number;
}

export interface PortfolioTemplate {
  id: string;
  title: string;
  /** Профиль из constants/riskProfiles; null — шаблон подходит всем. */
  riskProfile: string | null;
  description: string;
  allocation: PortfolioSlice[];
  horizon: string;
  expectedReturn: string;
  risks: string;
  firstStep: string;
}

/** Цвета долей по порядку — чтобы полоса состава выглядела одинаково везде. */
export const SLICE_COLORS = ['#4CAF50', '#0EA5E9', '#F59E0B', '#A855F7', '#EF4444', '#64748B'];

export const DISCLAIMER =
  'Шаблон — учебный пример, а не инвестиционная рекомендация. Окончательное решение всегда за вами.';

export const FALLBACK_PORTFOLIO_TEMPLATES: PortfolioTemplate[] = [
  {
    id: 'conservative',
    title: 'Сохранить и не потерять',
    riskProfile: 'Консервативный',
    description:
      'Портфель для тех, кому важнее сохранность денег, чем доходность. Основа — предсказуемые инструменты с понятным сроком.',
    allocation: [
      { label: 'Депозиты в тенге', percent: 50 },
      { label: 'Государственные облигации', percent: 30 },
      { label: 'Золото', percent: 10 },
      { label: 'Индексный фонд', percent: 10 },
    ],
    horizon: 'от 1 года',
    expectedReturn: 'на уровне депозита плюс 1–2%',
    risks: 'Главный риск — инфляция: деньги сохранны, но растут медленно.',
    firstStep: 'Разложите подушку безопасности по депозитам с разными сроками, чтобы часть денег всегда была доступна.',
  },
  {
    id: 'moderate-conservative',
    title: 'Надёжность с добавкой роста',
    riskProfile: 'Умеренно-консервативный',
    description:
      'Основа по-прежнему защитная, но появляется небольшая доля акций крупных компаний — чтобы обгонять инфляцию.',
    allocation: [
      { label: 'Облигации', percent: 40 },
      { label: 'Депозиты', percent: 25 },
      { label: 'Индексные фонды', percent: 20 },
      { label: 'Золото', percent: 15 },
    ],
    horizon: 'от 2 лет',
    expectedReturn: 'умеренная, с редкими просадками',
    risks: 'Доля акций может проседать — деньги не должны понадобиться в ближайший год.',
    firstStep: 'Начните с облигаций и индексного фонда, докупая их раз в месяц на фиксированную сумму.',
  },
  {
    id: 'balanced',
    title: 'Половина на половину',
    riskProfile: 'Умеренный',
    description:
      'Классический сбалансированный портфель: защитная часть держит удар, растущая — работает на капитал.',
    allocation: [
      { label: 'Индексные фонды', percent: 40 },
      { label: 'Облигации', percent: 35 },
      { label: 'Золото', percent: 15 },
      { label: 'Кэш на счёте', percent: 10 },
    ],
    horizon: 'от 3 лет',
    expectedReturn: 'выше депозита, с колебаниями по году',
    risks: 'В плохой год портфель может уйти в минус — важно не продавать на просадке.',
    firstStep: 'Раз в полгода проверяйте доли: если акции выросли, часть прибыли перекладывайте в облигации.',
  },
  {
    id: 'growth',
    title: 'Ставка на рост',
    riskProfile: 'Умеренно-агрессивный',
    description:
      'Большая часть портфеля работает на рост, защитная доля остаётся только как страховка от просадок.',
    allocation: [
      { label: 'Индексные фонды', percent: 45 },
      { label: 'Акции отдельных компаний', percent: 25 },
      { label: 'Облигации', percent: 20 },
      { label: 'Золото', percent: 10 },
    ],
    horizon: 'от 5 лет',
    expectedReturn: 'высокая на длинном горизонте',
    risks: 'Просадка в 20–30% за год — нормальное явление для такого состава.',
    firstStep: 'Соберите сначала индексную часть, а отдельные акции добавляйте, когда разберётесь в отчётности компаний.',
  },
  {
    id: 'aggressive',
    title: 'Максимальный рост',
    riskProfile: 'Агрессивный',
    description:
      'Портфель для длинного горизонта и крепких нервов. Подушка безопасности при этом обязана лежать отдельно.',
    allocation: [
      { label: 'Индексные фонды', percent: 40 },
      { label: 'Акции роста', percent: 35 },
      { label: 'Высокорисковые активы', percent: 15 },
      { label: 'Кэш на счёте', percent: 10 },
    ],
    horizon: 'от 7 лет',
    expectedReturn: 'самая высокая, но и самая непредсказуемая',
    risks: 'Возможна потеря значительной части вложений. Никогда не вкладывайте сюда подушку безопасности.',
    firstStep: 'Заранее запишите правила: сколько вкладываете, когда фиксируете прибыль и когда выходите из убытка.',
  },
];

/**
 * Шаблоны под профиль пользователя: сначала его собственные, затем общие.
 * Если профиль не определён — показываем всё, чтобы было с чем сравнивать.
 */
export function templatesForProfile(
  templates: PortfolioTemplate[],
  profileTitle: string | null
): PortfolioTemplate[] {
  if (!profileTitle) return templates;
  const mine = templates.filter((t) => t.riskProfile === profileTitle);
  const common = templates.filter((t) => !t.riskProfile);
  const others = templates.filter((t) => t.riskProfile && t.riskProfile !== profileTitle);
  return [...mine, ...common, ...others];
}
