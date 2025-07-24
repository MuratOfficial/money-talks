
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const App = () => {
  const incomeCategories = [
    { id: 1, name: 'Зарплата', icon: 'wallet', color: '#4FC3F7', amount: '500,000 ₸' },
    { id: 2, name: 'Фриланс', icon: 'laptop', color: '#66BB6A', amount: '0 ₸' },
    { id: 3, name: 'Депозит', icon: 'business', color: '#AB47BC', amount: '200,000 ₸' },
    { id: 4, name: 'Дивиденды', icon: 'trending-up', color: '#FFA726', amount: '100,000 ₸' },
  ];

  const expenseCategories = [
    { id: 1, name: 'Продукты', icon: 'basket', color: '#4FC3F7', amount: '60,000 ₸' },
    { id: 2, name: 'Транспорт', icon: 'car', color: '#66BB6A', amount: '20,000 ₸' },
    { id: 3, name: 'Развлечения', icon: 'game-controller', color: '#AB47BC', amount: '200,000 ₸' },
    { id: 4, name: 'Коммуналка', icon: 'home', color: '#FFA726', amount: '200,000 ₸' },
  ];

  const expenseCategories2 = [
    { id: 5, name: 'Здоровье', icon: 'medical', color: '#4FC3F7', amount: '50,000 ₸' },
    { id: 6, name: 'Образование', icon: 'school', color: '#66BB6A', amount: '0 ₸' },
    { id: 7, name: 'Красота', icon: 'flower', color: '#AB47BC', amount: '0 ₸' },
    { id: 8, name: 'Путешествия', icon: 'airplane', color: '#FFA726', amount: '0 ₸' },
  ];

  const goalCategories = [
    { id: 1, name: 'Автомобиль', icon: 'car-sport', color: '#4FC3F7' },
    { id: 2, name: 'Образование', icon: 'school', color: '#66BB6A' },
    { id: 3, name: 'Путешествия', icon: 'airplane', color: '#AB47BC' },
  ];

  const CategoryItem = ({ item, showAmount = true }:{item?:any, showAmount?:boolean}) => (
    <TouchableOpacity 
      style={[styles.categoryItem, { backgroundColor: item.color }]}
      activeOpacity={0.8}
    >
      <Ionicons name={item.icon} size={24} color="white" style={styles.categoryIcon} />
      <Text style={styles.categoryName}>{item.name}</Text>
      {showAmount && <Text style={styles.categoryAmount}>{item.amount}</Text>}
    </TouchableOpacity>
  );

  const SectionTitle = ({ title, action }:{title:string, action:string}) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
        <Text style={styles.actionText}>{action}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} className='font-sans'>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Главная</Text>
        <TouchableOpacity style={styles.settingsButton} activeOpacity={0.8}>
          <Ionicons name="settings-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Wallet Balance */}
      <View style={styles.walletCard}>
        <View style={styles.walletHeader}>
          <Text style={styles.walletTitle}>Список расходов, доходов, кошелька и целей</Text>
          <TouchableOpacity style={styles.walletSettings} activeOpacity={0.8}>
            <Ionicons name="settings-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.walletBalance}>
          <Text style={styles.walletLabel}>Кошелек</Text>
          <Text style={styles.walletAmount}>820,000 ₸</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Income Section */}
        <SectionTitle title="Доходы" action="Добавить" />
        <View style={styles.categoryRow}>
          {incomeCategories.map((item) => (
            <CategoryItem key={item.id} item={item} />
          ))}
        </View>

        {/* Expense Section */}
        <SectionTitle title="Расходы" action="Добавить" />
        <View style={styles.categoryRow}>
          {expenseCategories.map((item) => (
            <CategoryItem key={item.id} item={item} />
          ))}
        </View>
        <View style={styles.categoryRow}>
          {expenseCategories2.map((item) => (
            <CategoryItem key={item.id} item={item} />
          ))}
        </View>

        {/* Goals Section */}
        <SectionTitle title="Цели" action="Добавить" />
        <View style={styles.categoryRow}>
          {goalCategories.map((item) => (
            <CategoryItem key={item.id} item={item} showAmount={false} />
          ))}
        </View>
        
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Bottom Navigation */}
     
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    paddingTop: 10
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#1a1a1a',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  settingsButton: {
    padding: 5,
  },
  walletCard: {
    backgroundColor: '#66BB6A',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    padding: 20,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  walletTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 10,
  },
  walletSettings: {
    padding: 5,
  },
  walletBalance: {
    alignItems: 'center',
  },
  walletLabel: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.8,
  },
  walletAmount: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  actionButton: {
    backgroundColor: '#333',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  actionText: {
    color: '#fff',
    fontSize: 14,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  categoryItem: {
    width: '48%',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
  },
  categoryIcon: {
    marginBottom: 8,
  },
  categoryName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 5,
  },
  categoryAmount: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.8,
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 20,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#2a2a2a',
    paddingVertical: 15,
    paddingHorizontal: 20,
    justifyContent: 'space-around',
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
  },
  navLabel: {
    color: '#666',
    fontSize: 10,
    marginTop: 5,
  },
});

export default App;

