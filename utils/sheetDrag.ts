/** Насколько нужно протянуть шторку вниз по умолчанию, чтобы она закрылась. */
export const DEFAULT_CLOSE_DISTANCE = 110;

/** Скорость смахивания (px/мс), после которой шторка закрывается независимо от пути. */
export const CLOSE_VELOCITY = 0.8;

/** Сдвиг листа за пальцем: вверх шторку не тянем, только вниз. */
export function sheetDragOffset(dy: number): number {
  return Math.max(0, dy);
}

/**
 * Отпустили палец: закрывать шторку или вернуть на место?
 * Скорость — в px/мс (у жестов она приходит в px/с, её нужно поделить на 1000).
 */
export function shouldCloseSheet(
  dy: number,
  vy: number,
  closeDistance: number = DEFAULT_CLOSE_DISTANCE
): boolean {
  // Либо протянули достаточно далеко, либо резко смахнули вниз.
  return dy > closeDistance || vy > CLOSE_VELOCITY;
}
