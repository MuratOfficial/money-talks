import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import BackButtonHeader from '../../components/ui/backButtonHeader';

export default function AdviceExpense() {
  
return (
    <View style={styles.container}>
        <BackButtonHeader title='Подсказки про доходы'></BackButtonHeader>
        <ul style={styles.paragraph} >
            <li>dfdfdfdfdf</li>
            <li>dfdfdfdfdf</li>
        </ul>
      <Text style={styles.paragraph}>
        11111111111111111111 {`\n`}{`\n`}
        222222222222222222{`\n`}3333333333333{`\n`}
        55555555555555555
      </Text>
      <View style={styles.paragraphSpacing}>
        <Text>бббббббббббббббб</Text>
      </View>
      <Text style={[styles.paragraph, {lineHeight: 24}]}>
       аааааааааааааа
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  paragraph: {
    marginBottom: 10, // Отступ для параграфа
    color: '#fff'
  },
  paragraphSpacing: {
    marginBottom: 20, // Дополнительный отступ
    backgroundColor: '#fff',
    
  },
    container:{
    backgroundColor: '#121212',
    alignItems: 'center',
    width: 366,
    height: 700,
    justifyContent: 'space-between',

  },
    screen:{
    width: 375,
    height: 812,
    backgroundColor: '#121212',
    display: 'flex',
    alignItems: 'center'
  },
  
});
