import {
  EXPENSE_CATEGORIES,
  groupExpensesByCategory,
  resolveExpenseCategory,
  resolveExpenseSubcategory,
} from '@/constants/expenseCategories';
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
    const ids = EXPENSE_CATEGORIES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
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
