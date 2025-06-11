import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import AddButton from '../../components/ui/addButton'
import SegmentedPicker from '../../components/ui/flatList'
import { Link } from 'expo-router'

export default function Expense() {
  return (
    <View style={styles.container}>
      <SegmentedPicker></SegmentedPicker>
      <View style={styles.container}>
      <Text style={styles.text} >У вас пока нет расходов</Text>
       <Text style={styles.textBold}>Добавьте ваши расходы, начните отслеживать свои денежные потоки</Text>
        <Link href={'/finance/screens/expense/addExpense'} > <AddButton/>
     </Link>
      </View>
    </View>
  )
}
const styles=StyleSheet.create({
  container:{
    backgroundColor: '#121212',
    flex:1,
   justifyContent: 'space-around',
    alignItems: 'center'

  },

  text:{
    color: '#fff',
  },
  textBold:{
    color: '#fff'
  },
})
