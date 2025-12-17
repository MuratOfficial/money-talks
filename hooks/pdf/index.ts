/**
 * PDF Generator Module
 * Модульная система генерации PDF для ЛФП
 */

// Типы
export * from './pdfTypes';

// Калькуляторы
export * from './pdfCalculations';

// Переводы
export { translations } from './pdfTranslations';

// Шаблоны
export * from './pdfTemplates';

// Основной генератор
export { generateLFPHtmlContent } from './pdfGenerator';
