import { View, Text, StyleSheet, ScrollView } from 'react-native'
import React from 'react'
import BackButtonHeader from '../../components/ui/backButtonHeader';
import LinkToTutorial from '../../components/ui/linkToTutorial';

export default function adviceLiabilities() {
  
return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <BackButtonHeader link='/finance/screens/liabilities/liabilities' title='Подсказки про пассивы'></BackButtonHeader>
        <ScrollView style={styles.textSection}>
          
               <Text style={styles.sectionTitle}>Пассивы 📉</Text>
               <Text style={styles.text}>
                📌 <Text style={styles.bold}>Пассив</Text> – это то, что забирает деньги. Кредиты, рассрочки, лишние подписки.
               </Text>
               <Text style={styles.text}>
               📌 <Text>Квартира в ипотеке</Text> это не актив, а пассив, пока она не сдаётся в аренду.
               </Text>
               <Text style={styles.text}>э
               📌 <Text style={styles.bold}>Финансовая ловушка</Text> – покупать вещи в кредит, которые теряют в цене.
               </Text>
                <Text style={styles.text}>
               📌 <Text style={styles.bold}>Цель</Text> – минимизировать пассивы и увеличивать активы.
               </Text>
               
       
               <View>
                 <Text style={styles.text2}><Text>1. Кредиты и долги:{`\n`}
                 <Text style={styles.text3}>Ипотека, автокредиты, потребительские кредиты.{`\n`}
                 Подсказка: используйте методы "лавина" (сначала погашайте долги с высокими процентами){`\n`}
                или "снежный ком" (сначала погашайте маленькие долги).
                 </Text>
                 </Text>
               {`\n`}
                 <Text style={styles.text2}>2. Не нужные активы:{`\n`}
                 <Text style={styles.text3}>Вещи, которые не приносят пользу или доход.{`\n`}
                 Подсказка: избавьтесь от ненужных активов, чтобы сократить расходы на их содержание. 
                
                 </Text></Text>
                 </Text>
             </View>
              
        </ScrollView>
        <LinkToTutorial link='https://web.telegram.org/a/#-1002352024763_2'/>
       
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
 text3:{ 
      fontWeight: 300,

  },
  text2:{
      color: '#fff',
      fontWeight: 500,
  },
  container:{
      backgroundColor: '#121212',
      alignItems: 'center',
      width: 366,
      height: 760,
      gap: 12,
  },
  textSection:{
    width:343,
    height: 638,
  },
  screen:{
      width: 375,
      height: 812,
      backgroundColor: '#121212',
      display: 'flex',
      alignItems: 'center'
  },
  sectionTitle: {
      fontSize: 14,
      color: '#fff',
      fontWeight: '500',
  },
  text: {
      fontSize: 14,
      color: '#fff',
      lineHeight: 22,
      fontWeight: 400,
      letterSpacing: -0.41},
  bold: {
      fontWeight: 500,
      color: '#fff',
  },
 
});
