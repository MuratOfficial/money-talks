import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import { Image } from 'expo-image';
import { Link } from 'expo-router';

export default function ExpenseButton() {
  return (

    <Link href='/main/finance/screens/expense/expense'><TouchableOpacity>
    <View style={styles.expenses}>
      <Image style={styles.expensesImg} source={require('./iconButton/expense.png')}>
</Image>
      
          <Text style={styles.expensesText}>Расходы</Text>
    </View>
    </TouchableOpacity>
    </Link>
  )
}

const styles = StyleSheet.create({
  expenses:{
     width:  166,
    height: 138,
    backgroundColor: '#333333',
    borderRadius: 16,
    padding: 12,
    justifyContent: 'space-between',
  },
  expensesImg:{
    width: 60,
    height: 60,
  },
  expensesText:{
    color: '#fff',
    lineHeight: 24,
    letterSpacing: -0.41,
    fontSize: 16,
    fontFamily: 'SFProDisplayRegular'
  },

})