import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle, StyleProp } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useFinancialStore from '@/hooks/useStore';
import { Colors, Opacity } from '@/constants/design';
import FinGuide, { FinGuideMood } from './FinGuide';

interface FinGuideCardProps {
  message: string;
  mood?: FinGuideMood;
  title?: string;
  action?: { label: string; onPress: () => void };
  onClose?: () => void;
  /** Персонаж помахал рукой при появлении карточки. */
  wave?: boolean;
  guideSize?: number;
  /** false — без персонажа (когда он стоит рядом с карточкой). */
  showGuide?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Карточка ФинГида в том же стиле, что баннер челленджей на главной:
 * персонаж слева, заголовок и текст справа. Отступы, фон и рамка заданы
 * числами, а не классами: карточка не должна ни сливаться с фоном экрана,
 * ни прижимать текст к своей границе.
 */
const FinGuideCard: React.FC<FinGuideCardProps> = ({
  message,
  mood = 'happy',
  title = 'ФинГид',
  action,
  onClose,
  wave = false,
  guideSize = 56,
  showGuide = true,
  style,
}) => {
  const isDark = useFinancialStore((s) => s.theme) === 'dark';
  const palette = cardPalette(isDark);

  return (
    <View
      style={[
        styles.card,
        {
          // Справа оставляем место под крестик, чтобы текст не заходил под него.
          paddingRight: onClose ? 44 : PADDING,
          backgroundColor: palette.background,
          borderColor: palette.border,
          shadowOpacity: isDark ? 0.4 : 0.12,
        },
        style,
      ]}
    >
      {showGuide && <FinGuide size={guideSize} mood={mood} wave={wave} />}

      <View style={[styles.content, showGuide && { marginLeft: 12 }]}>
        <Text style={styles.title}>{title}</Text>
        <Text style={[styles.message, { color: palette.text }]}>{message}</Text>

        {action && (
          <TouchableOpacity onPress={action.onPress} activeOpacity={Opacity.press} style={styles.action}>
            <Text style={styles.actionLabel}>{action.label}</Text>
            <Ionicons name="arrow-forward" size={13} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      {onClose && (
        <TouchableOpacity
          onPress={onClose}
          activeOpacity={Opacity.press}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Закрыть подсказку"
          style={[styles.close, { backgroundColor: palette.closeBackground }]}
        >
          <Ionicons name="close" size={14} color={palette.muted} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const PADDING = 14;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: PADDING,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 8,
  },
  content: { flex: 1 },
  title: { color: Colors.primary, fontSize: 13, marginBottom: 3, fontFamily: 'SFProDisplaySemiBold' },
  message: { fontSize: 15, lineHeight: 21, fontFamily: 'SFProDisplayRegular' },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: Colors.primary,
  },
  actionLabel: { color: '#FFFFFF', fontSize: 15, marginRight: 6, fontFamily: 'SFProDisplaySemiBold' },
  close: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const cardPalette = (isDark: boolean) =>
  isDark
    ? {
        background: '#1A241B',
        border: 'rgba(76, 175, 80, 0.35)',
        text: '#F3F4F6',
        muted: '#9CA3AF',
        closeBackground: 'rgba(255, 255, 255, 0.1)',
      }
    : {
        background: '#F2F9F2',
        border: 'rgba(76, 175, 80, 0.35)',
        text: '#1F2937',
        muted: '#6B7280',
        closeBackground: 'rgba(0, 0, 0, 0.06)',
      };

export default FinGuideCard;
