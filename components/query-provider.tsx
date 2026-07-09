'use client';
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // useState (nie moduł-level singleton) — przeżywa re-rendery, ale każdy request
  // serwera / każda sesja przeglądarki dostaje własny QueryClient.
  const [queryClient] = useState(() => new QueryClient());
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
