import AddForm from '@/app/components/AddForm';
import React, { useState } from 'react';


const AddExpensesScreen: React.FC = () => {


  return (
    <AddForm backLink={'/main/finance/expences/main'} name='Добавить расход' />
  );
};

export default AddExpensesScreen;