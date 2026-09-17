// Что говорит ФинГид на экране «Финансы» — сценарии из ТЗ (раздел «Экран Финансы»).

import type { Asset } from '@/hooks/store/types';
import type { FinGuideMood } from '@/app/components/FinGuide';

export interface FinanceTip {
  message: string;
  mood: FinGuideMood;
  /** Экран, куда ведёт кнопка, и её подпись. */
  action?: { label: string; route: string };
}

export const IDLE_TIP: FinanceTip = {
  message: 'Если не знаешь, с чего начать — начни с себя. Что ты заработал и на что потратил сегодня?',
  mood: 'thinking',
  action: { label: 'Внести расход', route: '/main/finance/expences/add-expence' },
};

const sum = (records: Asset[]) => records.reduce((s, r) => s + (Number(r.amount) || 0), 0);

export function financeTip(
  data: { incomes: Asset[]; expences: Asset[]; actives: Asset[]; passives: Asset[] },
  formatAmount: (value: number) => string
): FinanceTip {
  const { incomes, expences, actives, passives } = data;
  const filled = [incomes, expences, actives, passives].filter((list) => list.length > 0).length;

  if (filled === 0) {
    return {
      message: 'Начни с простого: внеси доходы и расходы. Остальное — рассчитаем вместе 💡',
      mood: 'happy',
      action: { label: 'Внести доход', route: '/main/finance/incomes/add-income' },
    };
  }
  if (incomes.length > 0 && expences.length === 0) {
    return {
      message: 'Доход есть, а расходы? Давай посмотрим, куда уходит твой бюджет. Это важно для расчёта дельты.',
      mood: 'thinking',
      action: { label: 'Внести расход', route: '/main/finance/expences/add-expence' },
    };
  }
  if (expences.length > 0 && incomes.length === 0) {
    return {
      message: 'А как насчёт доходов? Без них сложно понять, двигаешься ли ты к финансовой свободе.',
      mood: 'thinking',
      action: { label: 'Внести доход', route: '/main/finance/incomes/add-income' },
    };
  }

  const delta = sum(incomes) - sum(expences);
  if (delta < 0) {
    return {
      message: 'У тебя отрицательная дельта. Давай подумаем, как сократить лишние траты или увеличить доходы.',
      mood: 'sad',
      action: { label: 'Посмотреть анализ', route: '/main/finance/analyze/main' },
    };
  }
  if (filled === 3) {
    const missing = actives.length === 0 ? 'активы' : 'пассивы';
    return {
      message: `Ты почти у цели. Осталось внести ${missing}!`,
      mood: 'happy',
      action: {
        label: `Внести ${missing}`,
        route: actives.length === 0 ? '/main/finance/actives/add-actives' : '/main/finance/passives/add-passives',
      },
    };
  }
  if (filled === 4) {
    return {
      message: `🎉 Финансовый профиль сформирован! Твоя дельта: ${formatAmount(delta)}. Чистый капитал: ${formatAmount(sum(actives) - sum(passives))}. Во вкладке «Анализ» — рекомендации лично для тебя.`,
      mood: 'celebrate',
      action: { label: 'Открыть анализ', route: '/main/finance/analyze/main' },
    };
  }
  return {
    message: 'Твои финансы — как система координат. Введи доходы, расходы, активы и пассивы — и мы покажем тебе, где ты находишься, и куда идти дальше.',
    mood: 'happy',
    action: { label: 'Внести актив', route: '/main/finance/actives/add-actives' },
  };
}
