import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import AddButtonGreen from '../../components/ui/addButtonGreen'
import InputField from '../../components/ui/inputFields'

export default function addExpense() {
  return (
    <View style={styles.screen} >
    <View style={styles.container}>
      <InputField/>
      <AddButtonGreen></AddButtonGreen>

    </View>
    </View>
  )
}
const styles = StyleSheet.create({
  container:{
    backgroundColor: '#121212',
    alignItems: 'center',
    width: 366,
    height: 700,
    justifyContent: 'space-between'
  },
    screen:{
    width: 375,
    height: 812,
    backgroundColor: '#121212',
  },

})

// если делать контейнер 812, нижний компонент не виден для редактирования