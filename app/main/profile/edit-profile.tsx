 import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import ConfirmationDrawer from '@/app/components/MiniDrawer';
import useFinancialStore from '@/hooks/useStore';

const EditProfilePage: React.FC = () => {

  const {user, updateUserProfile} = useFinancialStore();

  const initialName = user?.name || "Unknown";
  const initialEmail = user?.email || "unknown@gmail.com";
  const initialPassword = user?.password || "password";


  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState(initialPassword);


  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [showDeleteDrawer, setShowDeleteDrawer] = useState(false);


  const handleSave = () => {
    // Логика сохранения профиля
    updateUserProfile({name:name, email:email, password:password});
    router.push("/main/profile")
  };

  const handleDeleteAccount = () => {
    // Логика удаления аккаунта
    setShowDeleteDrawer(true);
  };

  return (
    <View className="flex-1 bg-black">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 pb-6">
        <TouchableOpacity className="mr-4" onPress={()=>router.replace('/main/profile')}>
           <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-semibold font-['SFProDisplayRegular']">
          Редактировать профиль
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View className="items-center mb-2">
          <View className="w-24 h-24 bg-[#333333] rounded-full items-center justify-center mb-4">
            <MaterialIcons name="camera-alt" size={32} color="#9CA3AF" />
          </View>
        </View>

        {/* Form Fields */}
        <View className="px-4">
          {/* ФИО Field */}
          <View className="mb-4">
            <Text className="text-gray-400 text-sm mb-2 font-['SFProDisplayRegular']">ФИО</Text>
            <View className="bg-[#333333] rounded-2xl">
              <TextInput
                value={name}
                onChangeText={setName}
                className="text-white p-3.5 text-sm font-['SFProDisplayRegular']"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* Email Field */}
          <View className="mb-4">
            <Text className="text-gray-400 text-sm mb-2 font-['SFProDisplayRegular']">Email</Text>
            <View className="bg-[#333333] rounded-2xl">
              <TextInput
                value={email}
                onChangeText={setEmail}
                className="text-white p-3.5 text-sm font-['SFProDisplayRegular']"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* Password Field */}
          <View className="mb-4">
            <Text className="text-gray-400 text-sm mb-2 font-['SFProDisplayRegular']">Повторите пароль</Text>
            <View className="bg-[#333333] rounded-2xl flex-row items-center">
              <TextInput
                value={password}
                onChangeText={setPassword}
                className="text-white p-3.5 text-sm flex-1 font-['SFProDisplayRegular']"
                secureTextEntry={!showPassword}
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                className="px-4"
              >
                <MaterialIcons 
                  name={showPassword ? "visibility" : "visibility-off"} 
                  size={24} 
                  color="#9CA3AF" 
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <ConfirmationDrawer
          visible={showDeleteDrawer}
          title="Удалить аккаунт?"
          onClose={() => setShowDeleteDrawer(false)}
          onConfirm={handleDeleteAccount}
          onCancel={() => console.log('Отменено')}
          confirmText="Да"
          cancelText="Нет"
          confirmButtonColor="#DC2626" // red-600
        />


      </ScrollView>

      {/* Bottom Section */}
      <View className="px-4 pb-2">
        {/* Save Button */}
        <TouchableOpacity 
          onPress={handleSave}
          className="bg-green-600 rounded-2xl py-3 items-center mb-2"
          activeOpacity={0.8}
        >
          <Text className="text-white text-base font-semibold font-['SFProDisplayRegular']">
            Сохранить
          </Text>
        </TouchableOpacity>

        {/* Delete Account Button */}
        <TouchableOpacity 
          onPress={handleDeleteAccount}
          className="items-center py-2"
          activeOpacity={0.7}
        >
          <Text className="text-red-500 text-base font-['SFProDisplayRegular']">
            Удалить аккаунт
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EditProfilePage;