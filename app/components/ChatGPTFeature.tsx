import React, { useState, useRef, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';
import { ChatGPTMessage, sendChatGPTMessage } from '@/services/api';
import useFinancialStore from '@/hooks/useStore';
import { Colors, Opacity } from '@/constants/design';
import { markdownStyles } from '@/constants/markdown';
import FinGuide from './FinGuide';
import FadeInView from './FadeInView';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  /** Вопрос, на который не пришёл ответ, — в историю для ИИ не попадает. */
  failed?: boolean;
  /** Сообщение об ошибке с кнопкой «Повторить» этот вопрос. */
  failedQuestion?: string;
}

interface ChatGPTFeatureProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  context?: string; // Контекст из текущего урока
}

const SUGGESTIONS = ['Объясни простыми словами', 'Приведи пример из жизни', 'С чего мне начать?'];

const chatColors = (isDark: boolean) =>
  isDark
    ? {
        sheet: '#111312',
        header: '#161A17',
        border: 'rgba(255,255,255,0.08)',
        botBubble: '#1F2A20',
        text: '#F3F4F6',
        muted: '#9CA3AF',
        input: '#1C1F1D',
        chip: 'rgba(76,175,80,0.14)',
        avatar: '#1A241B',
      }
    : {
        sheet: '#FFFFFF',
        header: '#FFFFFF',
        border: '#E5E7EB',
        botBubble: '#F2F9F2',
        text: '#1F2937',
        muted: '#6B7280',
        input: '#F3F4F6',
        chip: 'rgba(76,175,80,0.1)',
        avatar: '#F2F9F2',
      };

