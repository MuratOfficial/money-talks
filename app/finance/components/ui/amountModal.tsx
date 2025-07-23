import React, { useState } from 'react';
import {View,Text,Modal,TextInput,TouchableOpacity,StyleSheet,} from 'react-native';
import { HiOutlineBackspace } from "react-icons/hi2";
import { MdOutlineDone } from "react-icons/md";
import { GoXCircleFill } from "react-icons/go";


type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (amount: string) => void;
 title: string;
  children?: React.ReactNode;
};

const AmountModal: React.FC<Props> = ({ visible, onClose, onSubmit,title  }) => {
  const [amount, setAmount] = useState<string>('');

  const handlePress = (value: string) => {
    if (value === 'del') {
      setAmount(prev => prev.slice(0, -1));
    } else {
      setAmount(prev => prev + value);
    }
  };

  const handleSubmit = () => {
    onSubmit(amount);
    setAmount('');
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} >
      <View style={styles.modalBackground}>
        <View style={styles.container}>
          <View style={styles.close}><Text style={styles.title}>{title}</Text>
                    <TouchableOpacity  onPress={onClose}>
            <GoXCircleFill size={25} color='#999'/>
          </TouchableOpacity>
          </View>
          <Text style={styles.amount}>{amount || '0'} ₸</Text>

          <View style={styles.keyboard}>
            {['1','2','3','4','5','6','7','8','9','del','0','ok'].map((key, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.key,
                  key === 'ok' && styles.okButton,
                  key === 'del' && styles.delButton
                ]}
                onPress={() => {
                  if (key === 'ok') handleSubmit();
                  else handlePress(key);
                }}
              >
                <Text style={styles.keyText}>
                  {key === 'del' ? <HiOutlineBackspace size={27}/> : key === 'ok' ? <MdOutlineDone size={26}/> : key}
                </Text>
              </TouchableOpacity>
            ))}
          </View>


        </View>
      </View>
    </Modal>
  );
};

export default AmountModal;

const styles = StyleSheet.create({
  modalBackground: {
    width: 375,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 14,
    top: 355
  },
  container: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 0,
    
  },
  title: {
    color: '#fff',
    fontSize: 17,
    marginBottom: 10,
    fontFamily: 'InterSemiBold',
    lineHeight: 22,
    letterSpacing: -0.41,
  },
  amount: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    height: 110,
    paddingTop: 34,
    
  },
  keyboard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    height: 256,
    gap: 5,

  },
  key: {
    width: 117,
    height: 60,
    backgroundColor: '#6F6F70',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  keyText: {
    color: '#fff',
    fontSize: 25,
  },
  okButton: {
    backgroundColor: '#4CAF50',
  },
  delButton: {
    backgroundColor: '#1C1C1E',
  },
  close: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  height: 57,
  paddingLeft: 16,
  paddingRight: 16,
  paddingTop: 30,
  },
});

