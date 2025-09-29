import AddForm from '@/app/components/AddForm';
import useFinancialStore from '@/hooks/useStore';
import React, { useState } from 'react';


const AddExpensesScreen: React.FC = () => {


  const {currentAsset} = useFinancialStore();


  return (
    <AddForm backLink={'/main/finance/expences/main'} type='expence' name='Добавить расход' formItem={currentAsset} />
  );
};

export default AddExpensesScreen;