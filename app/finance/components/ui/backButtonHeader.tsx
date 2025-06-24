import { View, Text, TouchableOpacity, StyleSheet, } from 'react-native'
import React from 'react'

import { Link } from 'expo-router'
import { IoChevronBack } from "react-icons/io5";

interface backButtonHeaderProps {
  title: string;
}
const BackButtonHeader: React.FC<backButtonHeaderProps> = ({ title }) =>  {


  return (
    <View style={styles.container}>
     <Link href='/finance/screens/expense/expense' ><TouchableOpacity >
             <IoChevronBack style={styles.icon}/>
           </TouchableOpacity>
           </Link>
           <Text style={styles.header}>{title}</Text>
           <View style={styles.emptyBox}></View>
           
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
    },
    emptyBox:{
        width: 28,
        height: 28,
    },
     icon: {
        width: 28,
        height: 28,
        color: '#fff'
        
    },
    header:{
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
        
    },
})
export default BackButtonHeader