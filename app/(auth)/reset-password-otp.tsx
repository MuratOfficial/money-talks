
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState, useRef, useEffect } from 'react';
import { 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View, 
  Alert, 
  ActivityIndicator,
  Keyboard,
  Dimensions
} from 'react-native';
import useFinancialStore from '@/hooks/useStore';

const { width } = Dimensions.get('window');
const OTP_LENGTH = 6;

export default function ResetPasswordOtpScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const router = useRouter();
  const { verifyOtp, resetPassword, theme } = useFinancialStore();
  
  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-black' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondaryColor = isDark ? 'text-gray-400' : 'text-gray-600';
  const inputBgColor = isDark ? 'bg-[#333333]' : 'bg-gray-100';
  const inputTextColor = isDark ? 'text-white' : 'text-gray-900';
  const iconColor = isDark ? 'white' : '#11181C';
  
  // Refs для инпутов
  const inputRefs = useRef<TextInput[]>([]);

  // Таймер для повторной отправки
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  // Обработка изменения OTP
  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) return; // Запрещаем ввод более одного символа
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    if (error) setError('');
    
    // Автоматический переход к следующему полю
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Автоматическая проверка при заполнении всех полей
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === OTP_LENGTH) {
      Keyboard.dismiss();
      setTimeout(() => handleVerifyOtp(newOtp.join('')), 100);
    }
  };

  // Обработка удаления
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (otpValue?: string) => {
    const currentOtp = otpValue || otp.join('');
    
    if (currentOtp.length !== OTP_LENGTH) {
      setError('Введите полный код');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await verifyOtp({
        email: email!,
        token: currentOtp,
        type: 'recovery'
      });

      if (result.success) {
        // Переход на экран установки нового пароля
        router.push({
          pathname: '/(auth)/new-password',
          params: { 
            email: email!,
            token: currentOtp 
          }
        });
      } else {
        throw new Error(result.error || 'Неверный код');
      }
    } catch (error: any) {
      console.error('Ошибка проверки OTP:', error);
      
      switch (error.message) {
        case 'Invalid token':
        case 'Token expired':
          setError('Неверный или истекший код');
          break;
        case 'Token used':
          setError('Код уже был использован');
          break;
        default:
          setError('Ошибка проверки кода. Попробуйте еще раз');
      }
      
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;
    
    setResendLoading(true);
    setError('');

    try {
      const result = await resetPassword(email!);
      
      if (result.success) {
        Alert.alert('Успешно', 'Новый код отправлен на ваш email');
        setTimer(60);
        setCanResend(false);
        setOtp(Array(OTP_LENGTH).fill(''));
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error('Ошибка повторной отправки:', error);
      setError('Ошибка при отправке кода');
    } finally {
      setResendLoading(false);
    }
  };

  // Форматирование времени
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View className={`flex-1 ${bgColor} px-6`}>
      {/* Header */}
      <View className="flex-row items-center pt-12 pb-8">
        <TouchableOpacity 
          className="mr-4" 
          onPress={() => router.back()}
          disabled={loading}
        >
          <MaterialIcons name="arrow-back" size={24} color={iconColor} />
        </TouchableOpacity>
      </View>
      
      {/* Title */}
      <Text className={`font-['SFProDisplayRegular'] ${textColor} text-2xl font-bold mb-4 text-left`}>
        Введите код
      </Text>
      
      {/* Description */}
      <Text className={`font-['SFProDisplayRegular'] ${textSecondaryColor} text-base mb-8`}>
        Мы отправили 6-значный код на {email}
      </Text>
      
      {/* OTP Input Fields */}
      <View className="flex-row justify-between mb-6">
        {Array.from({ length: OTP_LENGTH }, (_, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              if (ref) inputRefs.current[index] = ref;
            }}
            className={`font-['SFProDisplayRegular'] w-12 h-12 rounded-lg ${inputBgColor} ${inputTextColor} text-center text-lg font-medium`}
            value={otp[index]}
            onChangeText={(value) => handleOtpChange(value, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
            editable={!loading}
            style={{
              width: (width - 48 - 20) / OTP_LENGTH, // Равномерное распределение
            }}
          />
        ))}
      </View>

      {/* Error Message */}
      {error ? (
        <Text className="font-['SFProDisplayRegular'] text-red-500 text-sm mb-4 text-center">
          {error}
        </Text>
      ) : null}
      
      {/* Verify Button */}
      <TouchableOpacity 
        className={`h-[50px] rounded-[16px] justify-center items-center mt-4 ${
          loading ? (isDark ? 'bg-gray-600' : 'bg-gray-400') : 'bg-[#4CAF50]'
        }`}
        onPress={() => handleVerifyOtp()}
        disabled={loading || otp.join('').length !== OTP_LENGTH}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text className="font-['SFProDisplayRegular'] text-white text-base font-medium">
            Подтвердить код
          </Text>
        )}
      </TouchableOpacity>

      {/* Resend Section */}
      <View className="items-center mt-8">
        <Text className={`font-['SFProDisplayRegular'] ${textSecondaryColor} text-base mb-4`}>
          Не получили код?
        </Text>
        
        {canResend ? (
          <TouchableOpacity 
            onPress={handleResendCode}
            disabled={resendLoading}
            className="flex-row items-center"
          >
            {resendLoading ? (
              <ActivityIndicator size="small" color="#4CAF50" />
            ) : (
              <Text className="font-['SFProDisplayRegular'] text-green-500 text-base font-medium">
                Отправить повторно
              </Text>
            )}
          </TouchableOpacity>
        ) : (
          <Text className={`font-['SFProDisplayRegular'] ${isDark ? 'text-gray-500' : 'text-gray-600'} text-base`}>
            Повторить через {formatTime(timer)}
          </Text>
        )}
      </View>

      {/* Back to Login */}
      <TouchableOpacity 
        className="items-center mt-8"
        onPress={() => router.replace('/(auth)/login')}
        disabled={loading}
      >
        <Text className="font-['SFProDisplayRegular'] text-green-500 text-base">
          Вернуться к входу
        </Text>
      </TouchableOpacity>
    </View>
  );
}