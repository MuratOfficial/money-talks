import React, { useState } from 'react';

import PageComponent from '@/app/components/PageComponents';
import useFinancialStore from '@/hooks/useStore';

const IncomesScreen: React.FC = () => {

      const categories = [
    { id: 'active', label: 'Активные' },
    { id: 'passive', label: 'Пассивные' },
  ];

  const {incomes} = useFinancialStore();

  return (
    <PageComponent assets={incomes} diagramLink={'/main/finance/incomes/diagram'} assetName='1 янв - 1 фев' addLink={'/main/finance/incomes/add-income'} title='Доходы' tab1='Регулярные' tab2='Нерегулярные' categories={categories} emptyTitle='У вас пока нет доходов' emptyDesc='Добавьте ваши доходов, начните отслеживать свои денежные потоки'/>
  );
};

export default IncomesScreen;