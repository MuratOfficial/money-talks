import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import { useState } from 'react';

export default function Filters() {
    const [filter, setFilter] = useState<'Обязательные' | 'Необязательные'>('Обязательные');

return (
    <View style={styles.filters}>
      <TouchableOpacity
      style={[styles.filterButton, filter=== 'Обязательные'&&  styles.activeFilter]}
      onPress={()=>setFilter("Обязательные")}>
              <Text style={styles.filterText}>Необязательные</Text>
      </TouchableOpacity>

      <TouchableOpacity
          style={[styles.filterButton, filter === 'Необязательные' && styles.activeFilter]}
          onPress={() => setFilter('Необязательные')}>
              <Text style={styles.filterText}>Необязательные</Text>
      </TouchableOpacity>
        
    </View>
  )
}

const styles = StyleSheet.create({
 filters: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
  },
filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#1E1E1E',},
filterText: {
    color: 'white',
  },
activeFilter: {
    backgroundColor: '#00C853',
  },

})