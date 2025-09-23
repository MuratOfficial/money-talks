import React from 'react';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { supabase } from '../lib/supabase';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if(!session && segments[0] !== 'new-password')
        
        if (!session && segments[0] !== '(auth)') {
          router.replace('/(auth)/login');
        }

        // Надо придумать решение при reset-password
        
        if (session && segments[0] === '(auth)') {
          router.replace('/main');
        }
      } catch (error) {
        console.error('Auth guard error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Слушатель изменений аутентификации
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!session && segments[0] !== '(auth)') {
          router.replace('/(auth)/login');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return <>{children}</>;
}