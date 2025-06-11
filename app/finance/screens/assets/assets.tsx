import { View, Text, StyleSheet } from 'react-native'
import React from 'react'



export default function Assets() {
  return (
    <View style={styles.container}>
      <Text style={styles.text} >Assets</Text>
      
    </View>
  )
}
const styles=StyleSheet.create({
  container:{
    backgroundColor: '#121212',
    flex:1,
  },
  text:{
    color: '#fff',

  }
})
