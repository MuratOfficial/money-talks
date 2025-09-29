import React, { useState } from 'react';

import ChartScreen from '@/app/components/Diagram';
import useFinancialStore from '@/hooks/useStore';

const DiagramExpenceScreen: React.FC = () => {

  const {expences} = useFinancialStore();


  return (
    <ChartScreen assets={expences} backLink={'/main/finance/expences/main'}/>
  );
};

export default DiagramExpenceScreen;