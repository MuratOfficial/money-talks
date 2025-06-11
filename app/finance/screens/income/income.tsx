import { View, Text, StyleSheet } from 'react-native'
import React from 'react'



export default function Income() {
  return (
    <View style={styles.container}>
      <Text style={styles.text} >Income</Text>
      
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
