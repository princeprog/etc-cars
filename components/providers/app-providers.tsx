"use client"

import * as React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { ThemeProvider } from "@/components/theme-provider"
import { NotificationRealtimeProvider } from "@/components/providers/notification-realtime-provider"
import { Toaster } from "@/components/ui/sileo"

export function AppProviders({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
          },
        },
      }),
  )

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <NotificationRealtimeProvider />
        {children}
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  )
}
