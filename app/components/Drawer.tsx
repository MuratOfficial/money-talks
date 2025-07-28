import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DrawerProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  onSelect: (option:string) => void;
  selectedValue?: string;
  options: string[];
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmButtonColor?: string;
  cancelButtonColor?: string;
}

// const { height: screenHeight } = Dimensions.get('window');

const Drawer = ({ visible, onClose, onSelect, selectedValue = '5 лет', options, title  }:DrawerProps) => {
  const [selectedOption, setSelectedOption] = useState(selectedValue);

  const sortOptions = options;

  //['1 год', '5 лет', '10  лет', '20 лет', '25 лет']

  const handleSelect = () => {
    onSelect(selectedOption);
    onClose();
  };

  const RadioOption = ({ option }:any) => (
    <TouchableOpacity
      onPress={() => setSelectedOption(option)}
      className="bg-[#333333] rounded-xl px-4 py-4 mb-3 flex-row items-center justify-between"
      activeOpacity={0.7}
    >
      <Text className="text-white text-base font-['SFProDisplayRegular']">
        {option}
      </Text>
      
      <View className="w-6 h-6 rounded-full border-2 border-gray-500 items-center justify-center">
        {selectedOption === option && (
          <View className="w-3 h-3 rounded-full bg-[#4CAF50]" />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50 backdrop-blur-sm">
        {/* Backdrop */}
        <TouchableOpacity 
          className="flex-1" 
          activeOpacity={1} 
          onPress={onClose}
        />
        
        {/* Drawer Content */}
        <View 
          className="bg-[#1C1C1E] rounded-t-3xl px-4 pt-6 pb-4"
 
        >
          {/* Handle Bar */}
          <View className="w-10 h-1 bg-gray-600 rounded-full self-center mb-6" />
          
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-white text-lg font-['SFProDisplaySemiBold']">
              {title}
            </Text>
            <TouchableOpacity 
              onPress={onClose}
              className="p-1"
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Options */}
          <View className="">
            {sortOptions.map((option) => (
              <RadioOption key={option} option={option} />
            ))}
          </View>

          {/* Select Button */}
          <TouchableOpacity
            onPress={handleSelect}
            activeOpacity={0.8}
            className="w-full bg-[#4CAF50] py-4 rounded-xl items-center justify-center"
          >
            <Text className="text-white text-base font-['SFProDisplaySemiBold']">
              Выбрать
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Usage Example Component
// const SortDrawerExample = () => {
//   const [showDrawer, setShowDrawer] = useState(false);
//   const [selectedSort, setSelectedSort] = useState('1 год');

//   const handleSortSelect = (value:any) => {
//     setSelectedSort(value);
//     console.log('Selected sort:', value);
//   };

//   return (
//     <View className=" bg-black flex flex-row items-center justify-center w-fit">
//       <TouchableOpacity
//         onPress={() => setShowDrawer(true)}
//         className=" px-3 py-1.5 border border-white w-fit rounded-2xl flex flex-row items-center justify-center gap-2"
//       >
//         <Text className="text-white text-xs font-['SFProDisplayRegular']">
//            {selectedSort}
//         </Text>
//         <View className="w-4 h-4  rounded items-center justify-center">
//                 <Ionicons name="funnel-outline" size={14} color="white" />
//               </View>
//       </TouchableOpacity>

//       <SortDrawer
//         visible={showDrawer}
//         onClose={() => setShowDrawer(false)}
//         onSelect={handleSortSelect}
//         selectedValue={selectedSort}
//       />
//     </View>
//   );
// };

export default Drawer;