import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'

//зеленая круглая кнопка с +
export default function CircleAddButton() {
  return (
    <View>
      <TouchableOpacity style={styles.addButton}>
        <Ionicons name='add' size={34} color='#FFFFFF'/>
      </TouchableOpacity>
    </View>
  )
}
const styles=StyleSheet.create({
    addButton:{
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#2AA651',
        alignItems: 'center',
        justifyContent: 'center',
    }

})