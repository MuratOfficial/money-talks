import React, { useState } from 'react';

import PageComponent from '@/app/components/PageComponents';

const PAssivesScreen: React.FC = () => {


  return (
    <PageComponent title='Анализ' emptyTitle='У вас пока нет анализа' emptyDesc='Добавьте ваши  расходы, доходы, активы и пассивы, и начните следить за общим анализом'/>
  );
};

export default PAssivesScreen;