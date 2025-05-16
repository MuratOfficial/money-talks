import { useRouter } from 'expo-router';
import { useState } from 'react';
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
    
    // Здесь должна быть логика входа
    // Например, проверка пароля через API
    
    if (password.length < 6) { // Пример проверки
      setError('Пароль неверный');
      return;
    }
    
    // Если вход успешен
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Вход</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Пароль</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
      
      <TouchableOpacity 
        style={styles.loginButton} 
        onPress={handleLogin}
      >
        <Text style={styles.loginButtonText}>Войти</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => router.push('/explore')}>
        <Text style={styles.forgotPassword}>Забыли пароль?</Text>
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'left',
    color: '#FFFFFF',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#BDBDBD',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  errorText: {
    color: '#FF6F71',
    marginTop: 8,
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#4CAF50',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotPassword: {
    color: '#4CAF50',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
  },
});