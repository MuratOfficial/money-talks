import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import AddButton from '../../components/ui/addButton'

import { Link } from 'expo-router'
import NavBar from '../../components/ui/navBar'
import SegmentPicker from '../../components/ui/segmentPicker'
import Filters from '../../components/ui/filters'



  //спросить как сделать расположение, нижний компонет пропадает


export default function Expense() {
  return (
     <View style={styles.screen}>
    <View style={styles.container}>
        < View>
      <NavBar></NavBar>
      <SegmentPicker></SegmentPicker>
      <Filters></Filters>
        </View>
  
      <View style={styles.container2}>
      <Text style={styles.textBold} >У вас пока нет расходов</Text>
      <Text style={styles.text}>Добавьте ваши расходы, начните отслеживать свои денежные потоки</Text>
        <Link href={'/finance/screens/expense/addExpense'} > <AddButton/>
     </Link>
      </View>
     
    </View>
    </View>
  )
}
const styles=StyleSheet.create({
  screen:{
    width: 375,
    height: 812,
    backgroundColor: '#121212',
  },
  container:{
    backgroundColor: '#121212',
    alignItems: 'center',
    width: 366,
    height: 417,
    justifyContent: 'space-between',
  },
container2:{
  alignItems: 'center',
  width: 343,
  height: 127,
  gap: 20,
},
  text:{
    color: '#fff',
  },
  textBold:{
    color: '#fff',
    fontWeight:'bold'
  },
  
})
