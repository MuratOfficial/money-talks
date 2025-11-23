import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, StatusBar, SafeAreaView } from 'react-native';
import useFinancialStore from '@/hooks/useStore';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

   const { signIn, user, resetCategory, theme } = useFinancialStore();
   
   const isDark = theme === 'dark';
   const bgColor = isDark ? 'bg-black' : 'bg-white';
   const textColor = isDark ? 'text-white' : 'text-gray-900';
   const textSecondaryColor = isDark ? 'text-[#BDBDBD]' : 'text-gray-700';
   const inputBgColor = isDark ? 'bg-[#333333]' : 'bg-gray-100';
   const inputTextColor = isDark ? 'text-[#BDBDBD]' : 'text-gray-900';

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Заполните все поля');
      return;
    }
    
    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }

    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Введите корректный email');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await signIn(
        email.trim(),
        password
      );

      if (!result.success) {
        throw new Error(result.error || 'Ошибка входа');
      }

      console.log('Успешный вход:', user?.email);
      resetCategory();
      router.replace('/main'); 
      
    } catch (error: any) {
      console.error('Ошибка входа:', error);
      
      switch (error.message) {
        case 'Invalid login credentials':
          setError('Неверный email или пароль');
          break;
        case 'Email not confirmed':
          setError('Email не подтвержден. Проверьте вашу почту');
          break;
        case 'Too many requests':
          setError('Слишком много попыток. Попробуйте позже');
          break;
        default:
          setError(error.message || 'Произошла ошибка при входе');
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <SafeAreaView className={`flex-1 ${bgColor}`}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <View className="flex-1 justify-center p-6">
        <Text className={`font-['SFProDisplayRegular'] text-3xl font-bold ${textColor} mb-8 text-left`}>
          Вход
        </Text>

      <View className='mb-5'>
        <Text className={`font-['SFProDisplayRegular'] ${textSecondaryColor} mb-2`}>
          Email
        </Text>
        <TextInput
          value={email}
          className={`font-['SFProDisplayRegular'] h-12 ${inputTextColor} ${inputBgColor} rounded-2xl px-4`}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="Введите почту"
          placeholderTextColor={isDark ? "#666" : "#999"}
          editable={!loading}
        />
      </View>

      <View className='mb-5'>
        <Text className={`font-['SFProDisplayRegular'] ${textSecondaryColor} mb-2`}>
          Пароль
        </Text>
        <TextInput
          className={`font-['SFProDisplayRegular'] h-12 ${inputTextColor} ${inputBgColor} rounded-2xl px-4`}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Введите пароль"
          placeholderTextColor={isDark ? "#666" : "#999"}
          editable={!loading}
        />
        {error ? <Text className='text-[#FF6F71] mt-2'>{error}</Text> : null}
      </View>

      <TouchableOpacity
        className={`h-[50px] rounded-[16px] justify-center items-center mt-4 ${
          loading ? (isDark ? 'bg-gray-600' : 'bg-gray-400') : 'bg-[#4CAF50]'
        }`}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text className="font-['SFProDisplayRegular'] text-white font-medium">
          {loading ? 'Вход...' : 'Войти'}
        </Text>
      </TouchableOpacity>



      <TouchableOpacity 
        onPress={() => router.push('/(auth)/forgotten')}
        disabled={loading}
      >
        <Text className="font-['SFProDisplayRegular']" style={styles.forgotPassword}>
          Забыли пароль?
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        onPress={() => router.push('/(auth)/register')}
        disabled={loading}
      >
        <Text className="font-['SFProDisplayRegular']" style={styles.forgotPassword}>
          Зарегистрироваться
        </Text>
      </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  forgotPassword: {
    color: '#4CAF50',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
  },
});