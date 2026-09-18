/**
 * Русское склонение по числу: plural(3, ['вопрос', 'вопроса', 'вопросов']).
 * Формы — для 1, для 2–4 и для 5+ соответственно.
 */
export function plural(count: number, forms: [string, string, string]): string {
  const n = Math.abs(count) % 100;
  const n1 = n % 10;
  if (n > 10 && n < 20) return forms[2];
  if (n1 > 1 && n1 < 5) return forms[1];
  if (n1 === 1) return forms[0];
  return forms[2];
}
