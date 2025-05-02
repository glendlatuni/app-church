"use client"
 
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'
 
export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Default settings for all queries
        refetchOnWindowFocus: false, // Don't refetch when window regains focus
        refetchOnMount: false,       // Don't refetch when component mounts if data is already cached
        retry: 1,                    // Only retry failed queries once
      },
    },
  }))
 
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} /> {/* Remove in production if not needed */}
    </QueryClientProvider>
  )
}