import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('user12@gmail.com');

  const router = useRouter();

  const handleLogin = () => {

    router.replace('/(auth)/confirm');
  };

  return (
    <View className='flex-1 bg-black px-4'>
      <View className="flex-row items-center  pt-12 pb-8">
        <TouchableOpacity className="mr-4" onPress={()=>router.replace('/(auth)/login')}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      </View>
      <Text style={styles.header} className="font-['SFProDisplayRegular'] ">Забыли пароль?</Text>
      
      <View style={styles.inputContainer} className=''>
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
      

      
      <TouchableOpacity 
        style={styles.loginButton} 
        onPress={handleLogin}
        className=''
      >
        <Text className="font-['SFProDisplayRegular']" style={styles.loginButtonText}>Далее</Text>
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