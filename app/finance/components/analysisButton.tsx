import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import { Image } from 'expo-image';

export default function AnalysisButton() {
  return (
   
       <TouchableOpacity>
       <View style={styles.analysis}>
         <Image style={styles.analysisImg}></Image>
         <Text style={styles.analysisText}>Активы</Text>
       </View>
       </TouchableOpacity>
     )
   }
   
   const styles = StyleSheet.create({
     analysis:{
        width:  166,
       height: 138,
       backgroundColor: '#000000',
       borderRadius: 16,
       padding: 12,
     },
     analysisImg:{
       width: 60,
       height: 60,
     },
     analysisText:{
       color: '#fff'
     },
   
   })