import { financeTip } from '@/utils/finGuideTips';
import type { Asset } from '@/hooks/store/types';

const rec = (amount: number): Asset => ({ id: String(amount), name: 'x', amount });
const fmt = (v: number) => `${v} ₸`;
const none = { incomes: [], expences: [], actives: [], passives: [] };

describe('financeTip', () => {
  it('ведёт по сценариям из ТЗ', () => {
    expect(financeTip(none, fmt).message).toMatch(/^Начни с простого/);
    expect(financeTip({ ...none, incomes: [rec(100)] }, fmt)).toMatchObject({ mood: 'thinking', action: { label: 'Внести расход' } });
    expect(financeTip({ ...none, expences: [rec(100)] }, fmt).message).toMatch(/^А как насчёт доходов/);
    expect(financeTip({ ...none, incomes: [rec(100)], expences: [rec(150)] }, fmt).mood).toBe('sad');
    expect(financeTip({ ...none, incomes: [rec(100)], expences: [rec(50)], actives: [rec(1)] }, fmt).message).toBe('Ты почти у цели. Осталось внести пассивы!');
  });

  it('поздравляет, когда заполнены все четыре раздела', () => {
    const tip = financeTip({ incomes: [rec(1000)], expences: [rec(300)], actives: [rec(5000)], passives: [rec(2000)] }, fmt);
    expect(tip.mood).toBe('celebrate');
    expect(tip.message).toContain('Твоя дельта: 700 ₸. Чистый капитал: 3000 ₸');
  });
});
