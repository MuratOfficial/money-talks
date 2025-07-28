import { View, Text,TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import { Image } from 'expo-image';
import { Link } from 'expo-router';

export default function LiabilitiesButton() {
  return (
      <Link href='/main/finance/screens/liabilities/liabilities'><TouchableOpacity>
      <View style={styles.liabilities}>
        <Image style={styles.liabilitiesImg} source={require('./iconButton/liabilities.png')}></Image>
        <Text style={styles.liabilitiesText}>Пассивы</Text>
      </View>
      </TouchableOpacity>
      </Link>
   )
 }
 const styles = StyleSheet.create({
   liabilities:{
      width:  166,
     height: 138,
     backgroundColor: '#333333',
     borderRadius: 16,
     padding: 12,
     justifyContent: 'space-between',
   },
   liabilitiesImg:{
     width: 60,
     height: 60,
   },
   liabilitiesText:{
    color: '#fff',
    lineHeight: 24,
    letterSpacing: -0.41,
    fontSize: 16,
    fontFamily: 'SFProDisplayRegular'
   },
 })