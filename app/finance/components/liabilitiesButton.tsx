import { View, Text,TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import { Image } from 'expo-image';

export default function LiabilitiesButton() {
  return (
      <TouchableOpacity>
      <View style={styles.liabilities}>
        <Image style={styles.liabilitiesImg}></Image>
        <Text style={styles.liabilitiesText}>Пассивы</Text>
      </View>
      </TouchableOpacity>
   )
 }
 const styles = StyleSheet.create({
   liabilities:{
      width:  166,
     height: 138,
     backgroundColor: '#000000',
     borderRadius: 16,
     padding: 12,
   },
   liabilitiesImg:{
     width: 60,
     height: 60,
   },
   liabilitiesText:{
     color: '#fff'
   },
 })