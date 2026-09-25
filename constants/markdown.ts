// Единые стили Markdown для подсказок и чата с ФинГидом.
//
// Важно: в react-native-markdown-display абзац — это View с flexDirection
// 'row', а текст внутри лежит в отдельном Text ('textgroup'). Без flexShrink
// этот Text сохраняет свою «естественную» ширину, поэтому длинное слово или
// ссылка вылезали за границу пузыря и карточки. flexShrink: 1 возвращает
// переносы, поэтому его нельзя убирать.

import { Colors } from './design';

interface MarkdownStyleOptions {
  isDark: boolean;
  /** Плотнее отступы — для пузырей чата. */
  compact?: boolean;
}

export function markdownStyles({ isDark, compact = false }: MarkdownStyleOptions) {
  const text = isDark ? '#D1D5DB' : '#374151';
  const heading = isDark ? '#FFFFFF' : '#11181C';
  const surface = isDark ? '#374151' : '#E5E7EB';
  const gap = compact ? 6 : 8;

  return {
    body: { color: text, fontSize: 16, lineHeight: 23, fontFamily: 'SFProDisplayRegular' },
    // Без этого длинные слова и ссылки не переносятся (см. комментарий выше).
    // minWidth: 0 нужен из-за веба: там у текстового блока min-width: auto,
    // и он отказывается сжиматься до ширины пузыря.
    textgroup: { flexShrink: 1, minWidth: 0 },
    text: { flexShrink: 1 },
    paragraph: { color: text, fontSize: 16, lineHeight: 23, marginTop: 0, marginBottom: gap, width: '100%' as const },
    heading1: { color: heading, fontSize: compact ? 18 : 22, fontFamily: 'SFProDisplaySemiBold', marginBottom: gap, flexShrink: 1, minWidth: 0 },
    heading2: { color: heading, fontSize: compact ? 17 : 20, fontFamily: 'SFProDisplaySemiBold', marginBottom: gap, flexShrink: 1, minWidth: 0 },
    heading3: { color: heading, fontSize: compact ? 16 : 18, fontFamily: 'SFProDisplaySemiBold', marginBottom: 6, flexShrink: 1, minWidth: 0 },
    strong: { color: heading, fontFamily: 'SFProDisplaySemiBold', fontWeight: '600' as const },
    em: { color: Colors.primary, fontStyle: 'italic' as const },
    link: { color: Colors.primary, textDecorationLine: 'underline' as const },
    bullet_list: { marginBottom: gap },
    ordered_list: { marginBottom: gap },
    list_item: { color: text, fontSize: 16, lineHeight: 23, marginBottom: 4, flexShrink: 1, minWidth: 0 },
    bullet_list_icon: { marginLeft: 0, marginRight: 8, color: Colors.primary },
    ordered_list_icon: { marginLeft: 0, marginRight: 8, color: Colors.primary },
    code_inline: { backgroundColor: surface, color: heading, paddingHorizontal: 4, paddingVertical: 2, borderRadius: 4 },
    code_block: { backgroundColor: surface, color: heading, padding: 12, borderRadius: 8, marginBottom: gap },
    fence: { backgroundColor: surface, color: heading, padding: 12, borderRadius: 8, marginBottom: gap },
    blockquote: {
      backgroundColor: surface,
      borderLeftWidth: 4,
      borderLeftColor: Colors.primary,
      paddingLeft: 12,
      paddingVertical: 8,
      marginBottom: gap,
      marginLeft: 0,
    },
    hr: { backgroundColor: surface, height: 1, marginVertical: gap },
  };
}
