import React, { useEffect, useId, useRef, useState } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Circle, Defs, G, LinearGradient, Path, Rect, Stop, Text as SvgText } from 'react-native-svg';
import useFinancialStore from '@/hooks/useStore';
import { FINGUIDE_SKINS, FinGuideSkinId } from '@/constants/finGuide';

export type FinGuideMood = 'happy' | 'neutral' | 'thinking' | 'celebrate' | 'sad';

interface FinGuideProps {
  size?: number;
  mood?: FinGuideMood;
  /** Выключает циклические анимации (для списков и превью скинов). */
  animated?: boolean;
  /** Помахать рукой при появлении. */
  wave?: boolean;
  /** Поднять руку и указывать вверх-вправо (на кнопку над персонажем). */
  point?: boolean;
  /** По умолчанию — скин, выбранный пользователем. */
  skin?: FinGuideSkinId;
}

// Персонаж нарисован в системе координат 120×150; части анимируются отдельно,
// поэтому каждая лежит в своём слое с тем же viewBox.
const VIEW_W = 120;
const VIEW_H = 150;

/**
 * «ФинГид» по ТЗ: минималистичный гендерно-нейтральный персонаж в корпоративных
 * цветах, с экраном-визором вместо лица. Эмоции — пиктограммы на экране
 * (улыбка, вопросительный знак, мигающие глаза-звёзды при достижениях).
 * Анимации: покачивание головой, взмах рукой, лёгкое подпрыгивание.
 */
