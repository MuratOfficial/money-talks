/**
 * Ключи AsyncStorage, которые читают сразу несколько модулей.
 * Держим их в одном месте, чтобы строка не разъехалась между экраном и гардом.
 */

/** Приветственные слайды уже показывали — больше не показываем. */
export const ONBOARDING_SEEN_KEY = 'hasSeenOnboarding';

/** Последние тексты из админки (/api/public/settings) — чтобы работать офлайн. */
export const APP_SETTINGS_KEY = 'appSettings';
