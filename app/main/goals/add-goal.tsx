import React, { useState } from 'react';

import AddGoalForm from '@/app/components/AddGoalForm';
import { useRouter } from 'expo-router';
import useFinancialStore from '@/hooks/useStore';
import { goBack } from '@/utils/navigation';

const AddGoalScreen = () => {

  const router = useRouter();

  const {currentGoalChangeId} = useFinancialStore();

  return (
    <AddGoalForm onClose={()=>goBack("/main/goals/main")} editGoalId={currentGoalChangeId}/>
  );
};

export default AddGoalScreen;