import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import { GoXCircleFill } from 'react-icons/go';

// Доделай Radio Button, css, придумай как сделать blur screen!!!!


type Props={
    visible: boolean;
    onClose:()=>void;

}


const ModalSorting:React.FC<Props> = ({visible,onClose}) => {
 const [checked, setChecked]=useState()

  return (
    <Modal animationType='slide' visible={visible}
    transparent={true}>
    <View style={styles.ModalBackGround}>
        <View style={styles.container}>
          <View style={styles.close}>
            <Text style={styles.title}>Сортировка</Text>
             <TouchableOpacity  onPress={onClose}>
                  <GoXCircleFill size={25} color='#999'/>
             </TouchableOpacity>
               
          </View>
            
        </View>
    </View>
    </Modal>
  )
}


const styles = StyleSheet.create({
  close: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   height: 57,
   paddingLeft: 16,
   paddingRight: 16,
   paddingTop: 30,
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
        // backgroundColor: 'rgba(0,0,0,0.4)', work color
        backgroundColor:'#07fc03',
        borderRadius: 14,
        top: 355,
        left: 500,
    },
    container: {
        backgroundColor: '#1C1C1E',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
      
       
    },

})

export default ModalSorting