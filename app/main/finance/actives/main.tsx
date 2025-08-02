import React, { useState } from 'react';

import PageComponent from '@/app/components/PageComponents';

const ActivesScreen: React.FC = () => {


  return (
    <PageComponent title='Активы' emptyTitle='У вас пока нет активов' emptyDesc='Добавьте ваши активы, начните отслеживать свои денежные потоки'/>
  );
};

export default ActivesScreen;