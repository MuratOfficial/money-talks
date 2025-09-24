// components/AuthGuard.tsx
import React from 'react';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter, useSegments, useRootNavigationState, Href } from 'expo-router';
import { supabase } from '../lib/supabase';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState<{ to: Href; replace: boolean } | null>(null);
  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session && segments[0] === 'new-password') {
          setShouldRedirect({ to: "/(auth)/new-password", replace: false });
        } else if (!session && segments[0] !== '(auth)') {
          setShouldRedirect({ to: '/(auth)/login', replace: true });
        } else if (session?.user && segments[0] === 'login') {
          setShouldRedirect({ to: '/main', replace: true });
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