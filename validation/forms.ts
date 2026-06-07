import { z } from 'zod';

/** Парсит строку суммы ("1 500,50 ₸") в число */
export const parseAmountInput = (value: string): number => {
  if (!value) return NaN;
  const clean = value.toString().replace(/[^\d.,]/g, '').replace(',', '.');
  return parseFloat(clean);
};

const amountField = z
  .string()
  .trim()
  .min(1, 'Введите сумму')
  .refine((v) => {
    const n = parseAmountInput(v);
    return !isNaN(n) && n > 0;
  }, 'Сумма должна быть положительным числом');

/** Схема формы дохода/расхода (AddForm) */
export const assetFormSchema = z.object({
  title: z.string().trim().min(1, 'Введите название'),
  amount: amountField,
  category: z.string().trim().min(1, 'Выберите значок'),
});

export type AssetFormInput = z.infer<typeof assetFormSchema>;

const optionalPercent = z
  .string()
  .trim()
  .optional()
  .refine(
    (v) => !v || !isNaN(parseAmountInput(v)),
    'Введите корректное число'
  );

/** Схема формы цели (AddGoalForm) */
export const goalFormSchema = z.object({
  name: z.string().trim().min(1, 'Введите название цели'),
  amount: amountField,
  day: z.string().refine((v) => v !== 'День', 'Выберите день'),
  month: z.string().refine((v) => v !== 'Месяц', 'Выберите месяц'),
  year: z.string().refine((v) => v !== 'Год', 'Выберите год'),
  inflationRate: optionalPercent,
  returnRate: optionalPercent,
});

export type GoalFormInput = z.infer<typeof goalFormSchema>;

type SafeParseLike =
  | { success: true }
  | { success: false; error: { issues: { message: string }[] } };

/** Возвращает первое сообщение об ошибке из результата zod, либо null */
export const firstError = (result: SafeParseLike): string | null => {
  if (result.success) return null;
  return result.error.issues[0]?.message ?? 'Проверьте правильность заполнения';
};
