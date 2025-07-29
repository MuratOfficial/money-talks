import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface EmailVerificationCodeProps {
  email?: string;
  codeLength?: number;
  onCodeComplete?: (code: string) => void;
  onResendCode?: () => void;
  title?: string;
  description?: string;
}

const EmailVerificationCode: React.FC<EmailVerificationCodeProps> = ({
  email = "user12@gmail.com",
  codeLength = 4,
  onCodeComplete,
  onResendCode,
  title = "Введите код из почты",
  description = "Код для подтверждения отправлен на ваш email. Пожалуйста, проверьте почту, включая папку «Спам»"
}) => {
  const [code, setCode] = useState<string[]>(new Array(codeLength).fill(''));
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const router = useRouter();

  const handleCodeChange = (value: string, index: number) => {
    // Разрешаем только цифры
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Переход к следующему полю
    if (value && index < codeLength - 1) {
      inputRefs.current[index + 1]?.focus();
      setActiveIndex(index + 1);
    }

    // Если код заполнен полностью
    if (newCode.every(digit => digit !== '') && onCodeComplete) {
      onCodeComplete(newCode.join(''));
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace') {
      const newCode = [...code];
      
      if (newCode[index]) {
        // Очищаем текущее поле
        newCode[index] = '';
        setCode(newCode);
      } else if (index > 0) {
        // Переходим к предыдущему полю и очищаем его
        newCode[index - 1] = '';
        setCode(newCode);
        inputRefs.current[index - 1]?.focus();
        setActiveIndex(index - 1);
      }
    }
  };

  const handleConfirm = () => {
    const fullCode = code.join('');
    if (fullCode.length === codeLength && onCodeComplete) {
      onCodeComplete(fullCode);
    }
  };

  const handleResend = () => {
    // Очищаем код
    setCode(new Array(codeLength).fill(''));
    setActiveIndex(0);
    inputRefs.current[0]?.focus();
    
    if (onResendCode) {
      onResendCode();
    }
  };

  const isCodeComplete = code.every(digit => digit !== '');

  return (
    <View className="flex-1 bg-black">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-12 pb-8">
        <TouchableOpacity className="mr-4" onPress={()=>router.replace('/(auth)/forgotten')}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View className="flex-1 px-6">
        {/* Title */}
        <Text className="text-white text-2xl font-bold mb-4 font-['SFProDisplayRegular']">
          {title}
        </Text>

        {/* Description */}
        <Text className="text-gray-300 text-base leading-6 mb-2 font-['SFProDisplayRegular']">
          {description}
        </Text>

        {/* Email */}
        <Text className="text-white text-base font-medium mb-8 font-['SFProDisplayRegular']">
          {email}
        </Text>

        {/* Code Input Fields */}
        <View className="flex-row justify-center space-x-4 mb-12">
          {code.map((digit, index) => (
            <View key={index} className="relative">
              <TextInput
                ref={(ref) => (inputRefs.current[index] = ref)}
                value={digit}
                onChangeText={(value) => handleCodeChange(value, index)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                onFocus={() => setActiveIndex(index)}
                className="w-16 font-['SFProDisplayRegular'] h-16 bg-transparent border-b-2 border-gray-600 text-white text-2xl text-center font-bold"
                keyboardType="numeric"
                maxLength={1}
                selectTextOnFocus
                style={{
                  borderBottomColor: digit ? '#10B981' : (activeIndex === index ? '#6B7280' : '#374151')
                }}
              />
              {/* Active indicator */}
              {activeIndex === index && !digit && (
                <View className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0.5 h-6 bg-white animate-pulse" />
              )}
            </View>
          ))}
        </View>
      </View>

      {/* Bottom Buttons */}
      <View className="px-6 pb-8">
        {/* Confirm Button */}
        <TouchableOpacity
          onPress={handleConfirm}
          className={`rounded-lg py-4 items-center mb-4 ${
            isCodeComplete ? 'bg-green-600' : 'bg-gray-700'
          }`}
          activeOpacity={0.8}
          disabled={!isCodeComplete}
        >
          <Text className={`text-base font-semibold font-['SFProDisplayRegular'] ${
            isCodeComplete ? 'text-white' : 'text-gray-400'
          }`}>
            Подтвердить
          </Text>
        </TouchableOpacity>

        {/* Resend Button */}
        <TouchableOpacity
          onPress={handleResend}
          className="items-center py-2"
          activeOpacity={0.7}
        >
          <Text className="text-green-500 font-['SFProDisplayRegular'] text-base font-medium">
            Отправить снова
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};


export default EmailVerificationCode;