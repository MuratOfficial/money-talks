import React, { useState } from 'react';

import PageComponent from '@/app/components/PageComponents';

const PassivesScreen: React.FC = () => {
const categories = [
   { id: 'effect', label: 'Эффективность %' },
    { id: 'current', label: 'Текущая стоимость' },
]

  return (
    <PageComponent
     assets={[{ id: '1', name: 'Продукты', amount: 100000, yield:15 },
    { id: '2', name: 'Образование', amount: 100000},
    { id: '3', name: 'Транспорт', amount: 100000},
      { id: '4', name: 'Отдых и развлечения', amount: 100000},
      { id: '5', name: 'Кафе и рестораны', amount: 100000},
  ]}
    title='Пассивы' assetName='Мои пассивы' addLink={'/main/finance/passives/add-passives'} categories={categories} emptyTitle='У вас пока нет пассивов' emptyDesc='Добавьте ваши пассивы, начните отслеживать свои денежные потоки'/>
  );
};

export default PassivesScreen;