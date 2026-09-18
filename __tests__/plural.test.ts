import { plural } from '@/utils/plural';

const QUESTIONS: [string, string, string] = ['вопрос', 'вопроса', 'вопросов'];

describe('plural', () => {
  it('склоняет единицы', () => {
    expect(plural(1, QUESTIONS)).toBe('вопрос');
    expect(plural(21, QUESTIONS)).toBe('вопрос');
    expect(plural(101, QUESTIONS)).toBe('вопрос');
  });

  it('склоняет двойки-четвёрки', () => {
    expect(plural(2, QUESTIONS)).toBe('вопроса');
    expect(plural(4, QUESTIONS)).toBe('вопроса');
    expect(plural(23, QUESTIONS)).toBe('вопроса');
  });

  it('склоняет пять и больше', () => {
    expect(plural(0, QUESTIONS)).toBe('вопросов');
    expect(plural(5, QUESTIONS)).toBe('вопросов');
    expect(plural(10, QUESTIONS)).toBe('вопросов');
    expect(plural(100, QUESTIONS)).toBe('вопросов');
  });

  it('помнит про исключения от 11 до 14', () => {
    expect(plural(11, QUESTIONS)).toBe('вопросов');
    expect(plural(12, QUESTIONS)).toBe('вопросов');
    expect(plural(14, QUESTIONS)).toBe('вопросов');
    expect(plural(111, QUESTIONS)).toBe('вопросов');
  });
});
