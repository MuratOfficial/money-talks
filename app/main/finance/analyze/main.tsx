import React, { useState } from 'react';

import PageComponent from '@/app/components/PageComponents';
import useFinancialStore from '@/hooks/useStore';

const PassivesScreen: React.FC = () => {

  const {incomes, passives, actives, expences} = useFinancialStore();

  const analyzeElements = [
    {id:"expences",
      name:"Расходы",
      item:expences
    },
    {id:"income",
      name:"Доходы",
      item:incomes
    },
    {id:"passives",
      name:"Пассивы",
      item:passives
    },
    {id:"actives",
      name:"Активы",
      item:actives
    },
  ]


  return (
    <PageComponent title='Анализ' analyzeList={analyzeElements} assetName='1 янв - 1 фев' isAnalyze emptyTitle='У вас пока нет анализа' emptyDesc='Добавьте ваши  расходы, доходы, активы и пассивы, и начните следить за общим анализом'/>
  );
};

export default PassivesScreen;