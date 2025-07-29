import { Link, Stack } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React from 'react';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Страница не найдена' }} />
      <ThemedView className="flex-1 items-center justify-center bg-black p-4">
        <ThemedText 
          type="title" 
          className="text-center mb-8 text-white font-['SFProDisplayRegular']"
        >
          Этой страницы не существует.
        </ThemedText>
        
        <Link 
          href="/main" 
          className="w-full max-w-md bg-[#4CAF50] p-2 rounded-xl flex flex-row items-center justify-center"
        >
          <ThemedText 
            type="link" 
            className="text-white text-center w-full font-['SFProDisplayRegular']"
          >
            Вернуться на главную!
          </ThemedText>
        </Link>
      </ThemedView>
    </>
  );
}