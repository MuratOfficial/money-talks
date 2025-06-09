import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import { Image } from 'expo-image';

export default function AssetsButton() {
  return (
 
     <TouchableOpacity>
     <View style={styles.assets}>
       <Image style={styles.assetsImg}></Image>
       <Text style={styles.assetsText}>Активы</Text>
     </View>
     </TouchableOpacity>
   )
 }
 
 const styles = StyleSheet.create({
   assets:{
      width:  166,
     height: 138,
     backgroundColor: '#000000',
     borderRadius: 16,
     padding: 12,
   },
   assetsImg:{
     width: 60,
     height: 60,
   },
   assetsText:{
     color: '#fff'
   },
 
 })