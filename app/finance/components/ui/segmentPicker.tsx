 import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
 import React from 'react'
 import { useState } from 'react';
 
  const SegmentPicker:React.FC=()=> {
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
    width: 338,
    height:32,
    backgroundColor: '#1E1E1E',
    borderRadius: 7,
    
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
    marginBottom: 16,
},
tabText:{
     color: 'white',
     fontFamily: 'InterMedium',
     lineHeight: 20,
     fontSize: 13,
     letterSpacing: -0.08,
},
activeTab:{
     backgroundColor: '#3C3C3C',
},
 })
 export default SegmentPicker
 