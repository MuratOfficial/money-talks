import { View, Text,TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import { Image } from 'expo-image';

export default function IncomeButton() {
  return (
     <TouchableOpacity>
     <View style={styles.income}>
       <Image style={styles.incomeImg}></Image>
       <Text style={styles.incomeText}>Доходы</Text>
     </View>
     </TouchableOpacity>
  )
}
const styles = StyleSheet.create({
  income:{
     width:  166,
    height: 138,
    backgroundColor: '#000000',
    borderRadius: 16,
    padding: 12,
  },
  incomeImg:{
    width: 60,
    height: 60,
  },
  incomeText:{
    color: '#fff'
  },
})