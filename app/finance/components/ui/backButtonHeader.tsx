import { View, Text, TouchableOpacity, StyleSheet, } from 'react-native'
import React from 'react'
import { GoChevronLeft } from 'react-icons/go'


export default function BackButtonHeader() {
  return (
    <View style={styles.container}>
     <TouchableOpacity>
             <GoChevronLeft style={styles.icon}></GoChevronLeft>
           </TouchableOpacity>
           <Text style={styles.header}>Расходы</Text>
           
    </View>
  )
}

const styles= StyleSheet.create({
    container:{
        width: 342,
        height: 52,
flexDirection: 'row',
justifyContent: 'space-between',
marginBottom: 10,
alignItems: 'center',
paddingRight: 154,



    },
     icon: {
        width: 24,
        height: 24,
        color: '#fff'
    },
    header:{
        color: '#fff',
        fontWeight: 'bold'
    },
})