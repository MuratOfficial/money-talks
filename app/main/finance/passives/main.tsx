import React, { useState } from 'react';

import PageComponent from '@/app/components/PageComponents';

const PAssivesScreen: React.FC = () => {


  return (
    <PageComponent title='Пассивы' emptyTitle='У вас пока нет пассивов' emptyDesc='Добавьте ваши пассивы, начните отслеживать свои денежные потоки'/>
  );
};

export default PAssivesScreen;