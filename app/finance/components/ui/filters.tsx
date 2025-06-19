import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
// fix css

export default function Filters() {
    const [filter, setFilter] = useState<'Обязательные' | 'Необязательные'>('Обязательные');

return (
    <View style={styles.filters}>
      <TouchableOpacity
      style={[styles.filterButton, filter === 'Обязательные'&&  styles.activeFilter]}
      onPress={()=>setFilter("Обязательные")}>
              <Text style={styles.filterText}>Обязательные</Text>
      </TouchableOpacity>

      <TouchableOpacity
          style={[styles.filterButton2, filter === 'Необязательные' && styles.activeFilter]}
          onPress={() => setFilter('Необязательные')}>
              <Text style={styles.filterText}>Необязательные</Text>
      </TouchableOpacity>

        <TouchableOpacity style={styles.dateRange}>
          <Text style={styles.dateText}>За месяц</Text>
          <Ionicons name="swap-vertical" size={16} color="white" />
        </TouchableOpacity>
      
        
    </View>
  )
}

const styles = StyleSheet.create({
filters: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
    gap: 8,
    width: 324,
    height: 30,
    
  },
filterButton: {
    width: 100,
    height: 30,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#1E1E1E',},
filterButton2: {
    width: 113,
    height: 30,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#1E1E1E',},
filterText: {
    color: '#FFFFFF',
    fontSize: 11,
    letterSpacing: 0,
    fontWeight: 500,
  },
activeFilter: {
    backgroundColor: '#2AA651',
  },
   dateRange: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    backgroundColor: '#1E1E1E',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
dateText: {
    color: '#FFFFFF',
    marginRight: 4,
    fontSize: 11,
    letterSpacing: 0,
    fontWeight: 500,}

})