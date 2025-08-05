import React, { useState } from 'react';

import PageComponent from '@/app/components/PageComponents';

const IncomesScreen: React.FC = () => {

      const categories = [
    { id: 'active', label: 'Активные' },
    { id: 'passive', label: 'Пассивные' },
  ];

 const assets=[{ id: '1', name: 'Заработная плата', amount: 100000 },
    { id: '2', name: 'Стипендия', amount: 100000},
  ]

  return (
    <PageComponent assets={assets} diagramLink={'/main/finance/incomes/diagram'} assetName='1 янв - 1 фев' addLink={'/main/finance/incomes/add-income'} title='Доходы' tab1='Регулярные' tab2='Нерегулярные' categories={categories} emptyTitle='У вас пока нет доходов' emptyDesc='Добавьте ваши доходов, начните отслеживать свои денежные потоки'/>
  );
};

export default IncomesScreen;