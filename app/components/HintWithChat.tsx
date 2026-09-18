import React, { useState, useRef, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
  useWindowDimensions,
  Animated,
  Easing,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';
import ChatGPTFeature from './ChatGPTFeature';
import VideoHintPlayer from './VideoHintPlayer';
import useFinancialStore from '@/hooks/useStore';
import SheetGrabber from './SheetGrabber';
import { Colors, Opacity } from '@/constants/design';
import { markdownStyles } from '@/constants/markdown';
import FinGuide from './FinGuide';
import { cardPalette } from './FinGuideCard';

interface InfoModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  content: string;
  linkUrl?: string;
  linkText?: string;
  /** URL видеоурока (медиафайл). Если задан — показываем встроенный плеер. */
  videoUrl?: string | null;
  /** Подпись к видео. */
  videoTitle?: string | null;
  enableChatGPT?: boolean;
}

const styles = StyleSheet.create({
  block: { marginTop: 24, paddingTop: 16, borderTopWidth: 1 },
});

const InfoModal: React.FC<InfoModalProps> = ({
  visible,
  onClose,
  title,
  content,
  linkUrl,
  linkText,
  videoUrl,
  videoTitle,
  enableChatGPT = true
}) => {
  // Нижняя системная панель Android перекрывает контент (edge-to-edge с API 35+),
  // поэтому шторка сама добавляет отступ на её высоту.
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const { theme } = useFinancialStore();
  const [showChat, setShowChat] = useState(false);
  const chatButtonAnim = useRef(new Animated.Value(1)).current;

  // Анимация шторки: панель выезжает снизу, затемнение фона жёстко
  // привязано к её позиции (один источник анимации — без рассинхрона/«мути»)
  const translateY = useRef(new Animated.Value(screenHeight)).current;
  const [rendered, setRendered] = useState(visible);

  const backdropOpacity = translateY.interpolate({
    inputRange: [0, screenHeight],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    if (visible) {
      setRendered(true);
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: screenHeight,
        duration: 250,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setRendered(false);
      });
    }
  }, [visible]);


  const isDark = theme === 'dark';
  const dividerColor = isDark ? '#374151' : '#D1D5DB';
  const iconColor = isDark ? 'white' : '#11181C';
  const askCard = cardPalette(isDark);

  const handleLinkPress = async () => {
    if (!linkUrl) return;
    const supported = await Linking.canOpenURL(linkUrl);
    if (supported) {
      await Linking.openURL(linkUrl);
    }
  };

  const handleChatPress = () => {
    // Анимация кнопки
    Animated.sequence([
      Animated.timing(chatButtonAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(chatButtonAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    setShowChat(true);
  };

  // Проверка наличия контента
  const safeContent = content || '';

  return (
    <Modal
      visible={rendered}
      transparent
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Animated.View
          style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)', opacity: backdropOpacity }]}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={onClose}
          />
        </Animated.View>

        <Animated.View
          style={{
            transform: [{ translateY }],
            backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            // Шторка не выше свободного места под строкой состояния.
            maxHeight: screenHeight - insets.top - 12,
            paddingHorizontal: 16,
            paddingTop: 24,
            paddingBottom: 16 + insets.bottom,
          }}>
          {/* Ручка и шапка: свайп вниз и нажатие закрывают шторку */}
          <SheetGrabber translateY={translateY} onClose={onClose}>
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: dividerColor,
            }}
          >
            <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
              <Ionicons name="close" size={24} color={iconColor} />
            </TouchableOpacity>
            {/* Заголовки подсказок приходят из БД и бывают длинными: без flex-1
                они выдавливали кнопки из шапки. */}
            <Text
              style={{
                flex: 1,
                marginHorizontal: 12,
                textAlign: 'center',
                fontSize: 16,
                color: isDark ? '#FFFFFF' : '#11181C',
                fontFamily: 'SFProDisplaySemiBold',
              }}
              numberOfLines={2}
            >
              {title}
            </Text>
            {enableChatGPT && (
              <Animated.View
                style={{
                  transform: [{ scale: chatButtonAnim }],
                }}
              >
                <TouchableOpacity
                  onPress={handleChatPress}
                  style={{ padding: 9, borderRadius: 999, backgroundColor: Colors.primary }}
                  activeOpacity={Opacity.press}
                  accessibilityLabel="Спросить ФинГида"
                >
                  <Ionicons name="chatbubbles" size={20} color="white" />
                </TouchableOpacity>
              </Animated.View>
            )}
            {!enableChatGPT && <View style={{ width: 24 }} />}
          </View>
          </SheetGrabber>

          <ScrollView 
            style={{ flexShrink: 1, marginBottom: 16 }}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={{ paddingBottom: 10 }}
          >
            <View style={{ padding: 16 }}>
              {/* Показываем Markdown только если есть контент */}
              {safeContent ? (
                <Markdown style={markdownStyles({ isDark })}>
                  {safeContent}
                </Markdown>
              ) : (
                <Text style={{ color: askCard.muted, textAlign: 'center', paddingVertical: 16, fontFamily: 'SFProDisplayRegular' }}>
                  Нет доступного контента
                </Text>
              )}

              {/* Видеоурок: встроенный плеер (приоритетно) или ссылка-фолбэк */}
              {videoUrl ? (
                <View style={[styles.block, { borderTopColor: dividerColor }]}>
                  <VideoHintPlayer
                    uri={videoUrl}
                    title={videoTitle || linkText || 'Видеоурок'}
                    isDark={isDark}
                  />
                </View>
              ) : linkUrl ? (
                <View style={[styles.block, { borderTopColor: dividerColor }]}>
                  <Text style={{ color: askCard.muted, fontSize: 14, marginBottom: 12, fontFamily: 'SFProDisplayRegular' }}>
                    Ссылка на видеоурок:
                  </Text>

                  <TouchableOpacity
                    onPress={handleLinkPress}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 12,
                      borderRadius: 12,
                      backgroundColor: isDark ? '#374151' : '#E5E7EB',
                    }}
                    activeOpacity={Opacity.press}
                  >
                    <Ionicons name="link" size={16} color={isDark ? "#9CA3AF" : "#6B7280"} />
                    <Text style={{ flex: 1, marginHorizontal: 8, fontSize: 14, color: Colors.primary, fontFamily: 'SFProDisplayRegular' }} numberOfLines={1}>
                      {linkText || linkUrl}
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color={isDark ? "#9CA3AF" : "#6B7280"} />
                  </TouchableOpacity>
                </View>
              ) : null}

              {enableChatGPT && (
                <TouchableOpacity
                  onPress={handleChatPress}
                  activeOpacity={Opacity.press}
                  style={{
                    marginTop: 24,
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderRadius: 16,
                    padding: 14,
                    backgroundColor: askCard.background,
                    borderWidth: 1,
                    borderColor: askCard.border,
                  }}
                >
                  <FinGuide size={48} mood="thinking" />
                  <View style={{ flex: 1, marginLeft: 12, marginRight: 10 }}>
                    <Text style={{ color: isDark ? '#FFFFFF' : '#11181C', fontSize: 14, fontFamily: 'SFProDisplaySemiBold' }}>
                      Остались вопросы?
                    </Text>
                    <Text style={{ color: askCard.muted, fontSize: 12, lineHeight: 17, marginTop: 2, fontFamily: 'SFProDisplayRegular' }}>
                      Спроси ФинГида — объясню простыми словами
                    </Text>
                  </View>
                  <View style={{ width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary }}>
                    <Ionicons name="chatbubbles" size={16} color="#FFFFFF" />
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </Animated.View>
      </View>

      {/* ChatGPT Feature Modal - передаем контент как контекст */}
      {enableChatGPT && (
        <ChatGPTFeature
          visible={showChat}
          onClose={() => setShowChat(false)}
          title={title}
          context={safeContent}
        />
      )}
    </Modal>
  );
};

export default InfoModal;