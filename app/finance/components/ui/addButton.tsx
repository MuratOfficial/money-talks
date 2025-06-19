import { View, Text, StyleSheet, TouchableOpacity, Button } from 'react-native'
import React from 'react'
import Feather from '@expo/vector-icons/Feather';
 
// маленькая кнопка c +

export default function AddButton() {
  return (
   
    <TouchableOpacity   style={styles.container}>
      <Text style={styles.text}>Добавить</Text>
      <Feather name="plus-circle" size={18} color="white" />
    </TouchableOpacity>
  )
}
const styles = StyleSheet.create({
    container:{
        width:170,
        height: 34,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#fff',
        backgroundColor: '#121212',
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    text:{
        color: '#fff',
        width: 64,
        height: 22,
        letterSpacing: -0.41, 
    }

})