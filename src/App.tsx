import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { Suspense } from 'react'

import { router } from './router'
import { ThemeProvider } from './contexts/ThemeContext'
import { TourProvider } from './contexts/TourContext'
import { TimeFormatProvider } from './contexts/TimeFormatContext'
import { queryClient } from './lib/queryClient'
import { AppErrorBoundary } from './components/AppErrorBoundary'
import { AppLoadingScreen } from './components/AppLoadingScreen'

function App() {
  return (
    <AppErrorBoundary level='app' name='Application Root'>
      <QueryClientProvider client={queryClient}>
        <AppErrorBoundary level='app' name='Query Provider'>
          <ThemeProvider>
            <TimeFormatProvider>
              <TourProvider>
                <AppErrorBoundary level='app' name='Router'>
                  <Suspense
                    fallback={
                      <AppLoadingScreen message='Starting Lilybug...' />
                    }
                  >
                    <RouterProvider router={router} />
                  </Suspense>
                </AppErrorBoundary>
              </TourProvider>
            </TimeFormatProvider>
          </ThemeProvider>
        </AppErrorBoundary>
      </QueryClientProvider>
    </AppErrorBoundary>
  )
}

export default App