const ChatGPTFeature: React.FC<ChatGPTFeatureProps> = ({ visible, onClose, title, context }) => {
  // Нижняя системная панель Android перекрывает контент (edge-to-edge с API 35+),
  // поэтому шторка сама добавляет отступ на её высоту.
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const isDark = useFinancialStore((s) => s.theme) === 'dark';
  const c = chatColors(isDark);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Шторка выезжает снизу, затемнение привязано к её позиции (как в HintWithChat).
  const translateY = useRef(new Animated.Value(screenHeight)).current;
  const [rendered, setRendered] = useState(visible);

  useEffect(() => {
    if (visible) {
      setRendered(true);
      Animated.timing(translateY, { toValue: 0, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    } else {
      Animated.timing(translateY, { toValue: screenHeight, duration: 240, easing: Easing.in(Easing.cubic), useNativeDriver: true }).start(
        ({ finished }) => finished && setRendered(false)
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const backdropOpacity = translateY.interpolate({ inputRange: [0, screenHeight], outputRange: [1, 0], extrapolate: 'clamp' });

  const sendMessage = async (raw: string = inputText) => {
    const text = raw.trim();
    if (!text || isLoading) return;

    // Сервер ждёт всю переписку: и вопросы, и ответы. Раньше в историю попадали
    // только ответы, и ИИ не помнил, о чём его спрашивали.
    const conversationHistory: ChatGPTMessage[] = messages
      .filter((m) => !m.failed && !m.failedQuestion)
      .map((m) => ({ role: m.isUser ? 'user' : 'assistant', content: m.text }));

    const now = Date.now();
    setMessages((prev) => [
      // Неудачная попытка заменяется новой, чтобы не копить ошибки в ленте.
      ...prev.filter((m) => !m.failed && !m.failedQuestion),
      { id: `${now}`, text, isUser: true, timestamp: new Date() },
    ]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await sendChatGPTMessage({ message: text, context, conversationHistory });
      setMessages((prev) => [...prev, { id: `${now + 1}`, text: response.response, isUser: false, timestamp: new Date() }]);
    } catch (error) {
      console.error('ChatGPT Error:', error);
      const limitReached = error instanceof Error && /limit|429/i.test(error.message);
      setMessages((prev) => [
        // Вопрос остаётся в ленте; при повторе он заменится новой попыткой.
        ...prev.map((m) => (!limitReached && m.id === `${now}` ? { ...m, failed: true } : m)),
        {
          id: `${now + 1}`,
          text: limitReached
            ? 'На сегодня вопросы закончились — возвращайся завтра, продолжим 🙌'
            : 'Не получилось связаться с сервером. Проверь интернет и попробуй ещё раз.',
          isUser: false,
          timestamp: new Date(),
          failedQuestion: limitReached ? undefined : text,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

  const handleClose = () => {
    setMessages([]);
    setInputText('');
    onClose();
  };

  const confirmClear = () => {
    if (messages.length === 0) return;
    Alert.alert('Очистить чат?', 'Вся история разговора будет удалена.', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Очистить', style: 'destructive', onPress: () => setMessages([]) },
    ]);
  };


  const canSend = !!inputText.trim() && !isLoading;

  return (
    <Modal
      visible={rendered}
      transparent
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)', opacity: backdropOpacity }]}>
          <Pressable style={{ flex: 1 }} onPress={handleClose} />
        </Animated.View>

        <Animated.View
          style={{
            height: '88%',
            // Android: со statusBarTranslucent модалка занимает всё окно, поэтому
            // сверху оставляем строку состояния свободной.
            maxHeight: screenHeight - insets.top - 8,
            backgroundColor: c.sheet,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            overflow: 'hidden',
            transform: [{ translateY }],
          }}
        >
          {/* Header */}
          <View style={{ backgroundColor: c.header, borderBottomWidth: 1, borderBottomColor: c.border }}>
            <View style={{ alignItems: 'center', paddingTop: 8 }}>
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: isDark ? '#4B5563' : '#D1D5DB' }} />
            </View>
            <View style={styles.headerRow}>
              <View
                style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.avatar, overflow: 'hidden', alignItems: 'center' }}
              >
                <View style={{ marginTop: 2 }}>
                  <FinGuide size={38} mood={isLoading ? 'thinking' : 'happy'} />
                </View>
              </View>
              <View style={styles.headerTexts}>
                <Text style={[styles.headerTitle, { color: c.text }]}>ФинГид</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                  <View style={styles.onlineDot} />
                  <Text style={[styles.headerStatus, { color: c.muted }]} numberOfLines={1}>
                    {isLoading ? 'печатает…' : `ИИ-помощник · ${title}`}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={confirmClear} activeOpacity={Opacity.press} style={{ padding: 8 }} disabled={messages.length === 0}>
                <Ionicons name="trash-outline" size={20} color={messages.length ? c.muted : c.border} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleClose} activeOpacity={Opacity.press} style={{ padding: 8 }}>
                <Ionicons name="close" size={24} color={c.text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Messages */}
          <ScrollView
            ref={scrollViewRef}
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16, flexGrow: 1 }}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {messages.length === 0 && !isLoading && (
              <FadeInView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 24 }} offset={16}>
                <FinGuide size={110} mood="happy" wave />
                <Text style={[styles.greeting, { color: c.text }]}>Привет! Я ФинГид 👋</Text>
                <Text style={[styles.greetingHint, { color: c.muted }]}>
                  Спрашивай всё о теме «{title}» — объясню простыми словами
                </Text>
                <View style={styles.chipsRow}>
                  {SUGGESTIONS.map((s, i) => (
                    <FadeInView key={s} delay={200 + i * 80} offset={8}>
                      <TouchableOpacity
                        onPress={() => sendMessage(s)}
                        activeOpacity={Opacity.press}
                        style={[styles.chip, { backgroundColor: c.chip }]}
                      >
                        <Text style={styles.chipText}>{s}</Text>
                      </TouchableOpacity>
                    </FadeInView>
                  ))}
                </View>
              </FadeInView>
            )}

            {messages.map((message) =>
              message.isUser ? (
                <FadeInView key={message.id} offset={10} duration={220} style={{ alignItems: 'flex-end', marginBottom: 12 }}>
                  <View style={styles.userBubble}>
                    <Text style={styles.userText}>{message.text}</Text>
                    <Text style={[styles.time, styles.userTime]}>{formatTime(message.timestamp)}</Text>
                  </View>
                </FadeInView>
              ) : (
                <FadeInView key={message.id} offset={10} duration={260} style={styles.botRow}>
                  <BotAvatar background={c.avatar} failed={!!message.failedQuestion} />
                  <View
                    style={[
                      styles.botBubble,
                      { backgroundColor: message.failedQuestion ? (isDark ? '#2A1A1A' : '#FEF2F2') : c.botBubble },
                    ]}
                  >
                    {message.failedQuestion ? (
                      <Text style={[styles.bodyText, { color: c.text }]}>{message.text}</Text>
                    ) : (
                      <Markdown style={markdownStyles({ isDark, compact: true })}>{message.text}</Markdown>
                    )}
                    {message.failedQuestion && (
                      <TouchableOpacity
                        onPress={() => sendMessage(message.failedQuestion)}
                        activeOpacity={Opacity.press}
                        style={styles.retry}
                      >
                        <Ionicons name="refresh" size={13} color="#FFFFFF" />
                        <Text style={styles.retryLabel}>Повторить</Text>
                      </TouchableOpacity>
                    )}
                    <Text style={[styles.time, { color: c.muted }]}>{formatTime(message.timestamp)}</Text>
                  </View>
                </FadeInView>
              )
            )}

            {isLoading && (
              <FadeInView offset={10} duration={220} style={styles.botRow}>
                <BotAvatar background={c.avatar} thinking />
                <View style={[styles.typingBubble, { backgroundColor: c.botBubble }]}>
                  <TypingDots color={Colors.primary} />
                </View>
              </FadeInView>
            )}
          </ScrollView>

          {/* Input */}
          <View style={[styles.inputBar, { paddingBottom: 12 + insets.bottom, borderTopColor: c.border, backgroundColor: c.header }]}>
            <View style={[styles.inputRow, { backgroundColor: c.input }]}>
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder="Спроси ФинГида…"
                placeholderTextColor={c.muted}
                style={[styles.input, { color: c.text }]}
                multiline
                maxLength={500}
                onSubmitEditing={() => sendMessage()}
                returnKeyType="send"
                editable={!isLoading}
              />
              <SendButton enabled={canSend} onPress={() => sendMessage()} disabledColor={isDark ? '#374151' : '#D1D5DB'} />
            </View>
            <Text style={[styles.note, { color: c.muted }]}>ФинГид может ошибаться. Проверяй важную информацию.</Text>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

/** Маленький ФинГид рядом с его сообщениями. */
const BotAvatar = ({ background, thinking = false, failed = false }: { background: string; thinking?: boolean; failed?: boolean }) => (
  <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: background, overflow: 'hidden', alignItems: 'center' }}>
    <View style={{ marginTop: 1 }}>
      <FinGuide size={26} mood={failed ? 'sad' : thinking ? 'thinking' : 'happy'} animated={thinking} />
    </View>
  </View>
);

