import { View, Text, StyleSheet, ScrollView } from 'react-native'
import React from 'react'
import BackButtonHeader from '../../components/ui/backButtonHeader';
import LinkToTutorial from '../../components/ui/linkToTutorial';

export default function AdviceLiabilities() {
  
return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <BackButtonHeader link='/main/finance/screens/income/income' title='Подсказки про доходы'></BackButtonHeader>
        <ScrollView style={styles.textSection}>
          
               <Text style={styles.sectionTitle}>Активы 🏡📈</Text>
               <Text style={styles.text}>
                📌 <Text style={styles.bold}>Актив</Text> – это то, что приносит деньги. Недвижимость, акции, депозиты, бизнес.
               </Text>
               <Text style={styles.text}>
               📌 <Text>Главный вопрос</Text> : если ты не работаешь, актив продолжает приносить доход? Если да – это действительно актив.
               </Text>
               <Text style={styles.text}>
               📌 <Text style={styles.bold}>Деньги на карте</Text> – это не актив! Они обесцениваются, если не работают.
               </Text>
                <Text style={styles.text}>
               📌 <Text style={styles.bold}>Лучший актив</Text> – это тот, который приносит стабильный доход с минимальными усилиями
               </Text>
               
       
               <View>
                 <Text style={styles.text2}><Text>1. Ликвидные активы:{`\n`}
                 <Text style={styles.text3}>Наличные, безналичные деньги, вклады, счета.{`\n`}
                 Подсказка: распределяйте средства между вкладами с разной доходностью для{`\n`}
                 увеличения прибыли.
                 </Text>
                 </Text>
               {`\n`}
                 <Text style={styles.text2}>2. Не ликвидные активы:{`\n`}
                 <Text style={styles.text3}>Недвижимость, автомобили.{`\n`}
                 Подсказка: рассмотрите возможность сдачи недвижимости в аренду для увеличения {`\n`}
                 доходности.
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
