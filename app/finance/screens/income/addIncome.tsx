import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import AddButtonGreen from '../../components/ui/addButtonGreen'
import InputField from '../../components/ui/inputFields'
import BackButtonHeader from '../../components/ui/backButtonHeader'





export default function AddIncome() {
  
  return (
    <View style={styles.screen} >
    <View style={styles.container}>
      <BackButtonHeader link='/finance/screens/income/income' title='Добавить доход'/>
          <InputField title='Название' placeHolderTitle='Введите название'/>
          <InputField title='Сумма' placeHolderTitle='Введите сумму'/>
      <AddButtonGreen title='Добавить'/>
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
    display: 'flex',
    alignItems: 'center'
    
  },
  icon: {
        width: 24,
        height: 24,
        color: '#fff'},
  header:{
        color: '#fff',
        fontWeight: 'bold'},

})

