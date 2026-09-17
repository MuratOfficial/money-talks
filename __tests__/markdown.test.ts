import { markdownStyles } from '@/constants/markdown';

describe('markdownStyles', () => {
  it('позволяет тексту сжиматься, иначе длинные слова вылезают за пузырь', () => {
    const styles = markdownStyles({ isDark: false });
    // Абзац в react-native-markdown-display — flex-строка, а текст внутри —
    // отдельный Text. Без этих двух свойств он не переносится по ширине.
    expect(styles.textgroup.flexShrink).toBe(1);
    expect(styles.textgroup.minWidth).toBe(0);
    expect(styles.paragraph.width).toBe('100%');
  });

  it('в компактном режиме отступы меньше', () => {
    const wide = markdownStyles({ isDark: false });
    const compact = markdownStyles({ isDark: false, compact: true });
    expect(compact.paragraph.marginBottom).toBeLessThan(wide.paragraph.marginBottom);
    expect(compact.heading1.fontSize).toBeLessThan(wide.heading1.fontSize);
  });

  it('в тёмной теме текст светлее, чем в светлой', () => {
    expect(markdownStyles({ isDark: true }).body.color).not.toBe(markdownStyles({ isDark: false }).body.color);
  });
});
