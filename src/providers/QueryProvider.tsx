"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // A short freshness window prevents route changes and resume events from
            // immediately refetching data that was just loaded.
            staleTime: 1000 * 20,
            gcTime: 1000 * 60 * 5, // 5 minutes cache
            // AdminDataProvider owns the single debounced resume refresh.
            refetchOnWindowFocus: false,
            // AdminDataProvider also handles reconnects as part of its debounced resume event.
            refetchOnReconnect: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
