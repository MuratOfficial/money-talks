import React, { useState } from 'react';

import PageComponent from '@/app/components/PageComponents';

const ExpensesScreen: React.FC = () => {


  return (
    <PageComponent addLink={'/main/finance/expences/add-expence'} title='Расходы' tab1='Регулярные' tab2='Нерегулярные' emptyTitle='У вас пока нет расходов' emptyDesc='Добавьте ваши расходы, начните отслеживать свои денежные потоки'/>
  );
};

export default ExpensesScreen;