import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'

import { router } from './router'
import { ThemeProvider } from './contexts/ThemeContext'
import { TourProvider } from './contexts/TourContext'
import { queryClient } from './lib/queryClient'
import { AppErrorBoundary } from './components/AppErrorBoundary'

function App() {
  return (
    <AppErrorBoundary level='app' name='Application Root'>
      <QueryClientProvider client={queryClient}>
        <AppErrorBoundary level='app' name='Query Provider'>
          <ThemeProvider>
            <TourProvider>
              <AppErrorBoundary level='app' name='Router'>
                <RouterProvider router={router} />
              </AppErrorBoundary>
            </TourProvider>
          </ThemeProvider>
        </AppErrorBoundary>
      </QueryClientProvider>
    </AppErrorBoundary>
  )
}

export default App
