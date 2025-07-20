import { View, Text, StyleSheet, Pressable, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import AddButton from '../../components/ui/addButton'
import { Link } from 'expo-router'
import SegmentPicker from '../../components/ui/segmentPicker'
import Filters from '../../components/ui/filters'
import NavBar from '../../components/ui/navBar'


export default function Income() {
  const [layerVisible, setLayerVisible]= useState(true);
   const [showHint,setShowHint] = useState(true)
   const handlePress = ()=>{
      setShowHint(false);//hide hint
      setLayerVisible(false);//hide Layer
    }
  return (
<Pressable onPress={handlePress} style={styles.pressScreen}>
    <View style={styles.container}>
      <View style={styles.screen}>
        {showHint && (
          <View style={styles.tooltip}>
            <View style={styles.tail}></View> 
         {/* хвостик окна */}
            <Text style={styles.tooltipText}>
              Не знаете, что делать? Нажмите, здесь есть подсказки!
            </Text>
          </View>
        )}
        
        {layerVisible && (<TouchableOpacity style={styles.visible} onPress={handlePress}>
        </TouchableOpacity>)}
{/*  */}
           <View>
      <NavBar link2='/finance/screens/income/adviceIncome' link='/finance' title = 'Доходы' ></NavBar>
      <SegmentPicker></SegmentPicker>
      <Filters></Filters>
           </View>
  
               <View style={styles.container2}>
      <Text style={styles.textBold} >У вас пока нет доходов</Text>
      <Text style={styles.text}>Добавьте ваши доходы, начните отслеживать свои денежные потоки</Text>
        <Link href={'/finance/screens/income/addIncome'} > <AddButton/>
     </Link>
               </View>
     
      </View>
    </View>
  </Pressable>
  )
}
const styles=StyleSheet.create({
  pressScreen:{ 
    backgroundColor: '#fff',
    width: 375,
    height:812,
  },
  screen:{
    width: 375,
    height: 812,
    backgroundColor: '#121212',
    display: 'flex',
    alignItems: 'center'
  },
  container:{
    position: 'relative',
    backgroundColor: '#121212',
    width: 366,
    height: 417,
  },
container2:{
  alignItems: 'center',
  width: 343,
  height: 127,
  gap: 20,
  top: 108,
},
  text:{
    color: '#BDBDBD',
    
  },
  textBold:{
    color: '#fff',
    fontWeight:'bold',
    fontSize: 18,
  },
  tooltip: {
    width: 333,
    height: 72,
    position: 'absolute',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 0,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    transform: [{ translateY: 73 }],
    zIndex: 2,
  },
  tail:{
    width: 10,
    height: 10,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#fff',
    position: 'absolute',
    zIndex: 3,
    left: 310,
    bottom: 72,
    
  },
  tooltipText: {
    width: 301,
    height: 40,
    color: '#000',
    fontSize: 14,
    fontFamily: 'SFProDisplayRegular',
  fontWeight: 400,},

  visible:{
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#5B5B5B',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    opacity: 0.5
    }
})

