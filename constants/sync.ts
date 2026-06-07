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
