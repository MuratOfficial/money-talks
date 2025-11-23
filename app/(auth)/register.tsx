import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import useFinancialStore from '@/hooks/useStore';

const RegistrationScreen: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const router = useRouter();
  const { theme } = useFinancialStore();
  
  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-black' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondaryColor = isDark ? 'text-gray-300' : 'text-gray-700';
  const inputBgColor = isDark ? 'bg-[#333333]' : 'bg-gray-100';
  const inputTextColor = isDark ? 'text-white' : 'text-gray-900';
  const iconColor = isDark ? 'white' : '#11181C';
  const eyeIconColor = isDark ? '#9CA3AF' : '#6B7280';

  // Правильная валидация email для Supabase
  const isValidEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Введите ФИО';
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = 'ФИО должно содержать минимум 2 символа';
    }

    if (!email.trim()) {
      newErrors.email = 'Введите email';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Введите корректный email (пример: user@gmail.com)';
    }

    if (!password) {
      newErrors.password = 'Введите пароль';
    } else if (password.length < 6) {
      newErrors.password = 'Пароль должен содержать минимум 6 символов';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Подтвердите пароль';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      // Регистрация в Supabase
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        Alert.alert(
          'Успешная регистрация!',
          'На вашу почту отправлено письмо для подтверждения аккаунта. Проверьте папку "Спам", если не видите письмо.',
          [
            {
              text: 'Перейти к входу',
              onPress: () => router.replace('/(auth)/login'),
            },
            {
              text: 'Остаться',
              style: 'cancel',
            },
          ]
        );
        
        console.log('Пользователь зарегистрирован:', data.user.email);
        
        setFullName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');

        router.replace("/(auth)/login")
      }
    } catch (error: any) {
      console.error('Ошибка регистрации:', error);
      
      // Обработка специфических ошибок Supabase
      switch (error.message) {
        case 'User already registered':
          setErrors({ email: 'Пользователь с таким email уже зарегистрирован' });
          break;
        case 'Password should be at least 6 characters':
          setErrors({ password: 'Пароль должен содержать минимум 6 символов' });
          break;
        case 'Invalid email':
          setErrors({ email: 'Некорректный формат email. Используйте настоящий email адрес' });
          break;
        case 'Email rate limit exceeded':
          setErrors({ general: 'Слишком много попыток. Попробуйте через несколько минут' });
          break;
        default:
          setErrors({ general: 'Произошла ошибка при регистрации. Попробуйте позже.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };



  const isFormValid = fullName.trim() && 
                     isValidEmail(email) && 
                     password.length >= 6 && 
                     password === confirmPassword;

  return (
    <SafeAreaView className={`flex-1 ${bgColor}`}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={isDark ? "#000000" : "#FFFFFF"} />
      
      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-4">
          <TouchableOpacity 
            onPress={() => router.push("/(auth)/login")}
            className="p-2 -ml-2"
            activeOpacity={0.7}
            disabled={isLoading}
          >
            <Ionicons name="chevron-back" size={24} color={iconColor} />
          </TouchableOpacity>
          
          <Text className={`${textColor} text-lg font-['SFProDisplaySemiBold']`}>
            Регистрация
          </Text>
          
          <View className="w-8" />
        </View>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="flex-1 px-4 pt-4">
          {/* Full Name Input */}
          <View className="mb-4">
            <Text className={`${textSecondaryColor} text-sm mb-2 font-['SFProDisplayRegular']`}>
              ФИО *
            </Text>
            <TextInput
              value={fullName}
              onChangeText={(text) => {
                setFullName(text);
                if (errors.fullName) setErrors({...errors, fullName: ''});
              }}
              placeholder="Иван Иванов"
              placeholderTextColor={isDark ? "#666" : "#999"}
              className={`${inputBgColor} ${inputTextColor} px-4 py-4 rounded-2xl text-base font-['SFProDisplayRegular']`}
              autoCapitalize="words"
              autoCorrect={false}
              editable={!isLoading}
            />
            {errors.fullName && (
              <Text className="text-red-500 text-xs mt-1 font-['SFProDisplayRegular']">
                {errors.fullName}
              </Text>
            )}
          </View>

          {/* Email Input */}
          <View className="mb-4">
            <Text className={`${textSecondaryColor} text-sm mb-2 font-['SFProDisplayRegular']`}>
              Email *
            </Text>
            <TextInput
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors({...errors, email: ''});
              }}
              placeholder="user@gmail.com"
              placeholderTextColor={isDark ? "#666" : "#999"}
              className={`${inputBgColor} ${inputTextColor} px-4 py-4 rounded-2xl text-base font-['SFProDisplayRegular']`}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              editable={!isLoading}
            />
            {errors.email && (
              <Text className="text-red-500 text-xs mt-1 font-['SFProDisplayRegular']">
                {errors.email}
              </Text>
            )}
          </View>

          {/* Password Input */}
          <View className="mb-4">
            <Text className={`${textSecondaryColor} text-sm mb-2 font-['SFProDisplayRegular']`}>
              Пароль * (минимум 6 символов)
            </Text>
            <View className="relative">
              <TextInput
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) setErrors({...errors, password: ''});
                  if (errors.confirmPassword && confirmPassword) {
                    setErrors({...errors, confirmPassword: ''});
                  }
                }}
                placeholder="Введите пароль"
                placeholderTextColor={isDark ? "#666" : "#999"}
                className={`${inputBgColor} ${inputTextColor} px-4 py-4 pr-12 rounded-2xl text-base font-['SFProDisplayRegular']`}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="password-new"
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={togglePasswordVisibility}
                className="absolute right-4 top-4"
                activeOpacity={0.7}
                disabled={isLoading}
              >
                <Ionicons 
                  name={showPassword ? "eye-off" : "eye"} 
                  size={20} 
                  color={eyeIconColor} 
                />
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text className="text-red-500 text-xs mt-1 font-['SFProDisplayRegular']">
                {errors.password}
              </Text>
            )}
          </View>

          {/* Confirm Password Input */}
          <View className="mb-6">
            <Text className={`${textSecondaryColor} text-sm mb-2 font-['SFProDisplayRegular']`}>
              Повторите пароль *
            </Text>
            <View className="relative">
              <TextInput
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (errors.confirmPassword) setErrors({...errors, confirmPassword: ''});
                }}
                placeholder="Повторите пароль"
                placeholderTextColor={isDark ? "#666" : "#999"}
                className={`${inputBgColor} ${inputTextColor} px-4 py-4 pr-12 rounded-2xl text-base font-['SFProDisplayRegular']`}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="password-new"
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={toggleConfirmPasswordVisibility}
                className="absolute right-4 top-4"
                activeOpacity={0.7}
                disabled={isLoading}
              >
                <Ionicons 
                  name={showConfirmPassword ? "eye-off" : "eye"} 
                  size={20} 
                  color={eyeIconColor} 
                />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && (
              <Text className="text-red-500 text-xs mt-1 font-['SFProDisplayRegular']">
                {errors.confirmPassword}
              </Text>
            )}
          </View>

          {/* General Error */}
          {errors.general && (
            <Text className="text-red-500 text-center text-sm mb-4 font-['SFProDisplayRegular']">
              {errors.general}
            </Text>
          )}

          {/* Register Button */}
          <TouchableOpacity
            onPress={handleRegister}
            disabled={isLoading || !isFormValid}
            className={`py-4 rounded-2xl mb-4 ${
              isLoading || !isFormValid ? 'bg-green-800' : 'bg-[#4CAF50]'
            }`}
            activeOpacity={0.8}
          >
            <Text className="text-white text-center font-semibold text-base font-['SFProDisplayRegular']">
              {isLoading ? 'Создание аккаунта...' : 'Создать аккаунт'}
            </Text>
          </TouchableOpacity>

     
        </View>

        {/* Login Link */}
        <View className="px-4 pb-8">
          <Text className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-center text-sm mb-2 font-['SFProDisplayRegular']`}>
            Уже есть аккаунт?
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(auth)/login")}
            activeOpacity={0.7}
            disabled={isLoading}
          >
            <Text className="text-green-500 text-center text-base font-['SFProDisplayRegular']">
              Войти в аккаунт
            </Text>
          </TouchableOpacity>
        </View>

        </ScrollView>
        {/* Form */}
        
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegistrationScreen;