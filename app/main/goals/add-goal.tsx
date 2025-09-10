import React, { useState } from 'react';

import AddGoalForm from '@/app/components/AddGoalForm';
import { useRouter } from 'expo-router';

const AddGoalScreen = () => {

  const router = useRouter();

  return (
    <AddGoalForm onClose={()=>router.push("/main/goals/main")}/>
  );
};

export default AddGoalScreen;