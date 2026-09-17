// Категории и подкатегории расходов из ТЗ (раздел «Расходы»).

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
 * набора значков. По ней относим их к ближайшей категории, чтобы диаграмма
 * группировала и старые записи.
 */
const LEGACY_ICON_CATEGORY: Record<string, string> = {
  restaurant: 'food',
  car: 'transport',
  'car-sport': 'transport',
  school: 'education',
  medkit: 'medicine',
  water: 'home',
  home: 'home',
  wifi: 'home',
  play: 'entertainment',
  'game-controller': 'entertainment',
  gift: 'entertainment',
};

export function resolveExpenseCategory(asset: Pick<Asset, 'category' | 'icon'>): ExpenseCategory {
  return (
    findExpenseCategory(asset.category) ??
    findExpenseCategory(LEGACY_ICON_CATEGORY[asset.icon ?? '']) ??
    findExpenseCategory(OTHER_CATEGORY_ID)!
  );
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

    const subName = category.subcategories.find((s) => s.id === asset.subcategory)?.name ?? 'Без подкатегории';
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
