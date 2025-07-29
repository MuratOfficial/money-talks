import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import ExpenseButton from './components/expenseButton';
import AssetsButton from './components/assetsButton';
import AnalysisButton from './components/analysisButton';
import LiabilitiesButton from './components/liabilitiesButton';
import IncomeButton from './components/incomeButton';

export default function Finance() {
  return (
    <View style={styles.screen}>
      <Text style={styles.headerTitle}>Финансы</Text>
      <View style={styles.container}>
        <View style={styles.row}>
          <ExpenseButton></ExpenseButton>
          <IncomeButton></IncomeButton>
        </View>
        <View style={styles.row}>
          <AssetsButton></AssetsButton>
          <LiabilitiesButton></LiabilitiesButton>
        </View>
        <View style={styles.row}>
          <AnalysisButton></AnalysisButton>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#121212',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 32, // Добавил отступ снизу для лучшего вида
  },
  headerTitle: {
    fontFamily: 'SFProDisplaySemiBold',
    fontSize: 20,
    color: '#fff', 
    padding: 16,
    paddingBottom: 18,
  },
  row: {
    flexDirection: "row",
    justifyContent: 'space-between', // Равномерное распределение кнопок в строке
    gap: 11,
    marginBottom: 11, // Отступ между рядами
  }
})