import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import AddButtonGreen from '../../components/ui/addButtonGreen'
import InputField from '../../components/ui/inputFields'
import BackButtonHeader from '../../components/ui/backButtonHeader'

export default function addExpense() {
  return (
    <View style={styles.screen} >
    <View style={styles.container}>
      <BackButtonHeader></BackButtonHeader>
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
  icon: {
        width: 24,
        height: 24,
        color: '#fff'},
  header:{
        color: '#fff',
        fontWeight: 'bold'},

})

// если делать контейнер 812, нижний компонент не виден для редактирования