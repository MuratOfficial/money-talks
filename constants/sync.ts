// Конфигурация синхронизации данных с сервером

/** Минимальный интервал между отправками на сервер (мс) */
export const SYNC_THROTTLE_MS = 5000;

/** Задержка перед автосинхронизацией после последнего изменения (мс) */
export const SYNC_DEBOUNCE_MS = 2000;

/** Допустимые значения настроек (используются для безопасного приведения данных сервера) */
export const THEMES = ['light', 'dark'] as const;
export const LANGUAGES = ['ru', 'en', 'kz'] as const;
export const CURRENCIES = ['₸', '$', '€'] as const;

export type Theme = (typeof THEMES)[number];
export type Language = (typeof LANGUAGES)[number];
export type Currency = (typeof CURRENCIES)[number];

/** Безопасно приводит произвольное значение к допустимому, иначе возвращает fallback */
const coerce = <T extends string>(
  allowed: readonly T[],
  value: unknown,
  fallback: T
): T => (allowed.includes(value as T) ? (value as T) : fallback);

export const coerceTheme = (value: unknown): Theme => coerce(THEMES, value, 'dark');
export const coerceLanguage = (value: unknown): Language => coerce(LANGUAGES, value, 'ru');
export const coerceCurrency = (value: unknown): Currency => coerce(CURRENCIES, value, '₸');

/** Поля, которые участвуют в синхронизации с сервером. */
export const SYNCABLE_FIELDS = [
  'categories',
  'wallets',
  'expences',
  'incomes',
  'actives',
  'passives',
  'goals',
  'personalFinancialPlan',
  'theme',
  'language',
  'currency',
] as const;

/**
 * Детерминированная подпись синхронизируемых данных (FNV-1a, 32 бита).
 *
 * Нужна, чтобы при запуске понять, изменились ли локальные данные с момента
 * последней успешной синхронизации (`lastSyncHash`). Это позволяет НЕ затирать
 * несинхронизированные локальные правки серверной версией (защита от потери
 * данных при оффлайн-редактировании). Хэш без зависимостей и компактен.
 */
export const syncSignature = (data: Record<string, unknown>): string => {
  const stable = SYNCABLE_FIELDS.map((f) => JSON.stringify(data[f] ?? null)).join('|');
  let h = 0x811c9dc5;
  for (let i = 0; i < stable.length; i++) {
    h ^= stable.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16);
};

/** Есть ли в данных хоть что-то значимое (защита от затирания сервера пустотой). */
export const hasSyncableData = (data: Record<string, unknown>): boolean => {
  const arrays = ['categories', 'wallets', 'expences', 'incomes', 'actives', 'passives', 'goals'];
  const anyArray = arrays.some((f) => Array.isArray(data[f]) && (data[f] as unknown[]).length > 0);
  return anyArray || data.personalFinancialPlan != null;
};
