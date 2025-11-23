
import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Modal, 
  Text, 
  Dimensions, 
  Animated, 
  TouchableOpacity,
  ActivityIndicator 
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import useFinancialStore from '@/hooks/useStore';

interface PDFLoadingModalProps {
  visible: boolean;
  onClose?: () => void;
  status: 'generating' | 'sharing' | 'success' | 'error';
  message?: string;
  progress?: number; // 0-100
  allowClose?: boolean;
}

const PDFLoadingModal: React.FC<PDFLoadingModalProps> = ({
  visible,
  onClose,
  status,
  message,
  progress = 0,
  allowClose = false
}) => {
  const { theme } = useFinancialStore();
  const isDark = theme === 'dark';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondaryColor = isDark ? 'text-gray-300' : 'text-gray-700';
  const textTertiaryColor = isDark ? 'text-gray-400' : 'text-gray-600';
  const progressBarBgColor = isDark ? 'bg-gray-700' : 'bg-gray-300';
  const iconColor = isDark ? 'white' : '#11181C';
  
  // Анимации
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Запускаем анимации при открытии модала
  useEffect(() => {
    if (visible) {
      // Анимация появления
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();

      // Запускаем непрерывную анимацию вращения для loading
      if (status === 'generating' || status === 'sharing') {
        startRotationAnimation();
        startPulseAnimation();
      }
    } else {
      // Сброс анимаций при закрытии
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
      rotateAnim.setValue(0);
      progressAnim.setValue(0);
      pulseAnim.setValue(1);
    }
  }, [visible, status]);

  // Анимация прогресса
  useEffect(() => {
    if (visible && progress > 0) {
      Animated.timing(progressAnim, {
        toValue: progress / 100,
        duration: 500,
        useNativeDriver: false,
      }).start();
    }
  }, [progress, visible]);

  // Непрерывное вращение
  const startRotationAnimation = () => {
    rotateAnim.setValue(0);
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  };

  // Анимация пульсации
  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // Интерполяция для вращения
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Получаем конфигурацию для текущего статуса
  const getStatusConfig = () => {
    switch (status) {
      case 'generating':
        return {
          icon: 'picture-as-pdf',
          iconColor: '#F59E0B',
          title: 'Генерация PDF',
          subtitle: message || 'Создаем ваш документ...',
          bgColor: 'bg-amber-500/20',
          borderColor: 'border-amber-500/30'
        };
      case 'sharing':
        return {
          icon: 'share',
          iconColor: '#3B82F6',
          title: 'Подготовка к отправке',
          subtitle: message || 'Готовим файл для сохранения...',
          bgColor: 'bg-blue-500/20',
          borderColor: 'border-blue-500/30'
        };
      case 'success':
        return {
          icon: 'check-circle',
          iconColor: '#10B981',
          title: 'Успешно!',
          subtitle: message || 'PDF файл создан и готов к использованию',
          bgColor: 'bg-green-500/20',
          borderColor: 'border-green-500/30'
        };
      case 'error':
        return {
          icon: 'error',
          iconColor: '#EF4444',
          title: 'Ошибка',
          subtitle: message || 'Не удалось создать PDF файл',
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-500/30'
        };
      default:
        return {
          icon: 'description',
          iconColor: '#6B7280',
          title: 'Обработка',
          subtitle: 'Пожалуйста, подождите...',
          bgColor: 'bg-gray-500/20',
          borderColor: 'border-gray-500/30'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      statusBarTranslucent={true}
      presentationStyle="overFullScreen"
    >
      <Animated.View 
        className="flex-1 bg-black/70"
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: Dimensions.get('window').width,
          height: Dimensions.get('window').height,
          opacity: fadeAnim,
        }}
      >
        {/* Blur overlay effect */}
        <View 
          className="absolute bg-gray-900/90" 
          style={{
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: '100%',
          }}
        />
        
        {/* Close button - показываем только если разрешено и есть обработчик */}
        {allowClose && onClose && (
          <TouchableOpacity 
            onPress={onClose}
            className="absolute z-10 w-10 h-10 bg-black/30 rounded-full items-center justify-center"
            style={{
              top: 50,
              right: 20,
            }}
            activeOpacity={0.7}
          >
            <MaterialIcons name="close" size={24} color={iconColor} />
          </TouchableOpacity>
        )}

        {/* Main content centered */}
        <View 
          className="items-center justify-center"
          style={{
            flex: 1,
            width: '100%',
            height: '100%',
          }}
        >
          <Animated.View 
            className={`w-40 h-40 ${config.bgColor} rounded-3xl items-center justify-center ${config.borderColor} border-2`}
            style={{
              transform: [{ scale: scaleAnim }]
            }}
          >
            {/* Иконка с анимацией */}
            <Animated.View
              style={{
                transform: [
                  { scale: pulseAnim },
                  ...(status === 'generating' || status === 'sharing' 
                    ? [{ rotate: spin }] 
                    : [])
                ]
              }}
            >
              <MaterialIcons 
                name={config.icon as any} 
                size={56} 
                color={config.iconColor} 
              />
            </Animated.View>

            {/* Прогресс индикатор для генерации */}
            {(status === 'generating' || status === 'sharing') && (
              <View className="mt-4">
                <ActivityIndicator 
                  size="small" 
                  color={config.iconColor} 
                />
              </View>
            )}

            {/* Прогресс бар если есть прогресс */}
            {progress > 0 && progress < 100 && (
              <View className={`mt-4 w-32 h-2 ${progressBarBgColor} rounded-full overflow-hidden`}>
                <Animated.View 
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: config.iconColor,
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  }}
                />
              </View>
            )}
          </Animated.View>

          {/* Текст под иконкой */}
          <Animated.View 
            className="mt-6 items-center px-8"
            style={{ opacity: fadeAnim }}
          >
            <Text className={`${textColor} text-xl font-semibold font-['SFProDisplaySemiBold'] text-center`}>
              {config.title}
            </Text>
            <Text className={`${textSecondaryColor} text-base text-center mt-2 font-['SFProDisplayRegular']`}>
              {config.subtitle}
            </Text>

            {/* Показываем прогресс в процентах */}
            {progress > 0 && progress < 100 && (
              <Text className={`${textTertiaryColor} text-sm mt-2`}>
                {Math.round(progress)}%
              </Text>
            )}

            {/* Дополнительные действия для статуса error */}
            {status === 'error' && onClose && (
              <TouchableOpacity
                className="mt-6 bg-red-500 px-6 py-3 rounded-lg"
                onPress={onClose}
                activeOpacity={0.8}
              >
                <Text className="text-white font-semibold">
                  Закрыть
                </Text>
              </TouchableOpacity>
            )}

            {/* Дополнительные действия для статуса success */}
            {status === 'success' && onClose && (
              <TouchableOpacity
                className="mt-6 bg-green-500 px-6 py-3 rounded-lg"
                onPress={onClose}
                activeOpacity={0.8}
              >
                <Text className="text-white font-semibold">
                  Готово
                </Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        </View>
      </Animated.View>
    </Modal>
  );
};

export default PDFLoadingModal;