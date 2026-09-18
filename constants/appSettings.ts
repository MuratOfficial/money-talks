/**
 * Тексты, которые админ правит в панели (модель AppSetting на сервере).
 *
 * Здесь лежат значения по умолчанию: если запрос к /api/public/settings не
 * прошёл и в кэше пусто, в документ попадёт именно этот текст. Копия значений
 * из admin-app/lib/appSettings.ts — при изменении правьте оба файла.
 */

export interface AppSettings {
  /** Подпись внизу PDF с личным финансовым планом. */
  lfpPdfFooter: string;
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  lfpPdfFooter: `Личный финансовый план сформирован в приложении Money Talks.
Нужна помощь в реализации стратегии или оптимизации бюджета? Получите экспертную поддержку от автора приложения и сертифицированного финансового советника.
Раушан Итжанова 📱 +77767006363
e-mail: rb.finexpert@gmail.com`,
};

/**
 * Достраивает ответ сервера до полного набора текстов: пустые и неизвестные
 * значения заменяются умолчаниями, поэтому в документе не окажется пустоты.
 */
export function mergeAppSettings(raw: unknown): AppSettings {
  const source = (raw ?? {}) as Record<string, unknown>;
  const result = { ...DEFAULT_APP_SETTINGS };

  (Object.keys(DEFAULT_APP_SETTINGS) as (keyof AppSettings)[]).forEach((key) => {
    const value = source[key];
    if (typeof value === 'string' && value.trim()) {
      result[key] = value;
    }
  });

  return result;
}
