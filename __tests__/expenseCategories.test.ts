import { groupExpensesByCategory, resolveExpenseCategory } from '@/constants/expenseCategories';
import type { Asset } from '@/hooks/store/types';

const expense = (fields: Partial<Asset>): Asset => ({ id: Math.random().toString(), name: 'x', amount: 0, ...fields });

describe('resolveExpenseCategory', () => {
  it('берёт сохранённую категорию', () => {
    expect(resolveExpenseCategory({ category: 'medicine', icon: 'restaurant' }).id).toBe('medicine');
  });

  it('старые расходы относит к категории по иконке', () => {
    expect(resolveExpenseCategory({ icon: 'restaurant' }).id).toBe('food');
    expect(resolveExpenseCategory({ icon: 'car' }).id).toBe('transport');
  });

  it('неизвестное — в «Прочее»', () => {
    expect(resolveExpenseCategory({ icon: 'logo-bitcoin' }).id).toBe('other');
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
