import { View, StyleSheet,} from 'react-native'
import React from 'react'
import AddButtonGreen from '../../components/ui/addButtonGreen'
import InputField from '../../components/ui/inputFields'
import BackButtonHeader from '../../components/ui/backButtonHeader'

export default function AddLiabilities() {
  
const handlePress=()=>{
  console.log('GreenButton')
}

  return (
    <View style={styles.screen} >
     <View style={styles.container}>
       <BackButtonHeader link='/finance/screens/liabilities/liabilities'  title='Добавить пассивы'/>
       <View style={styles.inputContainer}>
           <InputField title='Название' placeHolder='Введите название'/>
           <InputField title='Текущая стоимость пассива' placeHolder='Введите стоимость'/>
           <InputField title='Расход на содержание пассива в год' placeHolder='Введите расход пассива'/>
       </View>
       <AddButtonGreen onPress={handlePress} title='Добавить' />
       
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
