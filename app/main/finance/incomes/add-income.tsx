import AddForm from '@/app/components/AddForm';
import useFinancialStore from '@/hooks/useStore';
import React, { useState } from 'react';


const AddExpenceScreen: React.FC = () => {

  const {currentAsset} = useFinancialStore();


  return (
    <AddForm backLink={'/main/finance/incomes/main'} type='income' name='Добавить доход' formItem={currentAsset} />
  );
};

export default AddExpenceScreen;