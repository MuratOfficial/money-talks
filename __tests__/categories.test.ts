import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  RecordKind,
  categoryLabel,
  groupByCategory,
  resolveCategory,
  resolveSubcategory,
} from '@/constants/categories';

const resolveExpenseCategory = (asset: Parameters<typeof resolveCategory>[1]) => resolveCategory('expence', asset);
const resolveExpenseSubcategory = (asset: Parameters<typeof resolveSubcategory>[1]) => resolveSubcategory('expence', asset);
const groupExpensesByCategory = (assets: Asset[]) => groupByCategory('expence', assets);
import type { Asset } from '@/hooks/store/types';

const expense = (fields: Partial<Asset>): Asset => ({ id: Math.random().toString(), name: 'x', amount: 0, ...fields });

describe('resolveExpenseCategory', () => {
  it('берёт сохранённую категорию', () => {
    expect(resolveExpenseCategory({ category: 'medicine', icon: 'restaurant' }).id).toBe('medicine');
  });

  it('старые расходы относит к категории и подкатегории по иконке', () => {
    expect(resolveExpenseCategory({ icon: 'restaurant' }).id).toBe('food');
    expect(resolveExpenseSubcategory({ icon: 'car' })?.name).toBe('Такси');
    expect(resolveExpenseSubcategory({ icon: 'shirt' })?.name).toBe('Одежда');
    expect(resolveExpenseSubcategory({ icon: 'home' })?.name).toBe('Ипотека');
  });

  it('ни один значок из прежнего набора не теряется в «Прочее»', () => {
    const oldIcons = ['restaurant', 'car', 'water', 'car-sport', 'heart', 'medkit', 'gift', 'bag-handle', 'home', 'shirt',
      'card', 'account-balance', 'phone-portrait', 'logo-bitcoin', 'wifi', 'play', 'fitness', 'business', 'school'];
    for (const icon of oldIcons) {
      expect([icon, resolveExpenseCategory({ icon }).id]).not.toEqual([icon, 'other']);
    }
  });

  it('у сохранённой категории подкатегория берётся из записи, а не из значка', () => {
    expect(resolveExpenseSubcategory({ category: 'transport', icon: 'car' })).toBeUndefined();
  });

  it('id категорий уникальны', () => {
    for (const list of [EXPENSE_CATEGORIES, INCOME_CATEGORIES]) {
      const ids = list.map((c) => c.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('неизвестное — в «Прочее»', () => {
    expect(resolveExpenseCategory({ icon: 'unknown-icon' }).id).toBe('other');
    expect(resolveExpenseCategory({ category: 'removed-category' }).id).toBe('other');
  });
});

describe('groupExpensesByCategory', () => {
  it('складывает суммы по категориям и подкатегориям, сортирует по убыванию', () => {
    const result = groupExpensesByCategory([
      expense({ category: 'food', subcategory: 'groceries', amount: 100 }),
      expense({ category: 'food', subcategory: 'delivery', amount: 300 }),
      expense({ category: 'food', subcategory: 'groceries', amount: 50 }),
      expense({ icon: 'restaurant', amount: 20 }),
      expense({ category: 'transport', subcategory: 'taxi', amount: 1000 }),
    ]);

    expect(result.map((g) => [g.category.id, g.amount])).toEqual([
      ['transport', 1000],
      ['food', 470],
    ]);
    expect(result[1].subcategories).toEqual([
      { name: 'Доставка еды', amount: 300 },
      { name: 'Продукты', amount: 150 },
      { name: 'Без подкатегории', amount: 20 },
    ]);
  });
});

describe('категории доходов', () => {
  const kind: RecordKind = 'income';

  it('ни один значок из прежнего набора доходов не теряется в «Прочее»', () => {
    const oldIcons = ['cash', 'laptop', 'home', 'trending-up', 'gift', 'wallet', 'library-books', 'account-balance', 'card',
      'attach-money', 'logo-bitcoin', 'stats-chart', 'business', 'star'];
    for (const icon of oldIcons) {
      expect([icon, resolveCategory(kind, { icon }).id]).not.toEqual([icon, 'other']);
    }
  });

  it('одна и та же иконка у доходов и расходов значит разное', () => {
    expect(categoryLabel('income', { icon: 'home' })).toBe('Аренда');
    expect(categoryLabel('expence', { icon: 'home' })).toBe('Кредиты · Ипотека');
    expect(categoryLabel('income', { icon: 'logo-bitcoin' })).toBe('Инвестиции · Криптовалюта');
  });

  it('группирует доходы по источникам', () => {
    const result = groupByCategory(kind, [
      { id: '1', name: 'ЗП', amount: 500, category: 'salary' },
      { id: '2', name: 'Дивиденды', amount: 50, category: 'investments', subcategory: 'dividends' },
      { id: '3', name: 'Старый', amount: 30, icon: 'account-balance' },
    ]);
    expect(result.map((g) => [g.category.name, g.amount])).toEqual([
      ['Зарплата', 500],
      ['Инвестиции', 80],
    ]);
  });
});
