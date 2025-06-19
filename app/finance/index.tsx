import { View, Text, StyleSheet,  } from 'react-native'
import React from 'react'
import { HeaderTitle } from "@react-navigation/elements";
import ExpenseButton from './components/expenseButton';
import AssetsButton from './components/assetsButton';
import AnalysisButton from './components/analysisButton';
import LiabilitiesButton from './components/liabilitiesButton';
import IncomeButton from './components/incomeButton';




//добавь кнопки !!!


export default function Finance() {
  return (
    <View style={styles.screen}>
      <View style={styles.container} >
         <Text style={styles.headerTitle}>Финансы</Text>
         <View style={styles.row}>
        <ExpenseButton></ExpenseButton>
        <IncomeButton></IncomeButton>
        </View>
        <View style={styles.row}>
        <AssetsButton></AssetsButton>
        <LiabilitiesButton></LiabilitiesButton>
        </View >
        <View style={styles.row}>
        <AnalysisButton></AnalysisButton>
        </View>
      </View>
    </View>
  )
}
const styles= StyleSheet.create({
    container:{
        width: 343,
        height: 442,
        justifyContent: 'space-between',
        left: 16,
        gap: 12, 
    },
    headerTitle:{
        fontWeight: "bold",
        fontSize: 24,
        color: '#fff', 
        width: 365,
        height: 65,
    },
    row:{
        flexDirection:"row",
        gap: 12,
    },
    screen:{
         width: 375,
         height: 812,
          backgroundColor: '#121212',

    }

})


