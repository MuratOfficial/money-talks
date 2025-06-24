import { View, Text,TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import { Image } from 'expo-image';
import { Link } from 'expo-router';

export default function IncomeButton() {
  return (
     <Link href='/finance/screens/income/income'><TouchableOpacity>
     <View style={styles.income}>
       <Image style={styles.incomeImg} source={require('./iconButton/income.png')}></Image>
       <Text style={styles.incomeText}>Доходы</Text>
     </View>
     </TouchableOpacity>
     </Link>
  )
}
const styles = StyleSheet.create({
  income:{
     width:  166,
    height: 138,
    backgroundColor: '#333333',
    borderRadius: 16,
    padding: 12,
    justifyContent: 'space-between',
  },
  incomeImg:{
    width: 60,
    height: 60,
  },
  incomeText:{
    color: '#fff',
    fontWeight: 'medium',
    fontSize: 16,
  },
})