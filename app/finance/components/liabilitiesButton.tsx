import { View, Text,TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import { Image } from 'expo-image';
import { Link } from 'expo-router';

export default function LiabilitiesButton() {
  return (
      <Link href='/finance/screens/liabilities/liabilities'><TouchableOpacity>
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
     backgroundColor: '#5B5B5B',
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