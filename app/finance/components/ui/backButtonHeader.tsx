import { View, Text, TouchableOpacity, StyleSheet, } from 'react-native'
import React from 'react'
import { IoChevronBack } from "react-icons/io5";
import { Link } from 'expo-router';

interface BackButtonHeaderProps {
  title: string; // change title 'Расходы' 'Доходы'
  link: string; //link to any /expense,/assets
  
}
const BackButtonHeader: React.FC<BackButtonHeaderProps> = ({ title, link }) =>  {


  return (
    <View style={styles.container}>
      
     <Link href={link as any} asChild><TouchableOpacity >
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