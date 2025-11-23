import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View, Alert, ActivityIndicator, StatusBar, SafeAreaView } from 'react-native';
import useFinancialStore from '@/hooks/useStore';

export default function ForgottenScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const router = useRouter();
  const { resetPassword, theme } = useFinancialStore();


  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleResetPassword = async () => {
    if (!email.trim()) {
      setError('Введите email');
      return;
    }

    if (!validateEmail(email)) {
      setError('Введите корректный email');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await resetPassword(email.trim());

      if (result.success) {
        setEmailSent(true);
        // Переход на экран ввода OTP с передачей email
        router.push({
          pathname: '/(auth)/reset-password-otp',
          params: { email: email.trim() }
        });
      } else {
        throw new Error(result.error || 'Ошибка отправки письма');
      }
    } catch (error: any) {
      console.error('Ошибка восстановления пароля:', error);
      
      switch (error.message) {
        case 'User not found':
          setError('Пользователь с таким email не найден');
          break;
        case 'Email rate limit exceeded':
          setError('Слишком много попыток. Попробуйте позже');
          break;
        default:
          setError('Произошла ошибка. Попробуйте еще раз');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!emailSent) return;
    
    setLoading(true);
    setError('');

    try {
      const result = await resetPassword(email.trim());
      if (result.success) {
        Alert.alert('Успешно', 'Код восстановления повторно отправлен на ваш email');
      }
    } catch (error) {
      setError('Ошибка при повторной отправке кода');
    } finally {
      setLoading(false);
    }
  };

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-black' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondaryColor = isDark ? 'text-gray-400' : 'text-gray-600';
  const inputBgColor = isDark ? 'bg-[#333333]' : 'bg-gray-100';
  const inputTextColor = isDark ? 'text-white' : 'text-gray-900';
  const labelColor = isDark ? 'text-[#BDBDBD]' : 'text-gray-700';
  const iconColor = isDark ? 'white' : '#11181C';

  return (
    <SafeAreaView className={`flex-1 ${bgColor}`}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <View className="flex-1 px-6">
        {/* Header */}
        <View className="flex-row items-center pt-12 pb-8">
        <TouchableOpacity 
          className="mr-4" 
          onPress={() => router.replace('/(auth)/login')}
          disabled={loading}
        >
          <MaterialIcons name="arrow-back" size={24} color={iconColor} />
        </TouchableOpacity>
      </View>
      
      {/* Title */}
      <Text className={`font-['SFProDisplayRegular'] ${textColor} text-2xl font-bold mb-4 text-left`}>
        Забыли пароль?
      </Text>
      
      {/* Description */}
      <Text className={`font-['SFProDisplayRegular'] ${textSecondaryColor} text-base mb-8`}>
        {emailSent 
          ? `Код восстановления отправлен на ${email}. Проверьте вашу почту, включая папку "Спам".`
          : 'Введите email, связанный с вашим аккаунтом, и мы отправим код для восстановления пароля'
        }
      </Text>
      
      {!emailSent ? (
        <>
          {/* Email Input */}
          <View className="mb-6">
            <Text className={`font-['SFProDisplayRegular'] ${labelColor} text-sm mb-2`}>
              Email
            </Text>
            <TextInput
              className={`font-['SFProDisplayRegular'] h-[50px] rounded-[20px] px-4 text-base ${inputBgColor} ${inputTextColor}`}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (error) setError('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="Введите ваш email"
              placeholderTextColor={isDark ? "#666" : "#999"}
              editable={!loading}
            />
            {error ? (
              <Text className="font-['SFProDisplayRegular'] text-red-500 text-sm mt-2">
                {error}
              </Text>
            ) : null}
          </View>
          
          {/* Submit Button */}
          <TouchableOpacity 
            className={`h-[50px] rounded-[16px] justify-center items-center mt-4 ${
              loading ? (isDark ? 'bg-gray-600' : 'bg-gray-400') : 'bg-[#4CAF50]'
            }`}
            onPress={handleResetPassword}
            disabled={loading || !email.trim()}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="font-['SFProDisplayRegular'] text-white text-base font-medium">
                Отправить код
              </Text>
            )}
          </TouchableOpacity>
        </>
      ) : (
        <>
          {/* Success State - показываем после отправки */}
          <View className="items-center mb-8">
            <MaterialIcons name="mail-outline" size={64} color="#4CAF50" />
            <Text className={`font-['SFProDisplayRegular'] ${textColor} text-lg font-medium mt-4 text-center`}>
              Код отправлен!
            </Text>
          </View>

          {/* Resend Button */}
          <TouchableOpacity 
            className={`h-[50px] rounded-[16px] justify-center items-center mt-4 border border-[#4CAF50] ${
              loading ? 'opacity-50' : ''
            }`}
            onPress={handleResendCode}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#4CAF50" />
            ) : (
              <Text className="font-['SFProDisplayRegular'] text-[#4CAF50] text-base font-medium">
                Отправить код повторно
              </Text>
            )}
          </TouchableOpacity>

          {/* Continue Button */}
          <TouchableOpacity 
            className="h-[50px] rounded-[16px] justify-center items-center mt-4 bg-[#4CAF50]"
            onPress={() => router.push({
              pathname: '/(auth)/reset-password-otp',
              params: { email: email.trim() }
            })}
          >
            <Text className="font-['SFProDisplayRegular'] text-white text-base font-medium">
              Ввести код
            </Text>
          </TouchableOpacity>
        </>
      )}

      {/* Back to Login */}
      <TouchableOpacity 
        className="items-center mt-6"
        onPress={() => router.replace('/(auth)/login')}
        disabled={loading}
      >
        <Text className="font-['SFProDisplayRegular'] text-[#4CAF50] text-base">
          Вернуться к входу
        </Text>
      </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}