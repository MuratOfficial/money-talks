import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import { GoXCircleFill } from 'react-icons/go';
import AddButtonGreen from './addButtonGreen';
import { Input } from 'postcss';
import { BlurView } from 'expo-blur';

// Доделай Radio Button, css, придумай как сделать blur screen!!!!

type SortOtion ='сегодня'|'месяц'|'год';
interface Props{
    visible: boolean;
    onClose:()=>void;
    onSelect:(value: SortOtion)=>void;
    selected: SortOtion;


}


const ModalSorting:React.FC<Props> = ({visible,onClose,onSelect,selected}) => {
const [current, setCurrent]=useState<SortOtion>(selected);
const handleConfirm=()=>{
  onSelect(current);}

 const handlePress=()=>{console.log('GreenButton')}

  return (
    <Modal animationType='fade' transparent visible={visible}>
      <BlurView intensity={30} tint='light' style={styles.blur}>
    <View style={styles.ModalBackGround}>
        <View style={styles.container}>
          <View style={styles.close}>
            <Text style={styles.title}>Сортировка</Text>
             <TouchableOpacity  onPress={onClose}>
                  <GoXCircleFill size={25} color='#999'/>
             </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.option} onPress={()=>setCurrent('сегодня')}>
            <Text style={styles.optionText}>сегодня</Text>
            <View style={[styles.radio, current==='сегодня'&& styles.radioActive]}/>
          </TouchableOpacity>
          
                    <TouchableOpacity style={styles.option} onPress={()=>setCurrent('месяц')}>
            <Text style={styles.optionText}>месяц</Text>
            <View style={[styles.radio, current==='месяц' && styles.radioActive]}/>
          </TouchableOpacity>

                    <TouchableOpacity style={styles.option} onPress={()=>setCurrent('год')}>
            <Text style={styles.optionText}>год</Text>
            <View style={[styles.radio, current==='год' && styles.radioActive]}/>
          </TouchableOpacity>
             <AddButtonGreen onPress={handlePress} title='Выбрать'/>
             
        </View>
    </View>
      </BlurView>
    </Modal>
    
  )
}


const styles = StyleSheet.create({
   option: {
    backgroundColor: '#333333',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
    marginHorizontal: 16,

  },
  optionText: {
    color: '#ffffff',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0,
    fontFamily: 'SFProDisplayRegular'

  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#555',
    backgroundColor: 'transparent',
  },
  radioActive: {
    borderColor: '#00cc66',
    backgroundColor: '#00cc66',},
  blur:{
       flex: 1,   
  },
  close: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   height: 57,
   paddingLeft: 16,
   paddingRight: 16,
   paddingTop: 30,
   marginBottom: 12,
  },
  title: {
    color: '#fff',
    fontSize: 17,
    marginBottom: 10,
    fontFamily: 'InterSemiBold',
    lineHeight: 22,
    letterSpacing: -0.41,
    },
    ModalBackGround:{
        width: 375,
        height: 358,
        backgroundColor: '#1C1C1E',
        // backgroundColor:'#07fc03',
        borderRadius: 14,
        top: 520,
        // left: 500,
    },
    container: {
        backgroundColor: '#1C1C1E',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },

})

export default ModalSorting