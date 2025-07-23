import { View, Text, StyleSheet,  } from 'react-native'
import React from 'react'


export default function Finance() {
  return (
    
    <View style={styles.screen}>
      <Text style={styles.headerTitle}>Финансы</Text>
        <View style={styles.container} >
   
        </View>
    </View>
  )
}
const styles= StyleSheet.create({
    container:{
        width: 343,
        height: 442,
        justifyContent: 'space-between',
        paddingLeft: 16,
        paddingRight: 16,
        columnGap: 14, 
        display: 'flex',
    },
    headerTitle:{
        fontFamily: 'SFProDisplaySemiBold',
        // fontWeight: 600,
        fontSize: 24,
        color: '#fff', 
        width: 375,
        height: 65,
        paddingBottom: 18,
        paddingTop: 18,
        paddingLeft: 16,
        paddingRight: 16,
        
    },
    row:{
        flexDirection:"row",
        gap: 11,
    },
    screen:{
         width: 375,
         height: 812,
          backgroundColor: '#121212',
          
        

    }

})


