import { View, Text, StyleSheet, Linking, TouchableOpacity } from 'react-native'
import React from 'react'
import BackButtonHeader from '../../components/ui/backButtonHeader';
import LinkToTutorial from '../../components/ui/linkToTutorial';
import { ScrollView } from 'react-native-gesture-handler';



const AdviceIncome:React.FC=()=> {

return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <BackButtonHeader link='/main/finance/screens/income/income' title='Подсказки про доходы'></BackButtonHeader>
        <ScrollView style={styles.textSection}>
          
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
                <Text style={styles.text3}> Зарплата, пенсия, арендная плата.{`\n`}
                 Подсказка: старайтесь увеличивать источники регулярных доходов.
                </Text> </Text>
               {`\n`}
                 <Text style={styles.text2}>2. Нерегулярные доходы:{`\n`}
                 <Text style={styles.text3}>Подарки, подработки.{`\n`}
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
      // justifyContent: 'space-between',
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
export default AdviceIncome;
