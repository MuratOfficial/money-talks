import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import { PiChartPie } from "react-icons/pi";
import { GrPowerForceShutdown } from "react-icons/gr";
import { GoChevronLeft } from "react-icons/go";
import { Link } from 'expo-router';



export default function NavBar() {
    

  return (
    <View style={styles.container}>
     <Link href={'/finance'} >
        <TouchableOpacity>
             <GoChevronLeft style={styles.icon}/>
        </TouchableOpacity>
     </Link>
      <Text style={styles.text}>Расходы</Text>
    <View style={styles.container2}>    
 <TouchableOpacity>
     <PiChartPie style={styles.icon}/>
 </TouchableOpacity>   
 <TouchableOpacity>
     <GrPowerForceShutdown style={styles.icon}/>  
 </TouchableOpacity></View>
    </View>
  )
}
const styles = StyleSheet.create({
    icon: {
        width: 24,
        height: 24,
        color: '#fff'
    },
    text:{
        color: '#fff',
        fontWeight: 'bold'
    },
    container2:{
        flexDirection: "row"
   },
    container:{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: 343,
        height: 52,
        marginBottom: 10,
    },
})