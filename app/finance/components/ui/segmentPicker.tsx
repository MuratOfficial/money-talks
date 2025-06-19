 import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
 import React from 'react'
 import { useState } from 'react';
 
 
  export default function SegmentPicker() {
  const [activeTab, setActiveTab] = useState<'Регулярные' | 'Нерегулярные'>('Регулярные');
 
   return (
     <View style={styles.tabs}>
      {['Регулярные', 'Нерегулярные'].map(tab =>(
        <TouchableOpacity
        key={tab}
        onPress={()=>setActiveTab (tab as 'Регулярные' | 'Нерегулярные')}
        style={[styles.tab, activeTab === tab && styles.activeTab]}>
            <Text style={styles.tabText}>{tab}</Text>
        </TouchableOpacity>
      ))}
     </View>
     
   );
 }


 const styles = StyleSheet.create({
tabs:{
        flexDirection: 'row',
    marginBottom: 10,
    
},
tab:{
    width: 169,
    height:32,
    borderRadius: 7,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E1E1E',
    marginRight: 0,
},
tabText:{
     color: 'white',
     fontWeight: '500',
},
activeTab:{
     backgroundColor: '#3C3C3C',
},
 })
 