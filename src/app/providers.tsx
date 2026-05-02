"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            gcTime: 10 * 60_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: "rgba(18, 18, 18, 0.92)",
            color: "rgba(237, 237, 237, 1)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 20px 55px rgba(0,0,0,0.55)",
            backdropFilter: "blur(12px)",
          },
        }}
      />
    </QueryClientProvider>
  );
}

