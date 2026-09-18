import {
  CLOSE_VELOCITY,
  DEFAULT_CLOSE_DISTANCE,
  sheetDragOffset,
  shouldCloseSheet,
} from '@/utils/sheetDrag';

describe('sheetDragOffset', () => {
  it('тянет лист вниз за пальцем', () => {
    expect(sheetDragOffset(0)).toBe(0);
    expect(sheetDragOffset(75)).toBe(75);
  });

  it('не поднимает лист выше открытого положения', () => {
    expect(sheetDragOffset(-40)).toBe(0);
  });
});

describe('shouldCloseSheet', () => {
  it('закрывает, если протянули дальше порога', () => {
    expect(shouldCloseSheet(DEFAULT_CLOSE_DISTANCE + 1, 0)).toBe(true);
  });

  it('возвращает лист на место при коротком движении', () => {
    expect(shouldCloseSheet(30, 0.1)).toBe(false);
    expect(shouldCloseSheet(DEFAULT_CLOSE_DISTANCE, 0)).toBe(false);
  });

  it('закрывает при резком смахивании вниз, даже если путь короткий', () => {
    expect(shouldCloseSheet(20, CLOSE_VELOCITY + 0.2)).toBe(true);
  });

  it('не закрывает при движении вверх', () => {
    expect(shouldCloseSheet(-200, -2)).toBe(false);
  });

  it('учитывает свой порог, если его передали', () => {
    expect(shouldCloseSheet(60, 0, 50)).toBe(true);
    expect(shouldCloseSheet(60, 0, 200)).toBe(false);
  });
});
