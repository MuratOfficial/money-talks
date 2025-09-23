import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import useFinancialStore from '@/hooks/useStore';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

   const { signIn, user, resetCategory } = useFinancialStore();

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
    <View className=' flex-1 bg-black justify-center p-6'>
      <Text className="font-['SFProDisplayRegular'] text-3xl font-bold text-white mb-8 text-left">
        Вход
      </Text>

      <View className='mb-5'>
        <Text className="font-['SFProDisplayRegular'] text-[#BDBDBD] mb-2" >
          Email
        </Text>
        <TextInput
          value={email}
          className="font-['SFProDisplayRegular'] h-12 text-[#BDBDBD] bg-[#333333] rounded-2xl px-4"
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="Введите почту"
          placeholderTextColor="#666"
          editable={!loading}
        />
      </View>

      <View className='mb-5'>
        <Text className="font-['SFProDisplayRegular'] text-[#BDBDBD] mb-2">
          Пароль
        </Text>
        <TextInput
          className="font-['SFProDisplayRegular'] h-12 text-[#BDBDBD] bg-[#333333] rounded-2xl px-4"
          
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Введите пароль"
          placeholderTextColor="#666"
          editable={!loading}
        />
        {error ? <Text className='text-[#FF6F71] mt-2'>{error}</Text> : null}
      </View>

      <TouchableOpacity
        style={[styles.loginButton, loading && styles.loginButtonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text className="font-['SFProDisplayRegular'] text-[#fff] font-medium " >
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
  );
}

const styles = StyleSheet.create({

  loginButton: {
    backgroundColor: '#4CAF50',
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  loginButtonDisabled: {
    backgroundColor: '#2E7D32',
    opacity: 0.6,
  },


  forgotPassword: {
    color: '#4CAF50',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
  },
});