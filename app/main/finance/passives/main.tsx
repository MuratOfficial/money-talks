import React, { useState } from 'react';

import PageComponent from '@/app/components/PageComponents';
import useFinancialStore from '@/hooks/useStore';

const PassivesScreen: React.FC = () => {
const categories = [
   { id: 'effect', label: 'Эффективность %' },
    { id: 'current', label: 'Текущая стоимость' },
]

const {passives} = useFinancialStore(); 

  return (
    <PageComponent
     assets={passives}
    title='Пассивы' isPassive assetName='Мои пассивы' addLink={'/main/finance/passives/add-passives'} categories={categories} emptyTitle='У вас пока нет пассивов' emptyDesc='Добавьте ваши пассивы, начните отслеживать свои денежные потоки'/>
  );
};

export default PassivesScreen;