// Категории и подкатегории доходов и расходов.
//
// Набор из ТЗ (разделы «Доходы» и «Расходы») плюс то, что было в приложении
// до него отдельными значками, — чтобы при переходе ничего не пропало.
// Записи, добавленные до категорий, хранят только иконку старого набора:
// по ней восстанавливаем категорию и подкатегорию (LEGACY_*_ICONS).

import type { Asset } from '@/hooks/store/types';

export type RecordKind = 'income' | 'expence';

export interface RecordSubcategory {
  id: string;
  name: string;
}

export interface RecordCategory {
  id: string;
  name: string;
  /** Имя иконки Ionicons. */
  icon: string;
  color: string;
  subcategories: RecordSubcategory[];
}

interface LegacyIcon {
  category: string;
  subcategory?: string;
}

export const OTHER_CATEGORY_ID = 'other';

export const EXPENSE_CATEGORIES: RecordCategory[] = [
  {
    id: 'food',
    name: 'Еда',
    icon: 'restaurant',
    color: '#F97316',
    subcategories: [
      { id: 'groceries', name: 'Продукты' },
      { id: 'delivery', name: 'Доставка еды' },
      { id: 'eating-out', name: 'Еда вне дома' },
    ],
  },
  {
    id: 'transport',
    name: 'Транспорт',
    icon: 'car',
    color: '#FBBF24',
    subcategories: [
      { id: 'taxi', name: 'Такси' },
      { id: 'car', name: 'Авто' },
      { id: 'fuel', name: 'Топливо' },
      { id: 'carwash', name: 'Мойка' },
    ],
  },
  {
    id: 'education',
    name: 'Образование',
    icon: 'school',
    color: '#6366F1',
    subcategories: [
      { id: 'courses', name: 'Курсы' },
      { id: 'tutors', name: 'Репетиторы' },
      { id: 'school', name: 'Школа / детсад' },
    ],
  },
  {
    id: 'medicine',
    name: 'Медицина',
    icon: 'medkit',
    color: '#EF4444',
    subcategories: [
      { id: 'pharmacy', name: 'Аптека' },
      { id: 'doctor', name: 'Приём врача' },
      { id: 'insurance', name: 'Страховка' },
    ],
  },
  {
    id: 'home',
    name: 'Дом',
    icon: 'home',
    color: '#3B82F6',
    subcategories: [
      { id: 'utilities', name: 'Коммуналка' },
      { id: 'repair', name: 'Ремонт' },
      { id: 'insurance', name: 'Страховка' },
    ],
  },
  {
    id: 'connection',
    name: 'Связь',
    icon: 'wifi',
    color: '#14B8A6',
    subcategories: [
      { id: 'phone', name: 'Телефон' },
      { id: 'internet', name: 'Интернет' },
    ],
  },
  {
    id: 'loans',
    name: 'Кредиты',
    icon: 'card',
    color: '#8B5CF6',
    subcategories: [
      { id: 'mortgage', name: 'Ипотека' },
      { id: 'loan', name: 'Кредит' },
      { id: 'bank-fees', name: 'Банк / карта' },
    ],
  },
  {
    id: 'shopping',
    name: 'Покупки',
    icon: 'bag-handle',
    color: '#EC4899',
    subcategories: [
      { id: 'clothing', name: 'Одежда' },
      { id: 'electronics', name: 'Техника' },
      { id: 'other-shopping', name: 'Шопинг' },
    ],
  },
  {
    id: 'entertainment',
    name: 'Развлечения',
    icon: 'game-controller',
    color: '#A78BFA',
    subcategories: [
      { id: 'subscriptions', name: 'Подписки' },
      { id: 'cinema', name: 'Кино / Театр' },
      { id: 'gifts', name: 'Подарки' },
    ],
  },
  {
    id: 'sport',
    name: 'Спорт',
    icon: 'fitness',
    color: '#84CC16',
    subcategories: [],
  },
  {
    id: 'charity',
    name: 'Благотворительность',
    icon: 'heart',
    color: '#F472B6',
    subcategories: [],
  },
  {
    id: 'business',
    name: 'Бизнес',
    icon: 'business',
    color: '#F59E0B',
    subcategories: [],
  },
  {
    id: 'crypto',
    name: 'Криптовалюта',
    icon: 'logo-bitcoin',
    color: '#EAB308',
    subcategories: [],
  },
  {
    id: OTHER_CATEGORY_ID,
    name: 'Прочее',
    icon: 'cube',
    color: '#9CA3AF',
    subcategories: [],
  },
];

/** Источники дохода из ТЗ: регулярные и нерегулярные, плюс прежние значки. */
export const INCOME_CATEGORIES: RecordCategory[] = [
  { id: 'salary', name: 'Зарплата', icon: 'cash', color: '#10B981', subcategories: [] },
  { id: 'bonus', name: 'Премии / Бонусы', icon: 'star', color: '#FBBF24', subcategories: [] },
  { id: 'freelance', name: 'Фриланс', icon: 'laptop', color: '#8B5CF6', subcategories: [] },
  { id: 'business', name: 'Доход от бизнеса', icon: 'business', color: '#F97316', subcategories: [] },
  { id: 'rent', name: 'Аренда', icon: 'home', color: '#3B82F6', subcategories: [] },
  {
    id: 'investments',
    name: 'Инвестиции',
    icon: 'stats-chart',
    color: '#0891B2',
    subcategories: [
      { id: 'dividends', name: 'Дивиденды' },
      { id: 'interest', name: 'Проценты' },
      { id: 'crypto', name: 'Криптовалюта' },
    ],
  },
  { id: 'cashback', name: 'Кэшбек', icon: 'pricetag', color: '#14B8A6', subcategories: [] },
  {
    id: 'sales',
    name: 'Продажа',
    icon: 'trending-up',
    color: '#059669',
    subcategories: [
      { id: 'assets', name: 'Продажа активов' },
      { id: 'things', name: 'Продажа вещей' },
      { id: 'books', name: 'Книги' },
    ],
  },
  { id: 'gifts', name: 'Подарки', icon: 'gift', color: '#EC4899', subcategories: [] },
  { id: 'winnings', name: 'Выигрыши', icon: 'trophy', color: '#EAB308', subcategories: [] },
  {
    id: 'transfers',
    name: 'Переводы',
    icon: 'swap-horizontal',
    color: '#2563EB',
    subcategories: [
      { id: 'card', name: 'На карту' },
      { id: 'cash', name: 'Наличные' },
      { id: 'wallet', name: 'Кошелёк' },
    ],
  },
  { id: OTHER_CATEGORY_ID, name: 'Прочее', icon: 'cube', color: '#9CA3AF', subcategories: [] },
];

