import React, { useState } from 'react';

import PageComponent from '@/app/components/PageComponents';

const ActivesScreen: React.FC = () => {


  return (
    <PageComponent
    assets={[{ id: '1', name: 'Продукты', amount: 100000, yield:15 },
    { id: '2', name: 'Образование', amount: 100000},
    { id: '3', name: 'Транспорт', amount: 100000},
      { id: '4', name: 'Отдых и развлечения', amount: 100000},
      { id: '5', name: 'Кафе и рестораны', amount: 100000},
  ]}

    title='Активы' assetName='Мои активы' tab1='Ликвидные' tab2='Неликвидные' addLink={'/main/finance/actives/add-actives'} emptyTitle='У вас пока нет активов' emptyDesc='Добавьте ваши активы, начните отслеживать свои денежные потоки'/>
  );
};

export default ActivesScreen;