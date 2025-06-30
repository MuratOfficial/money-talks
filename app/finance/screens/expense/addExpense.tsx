import { View, StyleSheet,} from 'react-native'
import React from 'react'
import AddButtonGreen from '../../components/ui/addButtonGreen'
import InputField from '../../components/ui/inputFields'
import BackButtonHeader from '../../components/ui/backButtonHeader'






export default function AddExpense() {
  
  return (
    <View style={styles.screen} >
     <View style={styles.container}>
       <BackButtonHeader link='/finance/screens/expense/expense'  title='Добавить расход'/>
       <View style={styles.inputContainer}>
           <InputField title='Название' placeHolderTitle='Введите название'/>
           <InputField title='Сумма' placeHolderTitle='Введите сумму'/>
       </View>
       <AddButtonGreen title='Добавить' />
       
     </View>
    </View>
  )
}
const styles = StyleSheet.create({
    container:{
    backgroundColor: '#121212',
    alignItems: 'center',
    width: 366,
    height: 760,
    justifyContent: 'space-between',
 
    
  },
    screen:{
    width: 375,
    height: 812,
    backgroundColor: '#121212',
    display: 'flex',
    alignItems: 'center'
  },
   inputContainer:{
    width: 343,
    height: 400,
    gap : 16,
 }, 
  

})
