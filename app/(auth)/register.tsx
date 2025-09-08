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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface RegistrationScreenProps {
  onBack?: () => void;
  onRegister?: (data: { fullName: string; email: string; password: string }) => void;
  onLogin?: () => void;
}

const RegistrationScreen: React.FC<RegistrationScreenProps> = ({
  
  onRegister,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      await onRegister?.({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-4">
          <TouchableOpacity 
            onPress={()=>router.push("/(auth)/login")}
            className="p-2 -ml-2"
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          
          <Text className="text-white text-lg font-['SFProDisplaySemiBold']">
            Регистрация
          </Text>
          
          <View className="w-8" />
        </View>

        {/* Form */}
        <View className="flex-1 px-4 pt-8">
          {/* Full Name Input */}
          <View className="mb-6">
            <Text className="text-gray-300 text-sm mb-2 font-['SFProDisplayRegular']">
              ФИО
            </Text>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="First User"
              placeholderTextColor="#9CA3AF"
              className="bg-[#333333] text-white px-4 py-4 rounded-2xl text-base font-['SFProDisplayRegular']"
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          {/* Email Input */}
          <View className="mb-6">
            <Text className="text-gray-300 text-sm mb-2 font-['SFProDisplayRegular']">
              Email
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="user12@gmail.com"
              placeholderTextColor="#9CA3AF"
              className="bg-[#333333] text-white px-4 py-4 rounded-2xl text-base font-['SFProDisplayRegular']"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
            />
          </View>

          {/* Password Input */}
          <View className="mb-8">
            <Text className="text-gray-300 text-sm mb-2 font-['SFProDisplayRegular']">
              Повторите пароль
            </Text>
            <View className="relative">
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••••"
                placeholderTextColor="#9CA3AF"
                className="bg-[#333333] text-white px-4 py-4 pr-12 rounded-2xl text-base font-['SFProDisplayRegular']"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="password"
              />
              <TouchableOpacity
                onPress={togglePasswordVisibility}
                className="absolute right-4 top-4"
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={showPassword ? "eye-off" : "eye"} 
                  size={20} 
                  color="#9CA3AF" 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Register Button */}
          <TouchableOpacity
            onPress={handleRegister}
            disabled={isLoading || !fullName.trim() || !email.trim() || !password.trim()}
            className={`py-4 rounded-2xl mb-6 ${
              isLoading || !fullName.trim() || !email.trim() || !password.trim()
                ? 'bg-green-700'
                : 'bg-[#4CAF50]'
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
          <TouchableOpacity
            onPress={()=>router.push("/(auth)/login")}
            activeOpacity={0.7}
          >
            <Text className="text-green-500 text-center text-base font-['SFProDisplayRegular']">
              Войти в аккаунт
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegistrationScreen;