import React, { useState } from 'react';

import PageComponent from '@/app/components/PageComponents';
import useFinancialStore from '@/hooks/useStore';

const ExpensesScreen: React.FC = () => {


  const categories = [
    { id: 'required', label: 'Обязательные' },
    { id: 'notRequired', label: 'Необязательные' },
  ];

  const {expences} = useFinancialStore();


  return (
    <PageComponent categories={categories} 
    assets={expences}
    addLink={'/main/finance/expences/add-expence'} diagramLink={'/main/finance/expences/diagram'} assetName='1 янв' title='Расходы' tab1='Регулярные' tab2='Нерегулярные' emptyTitle='У вас пока нет расходов' emptyDesc='Добавьте ваши расходы, начните отслеживать свои денежные потоки'/>
  );
};

export default ExpensesScreen;