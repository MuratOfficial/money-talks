import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import { Image } from 'expo-image';
import { Link } from 'expo-router';

export default function AssetsButton() {
  return (
 
     <Link href='/main/finance/screens/assets/assets'><TouchableOpacity>
     <View style={styles.assets}>
       <Image style={styles.assetsImg} source={require('./iconButton/assets.png')}></Image>
       <Text style={styles.assetsText}>Активы</Text>
     </View>
     </TouchableOpacity>
     </Link>
   )
 }
 
 const styles = StyleSheet.create({
   assets:{
      width:  166,
     height: 138,
     backgroundColor: '#333333',
     borderRadius: 16,
     padding: 12,
     justifyContent: 'space-between',
   },
   assetsImg:{
     width: 60,
     height: 60,
   },
   assetsText:{
  color: '#fff',
    lineHeight: 24,
    letterSpacing: -0.41,
    fontSize: 16,
    fontFamily: 'SFProDisplayRegular'
   },
 
 })