const FinGuide: React.FC<FinGuideProps> = ({ size = 96, mood = 'happy', animated = true, wave = false, point = false, skin }) => {
  const activeSkin = useFinancialStore((s) => s.activeSkin);
  const skinId = skin ?? activeSkin;
  const palette = FINGUIDE_SKINS.find((s) => s.id === skinId)?.palette ?? FINGUIDE_SKINS[0].palette;
  // id градиента уникален для каждого персонажа: на вебе id глобальные на весь
  // документ, а навигатор держит прошлые экраны смонтированными и скрытыми.
  // С общим id тело брало градиент из скрытого экрана — браузер его не рисует,
  // и тело становилось прозрачным. useId даёт «:r1:» — двоеточия в url(#…) не годятся.
  const instanceId = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const gradientId = `finguide-body-${skinId}-${instanceId}`;

  const bob = useRef(new Animated.Value(0)).current;
  const headTilt = useRef(new Animated.Value(0)).current;
  const arm = useRef(new Animated.Value(0)).current;
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    if (!animated) return;
    const loops = [
      Animated.loop(
        Animated.sequence([
          Animated.timing(bob, { toValue: 1, duration: mood === 'celebrate' ? 350 : 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(bob, { toValue: 0, duration: mood === 'celebrate' ? 350 : 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(headTilt, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(headTilt, { toValue: -1, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ),
    ];
    loops.forEach((l) => l.start());

    // Моргание раз в несколько секунд — «живой» экран.
    const blinkTimer = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 140);
    }, 3200);

    return () => {
      loops.forEach((l) => l.stop());
      clearInterval(blinkTimer);
    };
  }, [animated, mood, bob, headTilt]);

  useEffect(() => {
    if (point) {
      // Рука поднята и «тычет» в цель короткими толчками.
      const nudge = Animated.loop(
        Animated.sequence([
          Animated.timing(arm, { toValue: 1, duration: 260, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(arm, { toValue: 0, duration: 260, easing: Easing.in(Easing.ease), useNativeDriver: true }),
          Animated.delay(500),
        ])
      );
      arm.setValue(0);
      nudge.start();
      return () => nudge.stop();
    }
    if (!wave && mood !== 'celebrate') return;
    const swing = Animated.sequence([
      Animated.timing(arm, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.timing(arm, { toValue: -0.3, duration: 220, useNativeDriver: true }),
      Animated.timing(arm, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.timing(arm, { toValue: 0, duration: 260, useNativeDriver: true }),
    ]);
    const anim = mood === 'celebrate' ? Animated.loop(Animated.sequence([swing, Animated.delay(400)])) : swing;
    anim.start();
    return () => anim.stop();
  }, [wave, point, mood, arm]);

  const width = size;
  const height = (size * VIEW_H) / VIEW_W;
  const scale = size / VIEW_W;

  const bobY = bob.interpolate({ inputRange: [0, 1], outputRange: [0, (mood === 'celebrate' ? -8 : -4) * scale] });
  const tilt = headTilt.interpolate({ inputRange: [-1, 1], outputRange: [mood === 'thinking' ? '4deg' : '-5deg', mood === 'thinking' ? '12deg' : '5deg'] });
  // Рука свисает вниз; −135° разворачивает её вверх-вправо.
  const armRotate = point
    ? arm.interpolate({ inputRange: [0, 1], outputRange: ['-128deg', '-142deg'] })
    : arm.interpolate({ inputRange: [-1, 1], outputRange: ['30deg', '-40deg'] });

  const layer = { position: 'absolute' as const, left: 0, top: 0, width, height };

  // Правая рука — машет или указывает.
  const rightArm = (
    <Animated.View style={[layer, { transform: [{ rotate: armRotate }], transformOrigin: `${(88 / VIEW_W) * 100}% ${(88 / VIEW_H) * 100}%` }]}>
      <Svg width={width} height={height} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}>
        <Rect x={84} y={86} width={12} height={34} rx={6} fill={palette.bodyDark} transform="rotate(-12 90 88)" />
        <Circle cx={96} cy={118} r={6} fill={palette.helmet} />
      </Svg>
    </Animated.View>
  );

  return (
    <Animated.View style={{ width, height, transform: [{ translateY: bobY }] }}>
      {/* Тело, ноги и левая рука */}
      <Svg style={layer} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}>
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={palette.body} />
            <Stop offset="1" stopColor={palette.bodyDark} />
          </LinearGradient>
        </Defs>
        {/* ноги */}
        <Rect x={44} y={128} width={12} height={18} rx={6} fill={palette.bodyDark} />
        <Rect x={64} y={128} width={12} height={18} rx={6} fill={palette.bodyDark} />
        {/* левая рука */}
        <Rect x={22} y={88} width={12} height={34} rx={6} fill={palette.bodyDark} transform="rotate(12 28 90)" />
        <Circle cx={22} cy={120} r={6} fill={palette.helmet} />
        {/* корпус */}
        <Path d="M36 84 Q36 76 46 76 L74 76 Q84 76 84 84 L86 128 Q86 136 78 136 L42 136 Q34 136 34 128 Z" fill={`url(#${gradientId})`} />
        {/* лацканы и значок «₸» — корпоративный стиль */}
        <Path d="M52 76 L60 92 L68 76" fill="none" stroke={palette.helmet} strokeWidth={3} strokeLinejoin="round" />
        <Circle cx={72} cy={104} r={7} fill={palette.glow} opacity={0.9} />
        <SvgText x={72} y={108} fontSize={9} fontWeight="bold" fill={palette.visor} textAnchor="middle">
          ₸
        </SvgText>
      </Svg>

      {!point && rightArm}

      {/* Голова с визором — покачивается */}
      <Animated.View style={[layer, { transform: [{ rotate: tilt }], transformOrigin: `50% ${(76 / VIEW_H) * 100}%` }]}>
        <Svg width={width} height={height} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}>
          {/* антенна */}
          <Rect x={58} y={6} width={4} height={12} rx={2} fill={palette.helmet} />
          <Circle cx={60} cy={6} r={5} fill={palette.glow} />
          {/* шлем */}
          <Rect x={22} y={16} width={76} height={62} rx={24} fill={palette.helmet} />
          <Rect x={16} y={38} width={8} height={18} rx={4} fill={palette.body} />
          <Rect x={96} y={38} width={8} height={18} rx={4} fill={palette.body} />
          {/* экран-визор */}
          <Rect x={30} y={26} width={60} height={42} rx={16} fill={palette.visor} />
          <Rect x={36} y={30} width={22} height={6} rx={3} fill="#FFFFFF" opacity={0.12} />
          <Face mood={mood} blink={blink} color={palette.glow} />
        </Svg>
      </Animated.View>

      {/* Указывающая рука рисуется поверх шлема */}
      {point && rightArm}
    </Animated.View>
  );
};

/** Пиктограммы эмоций на экране. Координаты — внутри визора (30..90, 26..68). */
const Face = ({ mood, blink, color }: { mood: FinGuideMood; blink: boolean; color: string }) => {
  const stroke = { stroke: color, strokeWidth: 4, strokeLinecap: 'round' as const, fill: 'none' };

  if (mood === 'celebrate') {
    // Мигающие глаза-звёзды при достижении целей.
    const star = (cx: number, cy: number, r: number) =>
      `M${cx} ${cy - r} L${cx + r * 0.3} ${cy - r * 0.3} L${cx + r} ${cy} L${cx + r * 0.3} ${cy + r * 0.3} L${cx} ${cy + r} L${cx - r * 0.3} ${cy + r * 0.3} L${cx - r} ${cy} L${cx - r * 0.3} ${cy - r * 0.3} Z`;
    const r = blink ? 5 : 8;
    return (
      <G>
        <Path d={star(46, 43, r)} fill={color} />
        <Path d={star(74, 43, r)} fill={color} />
        <Path d="M48 56 Q60 66 72 56" {...stroke} />
      </G>
    );
  }

  const eyes = blink ? (
    <G>
      <Path d="M40 44 L52 44" {...stroke} />
      <Path d="M68 44 L80 44" {...stroke} />
    </G>
  ) : mood === 'happy' ? (
    <G>
      <Path d="M40 46 Q46 38 52 46" {...stroke} />
      <Path d="M68 46 Q74 38 80 46" {...stroke} />
    </G>
  ) : mood === 'sad' ? (
    <G>
      <Path d="M40 42 Q46 48 52 42" {...stroke} />
      <Path d="M68 42 Q74 48 80 42" {...stroke} />
    </G>
  ) : (
    <G>
      <Circle cx={46} cy={44} r={4} fill={color} />
      <Circle cx={74} cy={44} r={4} fill={color} />
    </G>
  );

  return (
    <G>
      {mood === 'thinking' ? (
        <G>
          <Circle cx={44} cy={44} r={4} fill={color} />
          <SvgText x={72} y={54} fontSize={22} fontWeight="bold" fill={color} textAnchor="middle">
            ?
          </SvgText>
          <Path d="M42 58 L54 58" {...stroke} />
        </G>
      ) : (
        <G>
          {eyes}
          {mood === 'happy' && <Path d="M48 55 Q60 64 72 55" {...stroke} />}
          {mood === 'neutral' && <Path d="M50 58 L70 58" {...stroke} />}
          {mood === 'sad' && <Path d="M48 62 Q60 54 72 62" {...stroke} />}
        </G>
      )}
    </G>
  );
};

export default FinGuide;
