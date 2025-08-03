import React, { useState } from 'react';

import PageComponent from '@/app/components/PageComponents';

const ExpensesScreen: React.FC = () => {


  const categories = [
    { id: 'required', label: 'Обязательные' },
    { id: 'notRequired', label: 'Необязательные' },
  ];


  return (
    <PageComponent categories={categories} 
    assets={[{ id: '1', name: 'Продукты', amount: 100000 },
    { id: '2', name: 'Образование', amount: 100000},
    { id: '3', name: 'Транспорт', amount: 100000},
      { id: '4', name: 'Отдых и развлечения', amount: 100000},
      { id: '5', name: 'Кафе и рестораны', amount: 100000},
  ]}
    addLink={'/main/finance/expences/add-expence'} assetName='1 янв' title='Расходы' tab1='Регулярные' tab2='Нерегулярные' emptyTitle='У вас пока нет расходов' emptyDesc='Добавьте ваши расходы, начните отслеживать свои денежные потоки'/>
  );
};

export default ExpensesScreen;