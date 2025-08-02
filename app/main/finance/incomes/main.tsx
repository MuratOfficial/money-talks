import React, { useState } from 'react';

import PageComponent from '@/app/components/PageComponents';

const IncomesScreen: React.FC = () => {

      const categories = [
    { id: 'active', label: 'Активные' },
    { id: 'passive', label: 'Пассивные' },
  ];

  return (
    <PageComponent title='Доходы' tab1='Регулярные' tab2='Нерегулярные' categories={categories} emptyTitle='У вас пока нет доходов' emptyDesc='Добавьте ваши доходов, начните отслеживать свои денежные потоки'/>
  );
};

export default IncomesScreen;