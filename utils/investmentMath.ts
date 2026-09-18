// Симулятор регулярных вложений: «что будет, если откладывать N в месяц».
// Считаем ежемесячное пополнение с ежемесячной капитализацией — так же,
// как работают накопительные счета и реинвестирование дохода.

export interface SimulationInput {
  /** Сколько откладываем каждый месяц. */
  monthly: number;
  /** Горизонт в годах. */
  years: number;
  /** Ожидаемая доходность, % годовых. */
  annualRatePercent: number;
  /** Стартовая сумма, если она уже есть. */
  initial?: number;
}

export interface SimulationPoint {
  year: number;
  /** Сколько внесли своими деньгами к концу года. */
  invested: number;
  /** Сколько стоит портфель с учётом доходности. */
  value: number;
}

export interface SimulationResult {
  /** Точки по годам, включая нулевой год (стартовая сумма). */
  points: SimulationPoint[];
  invested: number;
  value: number;
  /** Сколько заработала доходность сверх вложенного. */
  profit: number;
}

const round = (value: number) => Math.round(value);

/**
 * Портфель по годам. Пополнение вносится в начале месяца, доход начисляется
 * в конце — поэтому первый взнос успевает поработать целый месяц.
 */
export function simulateContributions({
  monthly,
  years,
  annualRatePercent,
  initial = 0,
}: SimulationInput): SimulationResult {
  const safeYears = Math.max(0, Math.floor(years));
  const safeMonthly = Math.max(0, monthly);
  const monthlyRate = annualRatePercent / 100 / 12;

  let value = Math.max(0, initial);
  let invested = Math.max(0, initial);
  const points: SimulationPoint[] = [{ year: 0, invested: round(invested), value: round(value) }];

  for (let year = 1; year <= safeYears; year++) {
    for (let month = 0; month < 12; month++) {
      value = (value + safeMonthly) * (1 + monthlyRate);
      invested += safeMonthly;
    }
    points.push({ year, invested: round(invested), value: round(value) });
  }

  return {
    points,
    invested: round(invested),
    value: round(value),
    profit: round(value - invested),
  };
}

/**
 * Во сколько раз портфель обгонит простое накопление «под матрас».
 * Возвращает null, если сравнивать не с чем.
 */
export function growthMultiplier(result: SimulationResult): number | null {
  if (result.invested <= 0) return null;
  return Math.round((result.value / result.invested) * 10) / 10;
}
