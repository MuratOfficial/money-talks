import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import useFinancialStore from '@/hooks/useStore';

export default function NewPasswordScreen() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const params = useLocalSearchParams();
  const { updatePassword } = useFinancialStore();

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleUpdatePassword = async () => {
    if (!password || !confirmPassword) {
      setError('Заполните все поля');
      return;
    }

    if (!validatePassword(password)) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await updatePassword(password);

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
        throw new Error(result.error || 'Ошибка обновления пароля');
      }
    } catch (error: any) {
      setError(error.message || 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-black px-6">
      {/* Header */}
      <View className="flex-row items-center pt-12 pb-8">
        <TouchableOpacity 
          className="mr-4" 
          onPress={() => router.back()}
          disabled={loading}
        >
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Title */}
      <Text className="text-white text-2xl font-bold mb-4 font-['SFProDisplayRegular']">
        Новый пароль
      </Text>

      <Text className="text-gray-300 text-base mb-8 font-['SFProDisplayRegular']">
        Придумайте новый пароль для вашего аккаунта
      </Text>

      {/* Password Input */}
      <View className="mb-4">
        <Text className="text-gray-300 text-sm mb-2 font-['SFProDisplayRegular']">
          Новый пароль
        </Text>
        <View className="relative">
          <TextInput
            className="h-12 bg-[#333333] rounded-2xl px-4 text-white font-['SFProDisplayRegular'] pr-12"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (error) setError('');
            }}
            secureTextEntry={!showPassword}
            placeholder="Минимум 6 символов"
            placeholderTextColor="#666"
            editable={!loading}
          />
          <TouchableOpacity
            className="absolute right-4 top-3"
            onPress={() => setShowPassword(!showPassword)}
          >
            <MaterialIcons 
              name={showPassword ? "visibility-off" : "visibility"} 
              size={24} 
              color="#666" 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Confirm Password Input */}
      <View className="mb-6">
        <Text className="text-gray-300 text-sm mb-2 font-['SFProDisplayRegular']">
          Подтвердите пароль
        </Text>
        <TextInput
          className="h-12 bg-[#333333] rounded-2xl px-4 text-white font-['SFProDisplayRegular']"
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            if (error) setError('');
          }}
          secureTextEntry
          placeholder="Повторите пароль"
          placeholderTextColor="#666"
          editable={!loading}
        />
      </View>

      {/* Error Message */}
      {error ? (
        <Text className="text-red-500 text-sm mb-4 font-['SFProDisplayRegular']">
          {error}
        </Text>
      ) : null}

      {/* Submit Button */}
      <TouchableOpacity
        onPress={handleUpdatePassword}
        disabled={loading || !password || !confirmPassword}
        className={`h-12 rounded-2xl justify-center items-center mb-4 ${
          loading || !password || !confirmPassword ? 'bg-gray-600' : 'bg-green-600'
        }`}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text className="text-white text-base font-medium font-['SFProDisplayRegular']">
            Обновить пароль
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}