/** «Печатает…» — три точки подпрыгивают по очереди. */
const TypingDots = ({ color }: { color: string }) => {
  const dots = useRef([0, 1, 2].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const loops = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(dot, { toValue: 1, duration: 280, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 280, easing: Easing.in(Easing.ease), useNativeDriver: true }),
          Animated.delay((2 - i) * 150 + 200),
        ])
      )
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [dots]);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', height: 12 }}>
      {dots.map((dot, i) => (
        <Animated.View
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: 3.5,
            marginHorizontal: 2.5,
            backgroundColor: color,
            opacity: dot.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }),
            transform: [{ translateY: dot.interpolate({ inputRange: [0, 1], outputRange: [0, -5] }) }],
          }}
        />
      ))}
    </View>
  );
};

/** Кнопка отправки: «пружинит» при появлении текста. */
const SendButton = ({ enabled, onPress, disabledColor }: { enabled: boolean; onPress: () => void; disabledColor: string }) => {
  const scale = useRef(new Animated.Value(enabled ? 1 : 0.85)).current;

  useEffect(() => {
    Animated.spring(scale, { toValue: enabled ? 1 : 0.85, friction: 5, tension: 120, useNativeDriver: true }).start();
  }, [enabled, scale]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={onPress}
        disabled={!enabled}
        activeOpacity={Opacity.press}
        accessibilityLabel="Отправить"
        style={{
          width: 38,
          height: 38,
          borderRadius: 19,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: enabled ? Colors.primary : disabledColor,
        }}
      >
        <Ionicons name="arrow-up" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </Animated.View>
  );
};

// Отступы и типографика заданы числами: текст в пузырях, кнопках и поле ввода
// не должен прижиматься к границе, поэтому не полагаемся на обработку классов.
const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12 },
  headerTexts: { flex: 1, marginLeft: 12, marginRight: 8 },
  headerTitle: { fontSize: 16, fontFamily: 'SFProDisplaySemiBold' },
  headerStatus: { flex: 1, fontSize: 12, fontFamily: 'SFProDisplayRegular' },
  onlineDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6, backgroundColor: Colors.primary },

  greeting: { fontSize: 20, textAlign: 'center', marginTop: 16, marginBottom: 6, fontFamily: 'SFProDisplaySemiBold' },
  greetingHint: { fontSize: 14, lineHeight: 20, textAlign: 'center', paddingHorizontal: 24, fontFamily: 'SFProDisplayRegular' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 20, paddingHorizontal: 12 },
  chip: { borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, margin: 5, borderWidth: 1, borderColor: 'rgba(76,175,80,0.35)' },
  chipText: { color: Colors.primary, fontSize: 14, fontFamily: 'SFProDisplayRegular' },

  botRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12 },
  userBubble: {
    maxWidth: '82%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    borderBottomRightRadius: 6,
    backgroundColor: Colors.primary,
  },
  userText: { color: '#FFFFFF', fontSize: 14, lineHeight: 20, fontFamily: 'SFProDisplayRegular' },
  userTime: { color: 'rgba(255,255,255,0.75)', alignSelf: 'flex-end' },
  botBubble: {
    maxWidth: '80%',
    marginLeft: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderRadius: 18,
    borderBottomLeftRadius: 6,
  },
  bodyText: { fontSize: 14, lineHeight: 20, fontFamily: 'SFProDisplayRegular' },
  time: { fontSize: 10, marginTop: 4, fontFamily: 'SFProDisplayRegular' },
  retry: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: Colors.primary,
  },
  retryLabel: { color: '#FFFFFF', fontSize: 12, marginLeft: 6, fontFamily: 'SFProDisplaySemiBold' },
  typingBubble: { marginLeft: 8, paddingHorizontal: 18, paddingVertical: 16, borderRadius: 18, borderBottomLeftRadius: 6 },

  inputBar: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', borderRadius: 26, paddingLeft: 16, paddingRight: 6, paddingVertical: 6 },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 110,
    paddingTop: 10,
    paddingBottom: 10,
    paddingRight: 10,
    fontFamily: 'SFProDisplayRegular',
  },
  note: { fontSize: 11, textAlign: 'center', marginTop: 8, fontFamily: 'SFProDisplayRegular' },
});

export default ChatGPTFeature;
