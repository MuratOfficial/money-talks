import React from 'react';
import { View, Modal, TouchableOpacity, Dimensions, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface FaceIDModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onError?: () => void;
}

const FaceIDModal: React.FC<FaceIDModalProps> = ({ 
  visible, 
  onClose, 
  onSuccess,
  onError 
}) => {

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      statusBarTranslucent={true}
      presentationStyle="overFullScreen"
    >
      <View 
        className="flex-1 bg-black/70"
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: Dimensions.get('window').width,
          height: Dimensions.get('window').height,
        }}
      >
        {/* Blur overlay effect */}
        <View 
          className="absolute bg-gray-900/60" 
          style={{
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: '100%',
          }}
        />
        
        {/* Close button */}
        <TouchableOpacity 
          onPress={onClose}
          className="absolute z-10 w-10 h-10 bg-black/30 rounded-full items-center justify-center"
          style={{
            top: 50,
            right: 20,
          }}
          activeOpacity={0.7}
        >
          <MaterialIcons name="close" size={24} color="white" />
        </TouchableOpacity>

        {/* Face ID Icon centered */}
        <View 
          className="items-center justify-center"
          style={{
            flex: 1,
            width: '100%',
            height: '100%',
          }}
        >
          <View className="w-32 h-32 bg-gray-800/80 rounded-3xl items-center justify-center border border-gray-700/50">
            <MaterialIcons name="face" size={48} color="#10B981" />
            <Text className="text-white text-lg font-semibold font-['SFProDisplaySemiBold']">
                          Face ID
                        </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default FaceIDModal;