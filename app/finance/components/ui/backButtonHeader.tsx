import { View, Text, TouchableOpacity, StyleSheet, } from 'react-native'
import React from 'react'
import { GoChevronLeft } from 'react-icons/go'
import { Link } from 'expo-router'


export default function BackButtonHeader() {
  return (
    <View style={styles.container}>
     <Link href='/finance/screens/expense/expense' ><TouchableOpacity>
             <GoChevronLeft style={styles.icon}></GoChevronLeft>
           </TouchableOpacity>
           </Link>
           <Text style={styles.header}>Добавить расходы</Text>
           
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
paddingRight: 100,



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