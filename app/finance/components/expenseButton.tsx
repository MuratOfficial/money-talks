import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import { Image } from 'expo-image';

export default function ExpenseButton() {
  return (

    <TouchableOpacity>
    <View style={styles.expenses}>
      <Image style={styles.expensesImg}></Image>
      <Text style={styles.expensesText}>Расходы</Text>
    </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  expenses:{
     width:  166,
    height: 138,
    backgroundColor: '#000000',
    borderRadius: 16,
    padding: 12,
  },
  expensesImg:{
    width: 60,
    height: 60,
  },
  expensesText:{
    color: '#fff'
  },

})