const LEGACY_EXPENSE_ICONS: Record<string, LegacyIcon> = {
  restaurant: { category: 'food' },
  car: { category: 'transport', subcategory: 'taxi' },
  'car-sport': { category: 'transport', subcategory: 'carwash' },
  water: { category: 'home', subcategory: 'utilities' },
  heart: { category: 'charity' },
  medkit: { category: 'medicine' },
  gift: { category: 'entertainment', subcategory: 'gifts' },
  'bag-handle': { category: 'shopping', subcategory: 'other-shopping' },
  home: { category: 'loans', subcategory: 'mortgage' },
  shirt: { category: 'shopping', subcategory: 'clothing' },
  card: { category: 'loans', subcategory: 'bank-fees' },
  'account-balance': { category: 'loans', subcategory: 'bank-fees' },
  'phone-portrait': { category: 'connection', subcategory: 'phone' },
  'logo-bitcoin': { category: 'crypto' },
  wifi: { category: 'connection', subcategory: 'internet' },
  play: { category: 'entertainment' },
  fitness: { category: 'sport' },
  business: { category: 'business' },
  school: { category: 'education' },
};

const LEGACY_INCOME_ICONS: Record<string, LegacyIcon> = {
  cash: { category: 'salary' },
  laptop: { category: 'freelance' },
  home: { category: 'rent' },
  'trending-up': { category: 'sales', subcategory: 'assets' },
  gift: { category: 'gifts' },
  wallet: { category: 'transfers', subcategory: 'wallet' },
  'library-books': { category: 'sales', subcategory: 'books' },
  'account-balance': { category: 'investments', subcategory: 'interest' },
  card: { category: 'transfers', subcategory: 'card' },
  'attach-money': { category: 'transfers', subcategory: 'cash' },
  'logo-bitcoin': { category: 'investments', subcategory: 'crypto' },
  'stats-chart': { category: 'investments' },
  business: { category: 'business' },
  star: { category: 'bonus' },
};

const SETS: Record<RecordKind, { categories: RecordCategory[]; legacy: Record<string, LegacyIcon> }> = {
  income: { categories: INCOME_CATEGORIES, legacy: LEGACY_INCOME_ICONS },
  expence: { categories: EXPENSE_CATEGORIES, legacy: LEGACY_EXPENSE_ICONS },
};

export const getCategories = (kind: RecordKind): RecordCategory[] => SETS[kind].categories;

export const findCategory = (kind: RecordKind, id: string | undefined): RecordCategory | undefined =>
  SETS[kind].categories.find((c) => c.id === id);

type CategorizedAsset = Pick<Asset, 'category' | 'subcategory' | 'icon'>;

export function resolveCategory(kind: RecordKind, asset: CategorizedAsset): RecordCategory {
  return (
    findCategory(kind, asset.category) ??
    findCategory(kind, SETS[kind].legacy[asset.icon ?? '']?.category) ??
    findCategory(kind, OTHER_CATEGORY_ID)!
  );
}

/** Подкатегория записи (с учётом старых значков) или undefined. */
export function resolveSubcategory(kind: RecordKind, asset: CategorizedAsset): RecordSubcategory | undefined {
  const category = resolveCategory(kind, asset);
  const id = asset.category ? asset.subcategory : SETS[kind].legacy[asset.icon ?? '']?.subcategory;
  return category.subcategories.find((s) => s.id === id);
}

/** «Еда · Доставка еды» — подпись категории под названием записи. */
export function categoryLabel(kind: RecordKind, asset: CategorizedAsset): string {
  const category = resolveCategory(kind, asset);
  const sub = resolveSubcategory(kind, asset);
  return sub ? `${category.name} · ${sub.name}` : category.name;
}

export interface CategoryTotal {
  category: RecordCategory;
  amount: number;
  subcategories: { name: string; amount: number }[];
}

/** Суммы по категориям (по убыванию) с разбивкой по подкатегориям. */
export function groupByCategory(kind: RecordKind, assets: Asset[]): CategoryTotal[] {
  const groups = new Map<string, { category: RecordCategory; amount: number; subs: Map<string, number> }>();

  for (const asset of assets) {
    const category = resolveCategory(kind, asset);
    const amount = Number(asset.amount) || 0;
    const group = groups.get(category.id) ?? { category, amount: 0, subs: new Map() };
    group.amount += amount;

    const subName = resolveSubcategory(kind, asset)?.name ?? 'Без подкатегории';
    group.subs.set(subName, (group.subs.get(subName) ?? 0) + amount);
    groups.set(category.id, group);
  }

  return [...groups.values()]
    .map(({ category, amount, subs }) => ({
      category,
      amount,
      subcategories: [...subs].map(([name, value]) => ({ name, amount: value })).sort((a, b) => b.amount - a.amount),
    }))
    .sort((a, b) => b.amount - a.amount);
}
