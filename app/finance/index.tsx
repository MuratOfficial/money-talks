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
    <View style={styles.container} >
        <HeaderTitle style={styles.headerTitle}>Финансы</HeaderTitle>
        <ExpenseButton></ExpenseButton>
    </View>
  )
}
const styles= StyleSheet.create({
    container:{
        width: 343,
        height: 442,
        top: 117,
        left: 16,
        gap: 14,

    },
    headerTitle:{},

})

