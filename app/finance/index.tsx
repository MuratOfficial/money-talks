import { View, Text, StyleSheet,  } from 'react-native'
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
        <View style={styles.container} >
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
        paddingLeft: 16,
        paddingRight: 16,
        columnGap: 14, 
        display: 'flex',
    },
    headerTitle:{
        fontFamily: 'SFProDisplaySemiBold',
        // fontWeight: 600,
        fontSize: 24,
        color: '#fff', 
        width: 375,
        height: 65,
        paddingBottom: 18,
        paddingTop: 18,
        paddingLeft: 16,
        paddingRight: 16,
        
    },
    row:{
        flexDirection:"row",
        gap: 11,
    },
    screen:{
         width: 375,
         height: 812,
          backgroundColor: '#121212',
          
        

    }

})


