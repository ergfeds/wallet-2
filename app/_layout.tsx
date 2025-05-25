import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { Platform } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpc, trpcClient } from '@/lib/trpc';
import { useAuthStore } from '@/stores/auth-store';
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { firebaseConfig } from '@/lib/firebaseConfig';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isAuthenticated, isAdmin } = useAuthStore();
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    const app = initializeApp(firebaseConfig);
    getAnalytics(app);
    console.log("Firebase initialized successfully!"); // For verification
  }, []);

  useEffect(() => {
    const hideSplash = async () => {
      await SplashScreen.hideAsync();
    };
    hideSplash();
  }, []);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <Stack
          screenOptions={{
            headerBackTitle: 'Back',
            headerStyle: {
              backgroundColor: isAdmin ? '#111827' : '#FFFFFF',
              ...Platform.select({
                android: {
                  elevation: 4,
                },
                ios: {
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 6,
                },
              }),
            },
            headerTintColor: isAdmin ? '#FFFFFF' : '#111827',
            headerTitleStyle: {
              fontWeight: '600',
              fontSize: 18,
            },
            animation: Platform.OS === 'android' ? 'slide_from_right' : 'default',
          }}
        >
          {!isAuthenticated ? (
            <Stack.Screen name="auth/login" options={{ headerShown: false }} />
          ) : isAdmin ? (
            <>
              <Stack.Screen name="admin" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </>
          ) : (
            <>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="admin" options={{ headerShown: false }} />
            </>
          )}
          <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
      </QueryClientProvider>
    </trpc.Provider>
  );
}