// Методики проработки цели из ТЗ: «5 Почему», SMARTER, «Квадрат Декарта».
// Тексты вопросов и подсказок ФинГида взяты из ТЗ дословно.

import type { DescartesKey, GoalAnalysis, SmarterKey } from '@/hooks/store/types';

export type AnalysisTool = 'whys' | 'smarter' | 'descartes';

export const WHYS_COUNT = 5;

export const WHY_QUESTIONS: string[] = Array.from({ length: WHYS_COUNT }, (_, i) =>
  i === 0 ? 'Почему я хочу эту цель?' : 'А почему это для меня важно?'
);

export const SMARTER_QUESTIONS: { key: SmarterKey; letter: string; question: string }[] = [
  { key: 'specific', letter: 'S', question: 'Что конкретно?' },
  { key: 'measurable', letter: 'M', question: 'Сколько?' },
  { key: 'achievable', letter: 'A', question: 'Реально ли это?' },
  { key: 'relevant', letter: 'R', question: 'Зачем тебе это?' },
  { key: 'timeBound', letter: 'T', question: 'Когда?' },
  { key: 'evaluated', letter: 'E', question: 'Как будешь отслеживать?' },
  { key: 'rewarded', letter: 'R', question: 'Чем себя порадуешь?' },
];

export const DESCARTES_QUESTIONS: { key: DescartesKey; question: string }[] = [
  { key: 'ifDo', question: 'Что будет, если сделаю?' },
  { key: 'ifNotDo', question: 'Что будет, если не сделаю?' },
  { key: 'notIfDo', question: 'Чего не будет, если сделаю?' },
  { key: 'notIfNotDo', question: 'Чего не будет, если не сделаю?' },
];

export const ANALYSIS_TOOLS: {
  key: AnalysisTool;
  title: string;
  shortTitle: string;
  tagline: string;
  /** Сообщение ФинГида после полного прохождения. */
  doneMessage: string;
}[] = [
  {
    key: 'whys',
    title: '5 Почему',
    shortTitle: '5 Почему',
    tagline: 'Загляни вглубь. Настоящая причина — твой мотор.',
    doneMessage: 'Ты нашёл(а) свою истинную мотивацию — сохрани это чувство.',
  },
  {
    key: 'smarter',
    title: 'SMARTER',
    shortTitle: 'SMARTER',
    tagline: 'Проверь свою цель по SMARTER — чтобы она стала реальностью.',
    doneMessage: 'Теперь твоя цель структурирована. Осталось только действовать!',
  },
  {
    key: 'descartes',
    title: 'Квадрат Декарта',
    shortTitle: 'Декарт',
    tagline: 'Оцени цель с 4 сторон. Убери страхи — включи ясность.',
    doneMessage: 'Цель оценена с четырёх сторон — решение принято осознанно.',
  },
];

const filled = (value: string | undefined) => !!value && value.trim().length > 0;

/** Пройдена ли методика полностью: заполнены все её поля. */
export function isToolComplete(analysis: GoalAnalysis | undefined, tool: AnalysisTool): boolean {
  if (!analysis) return false;
  switch (tool) {
    case 'whys':
      return WHY_QUESTIONS.every((_, i) => filled(analysis.whys?.[i]));
    case 'smarter':
      return SMARTER_QUESTIONS.every(({ key }) => filled(analysis.smarter?.[key]));
    case 'descartes':
      return DESCARTES_QUESTIONS.every(({ key }) => filled(analysis.descartes?.[key]));
  }
}

/** Одинаковы ли ответы (без учёта пробелов по краям) — чтобы не трогать цель зря. */
export function sameAnalysis(a: GoalAnalysis | undefined, b: GoalAnalysis | undefined): boolean {
  return JSON.stringify(cleanAnalysis(a ?? {})) === JSON.stringify(cleanAnalysis(b ?? {}));
}

export function completedToolsCount(analysis: GoalAnalysis | undefined): number {
  return ANALYSIS_TOOLS.filter(({ key }) => isToolComplete(analysis, key)).length;
}

/** Убирает пустые ответы, чтобы не хранить и не синхронизировать мусор. */
export function cleanAnalysis(analysis: GoalAnalysis): GoalAnalysis {
  const trimRecord = <K extends string>(record: Partial<Record<K, string>> | undefined) => {
    if (!record) return undefined;
    const entries = Object.entries(record)
      .map(([k, v]) => [k, typeof v === 'string' ? v.trim() : ''] as const)
      .filter(([, v]) => v.length > 0);
    return entries.length ? (Object.fromEntries(entries) as Partial<Record<K, string>>) : undefined;
  };

  // Array.from, а не map: в массиве бывают дыры (ответ на 3-й вопрос без 1-го),
  // map их сохраняет, и при синхронизации они превращались бы в null.
  const whys = Array.from({ length: WHYS_COUNT }, (_, i) => (analysis.whys?.[i] ?? '').trim());
  return {
    whys: whys.some((w) => w.length > 0) ? whys : undefined,
    smarter: trimRecord<SmarterKey>(analysis.smarter),
    descartes: trimRecord<DescartesKey>(analysis.descartes),
  };
}
