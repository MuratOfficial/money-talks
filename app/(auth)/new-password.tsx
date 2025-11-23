
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View, 
  Alert, 
  ActivityIndicator, 
  ScrollView
} from 'react-native';
import useFinancialStore from '@/hooks/useStore';

export default function NewPasswordScreen() {

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});

  const [fetchErr, setFetchErr] = useState("")

  const router = useRouter();
  const { updatePassword, theme } = useFinancialStore();
  
  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-black' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondaryColor = isDark ? 'text-gray-400' : 'text-gray-600';
  const inputBgColor = isDark ? 'bg-[#333333]' : 'bg-gray-100';
  const inputTextColor = isDark ? 'text-white' : 'text-gray-900';
  const labelColor = isDark ? 'text-[#BDBDBD]' : 'text-gray-700';
  const iconColor = isDark ? 'white' : '#11181C';
  const requirementsBg = isDark ? 'bg-[#1A1A1A]' : 'bg-gray-50';


  const validatePassword = (password: string) => {
    const errors = [];
    
    if (password.length < 8) {
      errors.push('минимум 8 символов');
    }
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('одну строчную букву');
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('одну заглавную букву');
    }
    if (!/(?=.*\d)/.test(password)) {
      errors.push('одну цифру');
    }
    
    return errors;
  };

  // Проверка полей
  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    // Проверка пароля
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      newErrors.password = `Пароль должен содержать: ${passwordErrors.join(', ')}`;
    }
    
    // Проверка подтверждения пароля
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Подтвердите пароль';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Обновление пароля
  const handleUpdatePassword = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const result = await updatePassword({

        newPassword: password
      });

      if (result.success) {
        Alert.alert(
          'Пароль обновлен',
          'Ваш пароль успешно изменен. Теперь вы можете войти с новым паролем.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(auth)/login')
            }
          ]
        );
      } else {
        setFetchErr(result.error! || "Неизвестрная ошибка")
        throw new Error(result.error || 'Ошибка обновления пароля');
      }
    } catch (error: any) {
      console.error('Ошибка обновления пароля:', error);
      
      let errorMessage = 'Произошла ошибка при обновлении пароля \n' + fetchErr;
      
      switch (error.message) {
        case 'Invalid token':
        case 'Token expired':
          errorMessage = 'Сессия истекла. Запросите новый код восстановления';
          break;
        case 'Token used':
          errorMessage = 'Код уже был использован. Запросите новый код';
          break;
        case 'Weak password':
          errorMessage = 'Пароль слишком слабый. Используйте более сложный пароль';
          break;
      }
      
      Alert.alert('Ошибка', errorMessage);
    } finally {
      setLoading(false);
    }
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

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

            {/* Title */}
      <Text className={`font-['SFProDisplaySemiBold'] ${textColor} text-2xl font-bold mb-4 text-left`}>
        Новый пароль
      </Text>
      
      {/* Description */}
      <Text className={`font-['SFProDisplayRegular'] ${textSecondaryColor} text-base mb-8`}>
        Создайте новый надежный пароль для вашего аккаунта
      </Text>
      
      {/* New Password Input */}
      <View className="mb-4">
        <Text className={`font-['SFProDisplayRegular'] ${labelColor} text-sm mb-2`}>
          Новый пароль
        </Text>
        <View className="relative">
          <TextInput
            className={`font-['SFProDisplayRegular'] h-[50px] rounded-[20px] px-4 pr-12 text-base ${inputBgColor} ${inputTextColor}`}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) {
                const newErrors = { ...errors };
                delete newErrors.password;
                setErrors(newErrors);
              }
            }}
            placeholder="Введите новый пароль"
            placeholderTextColor={isDark ? "#666" : "#999"}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            editable={!loading}
          />
          <TouchableOpacity
            className="absolute right-4 top-3"
            onPress={() => setShowPassword(!showPassword)}
          >
            <MaterialIcons 
              name={showPassword ? "visibility" : "visibility-off"} 
              size={24} 
              color={isDark ? "#666" : "#999"} 
            />
          </TouchableOpacity>
        </View>
        {errors.password && (
          <Text className="font-['SFProDisplayRegular'] text-red-500 text-sm mt-2">
            {errors.password}
          </Text>
        )}
      </View>

      {/* Confirm Password Input */}
      <View className="mb-6">
        <Text className={`font-['SFProDisplayRegular'] ${labelColor} text-sm mb-2`}>
          Подтвердите пароль
        </Text>
        <View className="relative">
          <TextInput
            className={`font-['SFProDisplayRegular'] h-[50px] rounded-[20px] px-4 pr-12 text-base ${inputBgColor} ${inputTextColor}`}
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (errors.confirmPassword) {
                const newErrors = { ...errors };
                delete newErrors.confirmPassword;
                setErrors(newErrors);
              }
            }}
            placeholder="Подтвердите новый пароль"
            placeholderTextColor={isDark ? "#666" : "#999"}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            editable={!loading}
          />
          <TouchableOpacity
            className="absolute right-4 top-3"
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <MaterialIcons 
              name={showConfirmPassword ? "visibility" : "visibility-off"} 
              size={24} 
              color={isDark ? "#666" : "#999"} 
            />
          </TouchableOpacity>
        </View>
        {errors.confirmPassword && (
          <Text className="font-['SFProDisplayRegular'] text-red-500 text-sm mt-2">
            {errors.confirmPassword}
          </Text>
        )}
      </View>

      {/* Password Requirements */}
      <View className={`mb-6 p-4 ${requirementsBg} rounded-2xl`}>
        <Text className={`font-['SFProDisplayRegular'] ${labelColor} text-sm mb-3`}>
          Требования к паролю:
        </Text>
        
        {[
          { text: 'Минимум 8 символов', check: password.length >= 8 },
          { text: 'Одна строчная буква', check: /(?=.*[a-z])/.test(password) },
          { text: 'Одна заглавная буква', check: /(?=.*[A-Z])/.test(password) },
          { text: 'Одна цифра', check: /(?=.*\d)/.test(password) }
        ].map((requirement, index) => (
          <View key={index} className="flex-row items-center mb-1">
            <MaterialIcons 
              name={requirement.check ? "check-circle" : "radio-button-unchecked"} 
              size={16} 
              color={requirement.check ? "#4CAF50" : "#666"}
            />
            <Text className={`font-['SFProDisplayRegular'] text-sm ml-2 ${
              requirement.check ? 'text-[#4CAF50]' : (isDark ? 'text-gray-400' : 'text-gray-600')
            }`}>
              {requirement.text}
            </Text>
          </View>
        ))}
      </View>


      </ScrollView>
      
  
      
      {/* Submit Button */}
      <TouchableOpacity 
        className={`h-[50px] rounded-[16px] justify-center items-center my-4 ${
          loading ? (isDark ? 'bg-gray-600' : 'bg-gray-400') : 'bg-[#4CAF50]'
        }`}
        onPress={handleUpdatePassword}
        disabled={loading || !password || !confirmPassword}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text className="font-['SFProDisplayRegular'] text-white text-base font-medium">
            Обновить пароль
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}