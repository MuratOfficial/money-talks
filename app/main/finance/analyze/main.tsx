import React, { useState } from 'react';

import PageComponent from '@/app/components/PageComponents';

const PassivesScreen: React.FC = () => {

  const analyzeElements = [
    {id:"expences",
      name:"Расходы",
      item:[{ id: '1', name: 'Продукты', amount: 100000 },
    { id: '2', name: 'Образование', amount: 100000},
    { id: '3', name: 'Транспорт', amount: 100000},
      { id: '4', name: 'Отдых и развлечения', amount: 100000},
      { id: '5', name: 'Кафе и рестораны', amount: 100000},
  ]
    },
    {id:"income",
      name:"Доходы",
      item:[{ id: '1', name: 'Продукты', amount: 100000 },
    { id: '2', name: 'Образование', amount: 100000},
    { id: '3', name: 'Транспорт', amount: 100000},
      { id: '4', name: 'Отдых и развлечения', amount: 100000},
      { id: '5', name: 'Кафе и рестораны', amount: 100000},
  ]
    }
  ]


  return (
    <PageComponent title='Анализ' analyzeList={analyzeElements} assetName='1 янв - 1 фев' isAnalyze emptyTitle='У вас пока нет анализа' emptyDesc='Добавьте ваши  расходы, доходы, активы и пассивы, и начните следить за общим анализом'/>
  );
};

export default PassivesScreen;