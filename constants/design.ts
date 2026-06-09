// constants/design.ts
// Единая дизайн-система money-talks: токены отступов, типографики, радиусов,
// анимаций и прозрачности. Источник правды для согласованного, «плавного» UI.
//
// Использование:
//   import { ui, Motion, Opacity, Colors } from '@/constants/design';
//   <View className={ui.section}> ... </View>
//   <TouchableOpacity activeOpacity={Opacity.press}> ... </TouchableOpacity>

/** Длительности анимаций (мс) — для плавных, не резких переходов. */
export const Motion = {
  duration: {
    fast: 150,
    base: 280,
    slow: 420,
  },
  /** Базовая задержка для каскадного (staggered) появления элементов списка. */
  stagger: 45,
} as const;

/** Уровни прозрачности — единое поведение нажатий и неактивных состояний. */
export const Opacity = {
  press: 0.7, // activeOpacity для TouchableOpacity
  disabled: 0.5,
  subtle: 0.6,
} as const;

/** Фирменные цвета. Основной зелёный — единый бренд-акцент. */
export const Colors = {
  primary: '#4CAF50',
  primaryDark: '#388E3C',
  success: '#4CAF50',
} as const;

/**
 * className-пресеты (NativeWind) — единые отступы, радиусы и типографика.
 * Шкала отступов: field (между полями) = mb-4, section (между блоками) = mb-6.
 * Радиусы: input = xl, card = 2xl. Шрифты: SF Pro Display.
 */
export const ui = {
  // Контейнеры
  screen: 'flex-1',
  container: 'px-4',

  // Вертикальные отступы (единая шкала)
  field: 'mb-4',
  section: 'mb-6',

  // Карточки и поля ввода
  card: 'p-4 rounded-2xl',
  input: "rounded-xl px-4 py-3 text-base font-['SFProDisplayRegular']",

  // Типографика
  h1: "text-xl font-['SFProDisplaySemiBold']",
  h2: "text-lg font-['SFProDisplaySemiBold']",
  label: "text-sm font-['SFProDisplayRegular'] mb-2",
  body: "text-sm font-['SFProDisplayRegular']",
  caption: "text-xs font-['SFProDisplayRegular']",

  // Радиусы (когда нужно отдельно)
  radius: {
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    full: 'rounded-full',
  },
} as const;
