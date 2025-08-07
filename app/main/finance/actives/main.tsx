import React, { useState } from 'react';

import PageComponent from '@/app/components/PageComponents';
import useFinancialStore from '@/hooks/useStore';

const ActivesScreen: React.FC = () => {

  const {actives} = useFinancialStore();

  return (
    <PageComponent
    assets={actives}

    title='Активы' assetName='Мои активы' tab1='Ликвидные' tab2='Неликвидные' addLink={'/main/finance/actives/add-actives'} emptyTitle='У вас пока нет активов' emptyDesc='Добавьте ваши активы, начните отслеживать свои денежные потоки'/>
  );
};

export default ActivesScreen;