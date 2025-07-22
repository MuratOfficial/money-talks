import { View, Text, StyleSheet, ScrollView } from 'react-native'
import React from 'react'
import BackButtonHeader from '../../components/ui/backButtonHeader';
import LinkToTutorial from '../../components/ui/linkToTutorial';

export default function adviceLiabilities() {
  
return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <BackButtonHeader link='/finance/screens/analysis/analysis' title='Подсказки про пассивы'></BackButtonHeader>
        <ScrollView style={styles.textSection}>
          
               <Text style={styles.sectionTitle}>🔹 Раздел "Анализ" (сводный финансовый анализ пользователя) {`\n`}В этом разделе автоматически анализируются доходы, расходы, активы, пассивы и рассчитываются два ключевых показателя:</Text>
               <Text style={styles.text}>
               ✔️ <Text style={styles.text}>Дельта (разница между доходами и расходами)</Text> 
               </Text>
               <Text style={styles.text}>
               ✔️ <Text>Чистый капитал (активы – пассивы)</Text>
               </Text>
               <Text style={styles.text}>
               📊 <Text style={styles.text}>1. Расчет дельты (разницы между доходами и расходами)</Text>
               </Text>
                              <Text style={styles.text}>
               📌 <Text style={styles.text}>Формула:</Text>{`\n`} 📈 Дельта = Доходы – Расходы
               </Text>
                <Text style={styles.text}>
               💡 <Text style={styles.text}>Что это значит?</Text>{`\n`}•Если дельта положительная → ты создаёшь капитал и можешь инвестировать.
               {`\n`}•Если дельта нулевая → ты живёшь от зарплаты до зарплаты.
               {`\n`}•Если дельта отрицательная → ты проедаешь сбережения или берёшь кредиты.
               </Text>

                <Text style={styles.text}>
               1.🛑 <Text style={styles.text}>Опасность отрицательной дельты:</Text>
               {`\n`}•Если тратить больше, чем зарабатывать → можно легко оказаться в долговой яме.
               {`\n`}•Даже высокий доход не спасёт, если расходы его превышают.
               {`\n`}•Финансовые проблемы чаще случаются не из-за маленьких доходов, а из-за неконтролируемых расходов.
               </Text>

                               <Text style={styles.text}>
               2.✅ <Text style={styles.text}>Рекомендации в зависимости от дельты:</Text>
               {`\n`}•Маленькая дельта (до 10% от доходов) → увеличивай разницу: сокращай лишние траты, ищи дополнительные источники дохода.
               {`\n`}•Отрицательная дельта → проверь расходы и пассивы, оптимизируй их.
               {`\n`}•Дельта 20% и выше → супер, можешь направить её на создание капитала!
               </Text>



                              <Text style={styles.text}>
               📊 <Text style={styles.text}>2. Расчет чистого капитала</Text>
               </Text>
                              <Text style={styles.text}>
               📌 <Text style={styles.text}>Формула:</Text>{`\n`} 📈 Чистый капитал = Активы – Пассивы
               </Text>
                <Text style={styles.text}>
               💡 <Text style={styles.text}>Что это значит?</Text>
               {`\n`}•Если чистый капитал положительный → ты наращиваешь богатство.
               {`\n`}•Если чистый капитал отрицательный → ты живёшь в кредит и можешь попасть в финансовую яму.
               </Text>

                <Text style={styles.text}>
               1.🛑 <Text style={styles.text}>Опасность отрицательного чистого капитала:</Text>
               {`\n`}•Долги могут расти быстрее, чем доходы.
               {`\n`}•В кризисной ситуации (болезнь, потеря работы) — риск банкротства.
                </Text>

                <Text style={styles.text}>
               2.✅ <Text style={styles.text}>Рекомендации в зависимости от чистого капитала:</Text>
               {`\n`}•Чистый капитал с минусом → срочно пересмотри пассивы (закрой долги, избавься от убыточных активов).
               {`\n`}•Нулевой капитал → начни создавать его: накапливай, инвестируй.
               {`\n`}•Высокий капитал → супер, но проверь его ликвидность (если всё в недвижимости, нет ли риска, что деньги не будут доступны в нужный момент?)
               </Text>
        </ScrollView>
        <LinkToTutorial link='https://web.telegram.org/a/#-1002352024763_2'/>
       
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
      lineHeight: 22,
      fontWeight: 400,
      letterSpacing: -0.41
    },
  text: {
      fontSize: 14,
      color: '#fff',
      lineHeight: 22,
      fontWeight: 400,
      letterSpacing: -0.41},

 
});
