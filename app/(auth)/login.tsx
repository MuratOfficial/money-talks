import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('user12@gmail.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = () => {
    if (!email || !password) {
      setError('Заполните все поля');
      return;
    }
    
    if (password.length < 6) { // Пример проверки
      setError('Пароль неверный');
      return;
    }
    
    // Если вход успешен
    router.replace('/main');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header} className="font-['SFProDisplayRegular']">Вход</Text>
      
      <View style={styles.inputContainer}>
        <Text className="font-['SFProDisplayRegular']" style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          className="font-['SFProDisplayRegular']"
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder='Введите почту '
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text className="font-['SFProDisplayRegular']" style={styles.label}>Пароль</Text>
        <TextInput
        className="font-['SFProDisplayRegular']"
          style={styles.input} 
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder='Введите пароль'
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
      
      <TouchableOpacity 
        style={styles.loginButton} 
        onPress={handleLogin}
      >
        <Text className="font-['SFProDisplayRegular']" style={styles.loginButtonText}>Войти</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => router.push('/(auth)/forgotten')}>
        <Text className="font-['SFProDisplayRegular']" style={styles.forgotPassword}>Забыли пароль?</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'left',
    color: '#FFFFFF',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: '#BDBDBD',
  },
  input: {
    height: 50,
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#333333',
    color:"#BDBDBD"
  },
  errorText: {
    color: '#FF6F71',
    marginTop: 8,
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#4CAF50',
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'medium',
  },
  forgotPassword: {
    color: '#4CAF50',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
  },
});