import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface ConfirmationDrawerProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmButtonColor?: string;
  cancelButtonColor?: string;
}

const ConfirmationDrawer: React.FC<ConfirmationDrawerProps> = ({
  visible,
  title,
  onClose,
  onConfirm,
  onCancel,
  confirmText = "Да",
  cancelText = "Нет",
  confirmButtonColor = "#16A34A", // green-600
  cancelButtonColor = "#374151"   // gray-700
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleCancel = () => {
    onCancel();
    onClose();
  };

  const handleBackdropPress = () => {
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <TouchableOpacity 
        className="flex-1 bg-white/10 justify-end backdrop-blur-md"
        activeOpacity={1}
        onPress={handleBackdropPress}
      >
        {/* Drawer Content */}
        <TouchableOpacity 
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View className="bg-[#1C1C1E] rounded-t-2xl px-4 py-6">
            {/* Header with Close Button */}
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-white text-lg font-['SFProDisplayRegular'] font-medium flex-1">
                {title}
              </Text>
              <TouchableOpacity 
                onPress={onClose}
                className="ml-4 p-1"
                activeOpacity={0.7}
              >
                <MaterialIcons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {/* Action Buttons */}
            <View className="flex-row space-x-3">
              {/* Cancel Button */}
              <TouchableOpacity
                onPress={handleCancel}
                className="flex-1 py-3 rounded-lg items-center"
                style={{ backgroundColor: cancelButtonColor }}
                activeOpacity={0.8}
              >
                <Text className="text-white text-base font-medium font-['SFProDisplayRegular']">
                  {cancelText}
                </Text>
              </TouchableOpacity>

              {/* Confirm Button */}
              <TouchableOpacity
                onPress={handleConfirm}
                className="flex-1 py-3 rounded-lg items-center"
                style={{ backgroundColor: confirmButtonColor }}
                activeOpacity={0.8}
              >
                <Text className="text-white text-base font-medium font-['SFProDisplayRegular']">
                  {confirmText}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

// Пример использования компонента
// const ExampleUsage: React.FC = () => {
//   const [showDeleteDrawer, setShowDeleteDrawer] = React.useState(false);
//   const [showLogoutDrawer, setShowLogoutDrawer] = React.useState(false);

//   const handleDeleteAccount = () => {
//     console.log('Аккаунт удален');
//     // Логика удаления аккаунта
//   };

//   const handleLogout = () => {
//     console.log('Выход из аккаунта');
//     // Логика выхода
//   };

//   return (
//     <View className="flex-1 bg-gray-900 justify-center items-center">
//       {/* Trigger Buttons */}
//       <TouchableOpacity
//         onPress={() => setShowDeleteDrawer(true)}
//         className="bg-red-600 px-6 py-3 rounded-lg mb-4"
//       >
//         <Text className="text-white font-medium">Удалить аккаунт</Text>
//       </TouchableOpacity>

//       <TouchableOpacity
//         onPress={() => setShowLogoutDrawer(true)}
//         className="bg-blue-600 px-6 py-3 rounded-lg"
//       >
//         <Text className="text-white font-medium">Выйти</Text>
//       </TouchableOpacity>

//       {/* Confirmation Drawers */}
//       <ConfirmationDrawer
//         visible={showDeleteDrawer}
//         title="Удалить аккаунт?"
//         onClose={() => setShowDeleteDrawer(false)}
//         onConfirm={handleDeleteAccount}
//         onCancel={() => console.log('Отменено')}
//         confirmText="Да"
//         cancelText="Нет"
//         confirmButtonColor="#DC2626" // red-600
//       />

//       <ConfirmationDrawer
//         visible={showLogoutDrawer}
//         title="Выйти из аккаунта?"
//         onClose={() => setShowLogoutDrawer(false)}
//         onConfirm={handleLogout}
//         onCancel={() => console.log('Отменено')}
//         confirmText="Выйти"
//         cancelText="Отмена"
//       />
//     </View>
//   );
// };

export default ConfirmationDrawer;