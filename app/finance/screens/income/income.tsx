import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import AddButton from '../../components/ui/addButton'

import { Link } from 'expo-router'

import SegmentPicker from '../../components/ui/segmentPicker'
import Filters from '../../components/ui/filters'
import CircleAddButton from '../../components/ui/circleAddButton'
import NavBar from '../../components/ui/navBar'


  //спросить как сделать расположение, нижний компонет пропадает


export default function Income() {
  return (
     <View style={styles.screen}>
    <View style={styles.container}>
        < View>
      <NavBar title = 'Доходы' ></NavBar>
      <SegmentPicker></SegmentPicker>
      <Filters></Filters>
      <CircleAddButton></CircleAddButton>
        </View>
  
      <View style={styles.container2}>
      <Text style={styles.textBold} >У вас пока нет доходов</Text>
      <Text style={styles.text}>Добавьте ваши доходы, начните отслеживать свои денежные потоки</Text>
        <Link href={'/finance/screens/income/addIncome'} > <AddButton/>
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
    display: 'flex',
    alignItems: 'center'
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

