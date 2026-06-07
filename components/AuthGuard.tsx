// components/AuthGuard.tsx
import React from 'react';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter, useSegments, useRootNavigationState, Href } from 'expo-router';
import { supabase } from '../lib/supabase';
import useFinancialStore from '@/hooks/useStore';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState<{ to: Href; replace: boolean } | null>(null);
  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();
  const {setUser, user} = useFinancialStore();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Не зависаем на старте, если getSession не отвечает (плохая сеть/сбой)
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise<{ data: { session: null } }>((resolve) =>
          setTimeout(() => resolve({ data: { session: null } }), 8000)
        );
        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]);

        if (!session && segments[0] === 'new-password') {
          setShouldRedirect({ to: "/(auth)/new-password", replace: false });
        } else if (!session && segments[0] !== '(auth)') {
          setShouldRedirect({ to: '/(auth)/login', replace: true });
        } else if (session?.user && segments[0] === 'login') {
          setUser({
            id: session.user.id,
              email: session.user.email!,
              name: session.user.user_metadata?.full_name || session.user.email!,
          })
          setShouldRedirect({ to: '/main', replace: true });
        }


        if(session?.user && !user){
          setUser({
            id: session.user.id,
              email: session.user.email!,
              name: session.user.user_metadata?.full_name || session.user.email!,
          })
        }
      } catch (error) {
        console.error('Auth guard error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!session && segments[0] !== '(auth)') {
          setShouldRedirect({ to: '/(auth)/login', replace: true });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [segments]);

  useEffect(() => {
    if (shouldRedirect && navigationState?.key) {
      if (shouldRedirect.replace) {
        router.replace(shouldRedirect.to);
      } else {
        router.push(shouldRedirect.to);
      }
      setShouldRedirect(null);
    }
  }, [shouldRedirect, navigationState?.key]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return <>{children}</>;
}