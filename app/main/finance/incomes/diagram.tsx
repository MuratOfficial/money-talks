import React, { useState } from 'react';

import ChartScreen from '@/app/components/Diagram';
import useFinancialStore from '@/hooks/useStore';

const DiagramIncomeScreen: React.FC = () => {

  const {incomes} = useFinancialStore();



  return (
      <ChartScreen assets={incomes} backLink={'/main/finance/incomes/main'}/>
  );
};

export default DiagramIncomeScreen;