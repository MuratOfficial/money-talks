import React, { useState } from 'react';

import AddGoalForm from '@/app/components/AddGoalForm';
import { useRouter } from 'expo-router';
import useFinancialStore from '@/hooks/useStore';

const AddGoalScreen = () => {

  const router = useRouter();

  const {currentGoalChangeId} = useFinancialStore();

  return (
    <AddGoalForm onClose={()=>router.push("/main/goals/main")} editGoalId={currentGoalChangeId}/>
  );
};

export default AddGoalScreen;