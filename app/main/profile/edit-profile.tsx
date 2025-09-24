import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import ConfirmationDrawer from '@/app/components/MiniDrawer';
import useFinancialStore from '@/hooks/useStore';

const EditProfilePage: React.FC = () => {

  const {user, updateUserProfile} = useFinancialStore();

  const initialName = user?.name || "Unknown";
  const initialEmail = user?.email || "unknown@gmail.com";
  const initialPassword = user?.password || "password";
  const initialAvatar = user?.avatar || null; 

  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState(initialPassword);
  const [avatarUri, setAvatarUri] = useState<string | null>(initialAvatar);

  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [showDeleteDrawer, setShowDeleteDrawer] = useState(false);

  // Функция для показа опций выбора фото
  const showImagePickerOptions = () => {
    Alert.alert(
      "Выберите фото",
      "Откуда вы хотите выбрать фото?",
      [
        {
          text: "Отмена",
          style: "cancel"
        },
        {
          text: "Камера",
          onPress: takePhoto
        },
        {
          text: "Галерея",
          onPress: pickImage
        }
      ]
    );
  };

  // Функция для съемки фото
  const takePhoto = async () => {
    // Запрашиваем разрешение на использование камеры
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Ошибка', 'Необходимо разрешение на использование камеры');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // квадратное изображение для аватара
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  // Функция для выбора фото из галереи
  const pickImage = async () => {
    // Запрашиваем разрешение на доступ к медиатеке
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Ошибка', 'Необходимо разрешение на доступ к галерее');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // квадратное изображение для аватара
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    // Логика сохранения профиля с аватаром
    updateUserProfile({
      name: name, 
      email: email, 
      password: password,
      avatar: avatarUri // добавляем аватар в обновление профиля
    });
    router.push("/main/profile");
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
        <Text className="text-white text-lg font-['SFProDisplayRegular']">
          Редактировать профиль
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View className="items-center mb-2">
          <TouchableOpacity 
            onPress={showImagePickerOptions}
            className="w-24 h-24 bg-[#333333] rounded-full items-center justify-center mb-4 relative"
            activeOpacity={0.7}
          >
            {avatarUri ? (
              <>
                <Image 
                  source={{ uri: avatarUri }} 
                  className="w-24 h-24 rounded-full"
                  resizeMode="cover"
                />
                {/* Overlay с иконкой камеры */}
                <View className="absolute inset-0 bg-black/30 rounded-full items-center justify-center">
                  <MaterialIcons name="camera-alt" size={24} color="white" />
                </View>
              </>
            ) : (
              <MaterialIcons name="camera-alt" size={32} color="#9CA3AF" />
            )}
          </TouchableOpacity>
          <Text className="text-gray-400 text-xs text-center font-['SFProDisplayRegular']">
            Нажмите для изменения фото
          </Text>
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
            <Text className="text-gray-400 text-sm mb-2 font-['SFProDisplayRegular']">Изменить пароль</Text>
            <TouchableOpacity 
              onPress={()=>router.push("/(auth)/new-password")}
              className="bg-red-800 rounded-2xl py-3 items-center mb-2"
              activeOpacity={0.8}
            >
              <Text className="text-white text-base  font-['SFProDisplayRegular']">
                Новый пароль
              </Text>
            </TouchableOpacity>
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
          <Text className="text-white text-base  font-['SFProDisplayRegular']">
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