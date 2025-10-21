import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'

import { router } from './router'
import { ThemeProvider } from './contexts/ThemeContext'
import { queryClient } from './lib/queryClient'
import { AppErrorBoundary } from './components/AppErrorBoundary'

function App() {
  return (
    <AppErrorBoundary level='app' name='Application Root'>
      <QueryClientProvider client={queryClient}>
        <AppErrorBoundary level='app' name='Query Provider'>
          <ThemeProvider>
            <AppErrorBoundary level='app' name='Router'>
              <RouterProvider router={router} />
            </AppErrorBoundary>
          </ThemeProvider>
        </AppErrorBoundary>
      </QueryClientProvider>
    </AppErrorBoundary>
  )
}

export default App
