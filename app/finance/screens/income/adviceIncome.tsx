import { View, Text, StyleSheet, Linking, TouchableOpacity } from 'react-native'
import React from 'react'
import BackButtonHeader from '../../components/ui/backButtonHeader';
import LinkToTutorial from '../../components/ui/linkToTutorial';
// corect css, composition


const AdviceIncome:React.FC=()=> {

return (
    <View style={styles.container}>
        <BackButtonHeader link='/finance/screens/income/income' title='Подсказки про доходы'></BackButtonHeader>
        <View style={styles.textSection}>
               <Text style={styles.sectionTitle}>Доходы 💰</Text>
               <Text style={styles.text}>
                📌 <Text style={styles.bold}>Активный доход</Text> – деньги, которые ты получаешь за свою работу (зарплата, фриланс, бизнес). Без твоего участия дохода нет.
               </Text>
               <Text style={styles.text}>
               📌 <Text>Пассивный доход</Text> – деньги, которые приходят без твоего активного труда (дивиденды, аренда, проценты по вкладам). Чем больше пассивного дохода, тем ближе финансовая свобода.
               </Text>
               <Text style={styles.text}>
               📌 <Text style={styles.bold}>Доход</Text> – это не только зарплата! Есть много способов получать деньги: инвестиции, кешбэки, кэшфлоу от недвижимости, партнерские программы.
               </Text>
       
               <View>
                 <Text style={styles.text2}><Text>1. Регулярные доходы:{`\n`}
                 Зарплата, пенсия, арендная плата.{`\n`}
                 Подсказка: старайтесь увеличивать источники регулярных доходов.
                 </Text>
               {`\n`}
                 <Text style={styles.text2}>2. Нерегулярные доходы:{`\n`}
                 Подарки, подработки.{`\n`}
                 Подсказка: рассмотрите возможность сдачи недвижимости в аренду для увеличения {`\n`}
                 доходности.</Text>
                 </Text>
             </View>
              
        </View>
        <LinkToTutorial link='https://web.telegram.org/a/#-1002352024763_2'/>
       
    </View>
  );
};

const styles = StyleSheet.create({
  text2:{
      color: '#fff'
  },
  container:{
      backgroundColor: '#121212',
      alignItems: 'center',
      width: 366,
      height: 760,
      // justifyContent: 'space-between',
      gap: 12,
   
  },
  textSection:{
    width:343,
    height: 440,
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
      fontWeight: 'medium',
    letterSpacing: 0},
  bold: {
      fontWeight: 'medium',
      color: '#fff',
  },
 
});
export default AdviceIncome;
