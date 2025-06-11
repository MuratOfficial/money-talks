import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import AntDesign from '@expo/vector-icons/AntDesign';



export default function AddButton() {
  return (
    <View style={styles.container}>
      <Text>Добавить</Text>
      <AntDesign  name="pluscircleo" size={18} color="white" />
    </View>
  )
}
const styles = StyleSheet.create({
    container:{
        width:170,
        height: 34,
        borderRadius: 14,
        borderWidth: 1,
    }

})