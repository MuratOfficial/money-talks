// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   Modal,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
// } from 'react-native';

// type Props = {
//   visible: boolean;
//   onClose: () => void;
//   onSubmit: (amount: string) => void;
// };

// const AmountModal: React.FC<Props> = ({ visible, onClose, onSubmit }) => {
//   const [amount, setAmount] = useState<string>('');

//   const handlePress = (value: string) => {
//     if (value === 'del') {
//       setAmount(prev => prev.slice(0, -1));
//     } else {
//       setAmount(prev => prev + value);
//     }
//   };

//   const handleSubmit = () => {
//     onSubmit(amount);
//     setAmount('');
//   };

//   return (
//     <Modal animationType="slide" transparent visible={visible}>
//       <View style={styles.modalBackground}>
//         <View style={styles.container}>
//           <Text style={styles.title}>Продукты</Text>
//           <Text style={styles.amount}>{amount || '0'} ₸</Text>

//           <View style={styles.keyboard}>
//             {['1','2','3','4','5','6','7','8','9','del','0','ok'].map((key, index) => (
//               <TouchableOpacity
//                 key={index}
//                 style={[
//                   styles.key,
//                   key === 'ok' && styles.okButton,
//                   key === 'del' && styles.delButton
//                 ]}
//                 onPress={() => {
//                   if (key === 'ok') handleSubmit();
//                   else handlePress(key);
//                 }}
//               >
//                 <Text style={styles.keyText}>
//                   {key === 'del' ? '⌫' : key === 'ok' ? '✓' : key}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </View>

//           <TouchableOpacity onPress={onClose} style={styles.close}>
//             <Text style={{ color: '#999' }}>✕</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </Modal>
//   );
// };

// export default AmountModal;

// const styles = StyleSheet.create({
//   modalBackground: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.4)',
//     justifyContent: 'flex-end',
//   },
//   container: {
//     backgroundColor: '#1e1e1e',
//     borderTopLeftRadius: 16,
//     borderTopRightRadius: 16,
//     padding: 24,
//   },
//   title: {
//     color: '#fff',
//     fontSize: 18,
//     marginBottom: 10,
//   },
//   amount: {
//     color: '#fff',
//     fontSize: 28,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     marginVertical: 12,
//   },
//   keyboard: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'center',
//   },
//   key: {
//     width: '30%',
//     margin: '1.5%',
//     aspectRatio: 1,
//     backgroundColor: '#444',
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: 10,
//   },
//   keyText: {
//     color: '#fff',
//     fontSize: 24,
//   },
//   okButton: {
//     backgroundColor: '#4CAF50',
//   },
//   delButton: {
//     backgroundColor: '#666',
//   },
//   close: {
//     alignItems: 'center',
//     marginTop: 10,
//   },
// });


