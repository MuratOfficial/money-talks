import React from 'react';
import { Text, TouchableOpacity, View, ViewStyle, StyleProp } from 'react-native';
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
 * персонаж слева, заголовок и текст справа. Фон и рамка заданы явно, чтобы
 * карточка не сливалась ни с белым экраном, ни с серыми плитками под ней.
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
        {
          flexDirection: 'row',
          alignItems: 'center',
          padding: 12,
          paddingRight: onClose ? 34 : 12,
          borderRadius: 16,
          borderWidth: 1,
          backgroundColor: palette.background,
          borderColor: palette.border,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: isDark ? 0.4 : 0.12,
          shadowRadius: 14,
          elevation: 8,
        },
        style,
      ]}
    >
      {showGuide && <FinGuide size={guideSize} mood={mood} wave={wave} />}

      <View className={`flex-1 ${showGuide ? 'ml-3' : ''}`}>
        <Text className="text-[#4CAF50] text-xs mb-0.5 font-['SFProDisplaySemiBold']">{title}</Text>
        <Text style={{ color: palette.text }} className="text-sm leading-5 font-['SFProDisplayRegular']">
          {message}
        </Text>

        {action && (
          <TouchableOpacity
            onPress={action.onPress}
            activeOpacity={Opacity.press}
            className="mt-2.5 rounded-xl py-2 px-3.5 self-start flex-row items-center"
            style={{ backgroundColor: Colors.primary }}
          >
            <Text className="text-white text-xs mr-1 font-['SFProDisplaySemiBold']">{action.label}</Text>
            <Ionicons name="arrow-forward" size={12} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      {onClose && (
        <TouchableOpacity
          onPress={onClose}
          activeOpacity={Opacity.press}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 24,
            height: 24,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: palette.closeBackground,
          }}
        >
          <Ionicons name="close" size={14} color={palette.muted} />
        </TouchableOpacity>
      )}
    </View>
  );
};

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
