import React, { useState } from 'react';

import ChartScreen from '@/app/components/Diagram';

const DiagramIncomeScreen: React.FC = () => {



  return (
      <ChartScreen backLink={'/main/finance/incomes/main'}/>
  );
};

export default DiagramIncomeScreen;