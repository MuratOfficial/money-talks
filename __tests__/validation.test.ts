import {
  assetFormSchema,
  goalFormSchema,
  firstError,
  parseAmountInput,
} from '@/validation/forms';

describe('parseAmountInput', () => {
  it('парсит целые числа с пробелами и валютой', () => {
    expect(parseAmountInput('1 500 ₸')).toBe(1500);
  });

  it('парсит дробные значения с запятой', () => {
    expect(parseAmountInput('1 500,50')).toBe(1500.5);
  });

  it('возвращает NaN для пустой строки', () => {
    expect(Number.isNaN(parseAmountInput(''))).toBe(true);
  });
});

describe('assetFormSchema', () => {
  it('проходит при корректных данных', () => {
    const res = assetFormSchema.safeParse({
      title: 'Зарплата',
      amount: '600 000 ₸',
      category: 'salary',
    });
    expect(res.success).toBe(true);
    expect(firstError(res)).toBeNull();
  });

  it('требует категорию', () => {
    const res = assetFormSchema.safeParse({
      title: 'Зарплата',
      amount: '600 000',
      category: '',
    });
    expect(res.success).toBe(false);
    expect(firstError(res)).toBe('Выберите значок');
  });

  it('отклоняет нулевую сумму', () => {
    const res = assetFormSchema.safeParse({
      title: 'Тест',
      amount: '0',
      category: 'salary',
    });
    expect(res.success).toBe(false);
  });
});

describe('goalFormSchema', () => {
  it('требует выбранную дату', () => {
    const res = goalFormSchema.safeParse({
      name: 'Машина',
      amount: '5 000 000',
      day: 'День',
      month: 'Январь',
      year: '2030',
    });
    expect(res.success).toBe(false);
    expect(firstError(res)).toBe('Выберите день');
  });

  it('проходит при полностью заполненной форме', () => {
    const res = goalFormSchema.safeParse({
      name: 'Машина',
      amount: '5 000 000',
      day: '15',
      month: 'Январь',
      year: '2030',
      inflationRate: '3',
      returnRate: '8',
    });
    expect(res.success).toBe(true);
  });
});
