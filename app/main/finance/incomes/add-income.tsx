import AddForm from '@/app/components/AddForm';
import React, { useState } from 'react';


const AddExpenceScreen: React.FC = () => {


  return (
    <AddForm backLink={'/main/finance/incomes/main'} type='income' name='Добавить доход' />
  );
};

export default AddExpenceScreen;