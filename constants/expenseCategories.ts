// Категории и подкатегории расходов: набор из ТЗ (раздел «Расходы») плюс
// категории, которые были в приложении до него как отдельные значки
// (связь, кредиты, покупки, спорт и т.д.) — чтобы ничего не пропало.

import type { Asset } from '@/hooks/store/types';

export interface ExpenseSubcategory {
  id: string;
  name: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  /** Имя иконки Ionicons. */
  icon: string;
  color: string;
  /** По ТЗ: обязательный или необязательный расход. */
  required: boolean;
  subcategories: ExpenseSubcategory[];
}

export const OTHER_CATEGORY_ID = 'other';

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  {
    id: 'food',
    name: 'Еда',
    icon: 'restaurant',
    color: '#F97316',
    required: true,
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
    required: true,
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
    required: true,
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
    required: true,
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
    required: true,
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
    required: true,
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
    required: true,
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
    required: false,
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
    required: false,
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
    required: false,
    subcategories: [],
  },
  {
    id: 'charity',
    name: 'Благотворительность',
    icon: 'heart',
    color: '#F472B6',
    required: false,
    subcategories: [],
  },
  {
    id: 'business',
    name: 'Бизнес',
    icon: 'business',
    color: '#F59E0B',
    required: false,
    subcategories: [],
  },
  {
    id: 'crypto',
    name: 'Криптовалюта',
    icon: 'logo-bitcoin',
    color: '#EAB308',
    required: false,
    subcategories: [],
  },
  {
    id: OTHER_CATEGORY_ID,
    name: 'Прочее',
    icon: 'cube',
    color: '#9CA3AF',
    required: false,
    subcategories: [],
  },
];

export const findExpenseCategory = (id: string | undefined): ExpenseCategory | undefined =>
  EXPENSE_CATEGORIES.find((c) => c.id === id);

/**
 * Расходы, добавленные до появления категорий, хранят только иконку из старого
 * набора значков. По ней восстанавливаем категорию и подкатегорию, чтобы
 * старые записи группировались на диаграмме и открывались в форме.
 */
const LEGACY_ICONS: Record<string, { category: string; subcategory?: string }> = {
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

type CategorizedAsset = Pick<Asset, 'category' | 'subcategory' | 'icon'>;

export function resolveExpenseCategory(asset: CategorizedAsset): ExpenseCategory {
  return (
    findExpenseCategory(asset.category) ??
    findExpenseCategory(LEGACY_ICONS[asset.icon ?? '']?.category) ??
    findExpenseCategory(OTHER_CATEGORY_ID)!
  );
}

/** Подкатегория записи (с учётом старых значков) или undefined. */
export function resolveExpenseSubcategory(asset: CategorizedAsset): ExpenseSubcategory | undefined {
  const category = resolveExpenseCategory(asset);
  const id = asset.category ? asset.subcategory : LEGACY_ICONS[asset.icon ?? '']?.subcategory;
  return category.subcategories.find((s) => s.id === id);
}

export interface CategoryTotal {
  category: ExpenseCategory;
  amount: number;
  subcategories: { name: string; amount: number }[];
}

/** Суммы по категориям (по убыванию) с разбивкой по подкатегориям. */
export function groupExpensesByCategory(assets: Asset[]): CategoryTotal[] {
  const groups = new Map<string, { category: ExpenseCategory; amount: number; subs: Map<string, number> }>();

  for (const asset of assets) {
    const category = resolveExpenseCategory(asset);
    const amount = Number(asset.amount) || 0;
    const group = groups.get(category.id) ?? { category, amount: 0, subs: new Map() };
    group.amount += amount;

    const subName = resolveExpenseSubcategory(asset)?.name ?? 'Без подкатегории';
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
