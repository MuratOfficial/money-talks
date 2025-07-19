import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import { Image } from 'expo-image';
import { Link } from 'expo-router';

export default function AnalysisButton() {
  return (
   
       <Link href='/finance/screens/analysis/analysis'><TouchableOpacity>
       <View style={styles.analysis}>
         <Image style={styles.analysisImg} source={require('./iconButton/analysis.png')}></Image>
         <Text style={styles.analysisText}>Анализ</Text>
       </View>
       </TouchableOpacity>
       </Link>
     )
   }
   
   const styles = StyleSheet.create({
     analysis:{
        width:  166,
       height: 138,
       backgroundColor: '#333333',
       borderRadius: 16,
       padding: 12,
       justifyContent: 'space-between',
     },
     analysisImg:{
       width: 60,
       height: 60,
     },
     analysisText:{
    color: '#fff',
    lineHeight: 24,
    letterSpacing: -0.41,
    fontSize: 16,
    fontFamily: 'SFProDisplayRegular'
     },
   
   })