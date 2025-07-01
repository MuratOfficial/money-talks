import { View, Text, StyleSheet, ScrollView,  } from 'react-native'
import React from 'react'
import BackButtonHeader from '../../components/ui/backButtonHeader';
import LinkToTutorial from '../../components/ui/linkToTutorial';



// corect css!!!!




const AdviceExpense:React.FC=()=> {


return (
 <View style={styles.screen}>
    <View style={styles.container}>
     <BackButtonHeader link='/finance/screens/expense/expense' title='Подсказки про расходы'></BackButtonHeader>
        <ScrollView style={styles.textSection}>
        <Text style={styles.sectionTitle}>Расходы 💸</Text>
        <Text style={styles.text}>📌 
        <Text style={styles.bold}>Фиксированные расходы</Text> – обязательные платежи (квартира, кредит, коммуналка, подписки). Эти траты повторяются каждый месяц.</Text>
        <Text style={styles.text}>📌 
        <Text>Переменные расходы</Text> – еда, развлечения, шопинг. Они могут меняться, но именно здесь прячется возможность экономии.</Text>
        <Text style={styles.text}>📌 
        <Text style={styles.bold}>Импульсивные траты</Text> – покупки, о которых ты жалеешь. Перед покупкой спроси себя: "А точно надо?"</Text>
        <Text style={styles.text}>📌 
        <Text style={styles.bold}>Хорошие и плохие расходы</Text> – вложение в здоровье и образование = хорошие. Деньги на бессмысленные вещи = плохие.</Text>

          <View>
                 <Text style={styles.text2}><Text>1. Регулярные расходы:{`\n`}
           Коммунальные платежи, аренда, транспорт.{`\n`}
           Подсказка: оптимизируйте регулярные расходы, чтобы сэкономить.
          </Text>
        {`\n`}
          <Text style={styles.text2}>2. Обязательные расходы:{`\n`}
          Питание, медицина, образование.{`\n`}
          Подсказка: сокращайте излишние траты в обязательных категориях.
          </Text>
        {`\n`}
          <Text style={styles.text2}>3. Необязательные расходы:{`\n`}
          Развлечения, рестораны, покупка ненужных вещей.{`\n`}
          Подсказка: контролируйте необязательные расходы, чтобы не выходить за рамки бюджета.
          </Text>
        {`\n`}
         <Text style={styles.text2}>4. Нерегулярные расходы:{`\n`}
          Ремонт, путешествия, крупные покупки.{`\n`}
          Подсказка: планируйте нерегулярные расходы заранее, чтобы избежать финансовых трудностей.
          </Text>
                 </Text>
          </View>
          
        </ScrollView>
        <LinkToTutorial link='https://web.telegram.org/a/#-1002352024763_2'/>
      
      
     
    </View>

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
      fontWeight: 'medium',
      letterSpacing: 0},
  bold: {
      fontWeight: 'medium',
      color: '#fff',
  },
});

export default  AdviceExpense
