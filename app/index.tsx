
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';



export default function Index() {

    const [session, setSession] = useState<Session | null>(null);

    useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  if(session && session.user){
    return <Redirect href="/main" />;
  }else{
    return <Redirect href="/(auth)/login" />;
  }

  
}