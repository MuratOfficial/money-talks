import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'

//большая кнопка(зеленая)

export default function AddButtonGreen() {
  return (
    <TouchableOpacity style={styles.button} onPress={alert}>
            <Text style={styles.buttonText}>{'Добавить'}</Text>
        </TouchableOpacity>
  )
}
const styles = StyleSheet.create({
    button:{
   width: 343,
   height: 50,
   backgroundColor:'#2AA651',
   borderRadius: 14,
    alignItems:'center',
    justifyContent: 'center',
},
buttonText:{
    width: 76,
    height: 22,
}
    
})