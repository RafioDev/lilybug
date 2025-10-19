import React from 'react'
import { ErrorBoundary } from './ErrorBoundary'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from './Button'
import { Card } from './Card'

interface AppErrorBoundaryProps {
  children: React.ReactNode
  level?: 'app' | 'page' | 'component'
  name?: string
}

/**
 * Application-specific error boundary with different fallback UIs based on level
 */
export const AppErrorBoundary: React.FC<AppErrorBoundaryProps> = ({
  children,
  level = 'component',
  name,
}) => {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Here you could integrate with error reporting services like Sentry
    console.error(
      `Error in ${level}${name ? ` (${name})` : ''}:`,
      error,
      errorInfo
    )

    // You could also send to analytics or error tracking service
    // Example: errorTrackingService.captureException(error, { level, name, errorInfo })
  }

  const getFallbackUI = () => {
    switch (level) {
      case 'app':
        return (
          <div className='flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900'>
            <Card className='w-full max-w-md space-y-4 text-center'>
              <AlertTriangle className='mx-auto h-12 w-12 text-red-500' />
              <h1 className='text-xl font-semibold text-gray-900 dark:text-gray-100'>
                App Error
              </h1>
              <p className='text-gray-600 dark:text-gray-400'>
                The application encountered an error. Please refresh the page.
              </p>
              <Button
                onClick={() => window.location.reload()}
                leftIcon={<RefreshCw />}
                className='w-full'
              >
                Refresh Page
              </Button>
            </Card>
          </div>
        )

      case 'page':
        return (
          <div className='flex min-h-[400px] items-center justify-center p-4'>
            <Card className='w-full max-w-sm space-y-4 text-center'>
              <AlertTriangle className='mx-auto h-8 w-8 text-red-500' />
              <h2 className='text-lg font-medium text-gray-900 dark:text-gray-100'>
                Page Error
              </h2>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                This page encountered an error. Try refreshing or go back.
              </p>
              <div className='flex gap-2'>
                <Button
                  onClick={() => window.history.back()}
                  variant='outline'
                  className='flex-1'
                >
                  Go Back
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  className='flex-1'
                >
                  Refresh
                </Button>
              </div>
            </Card>
          </div>
        )

      case 'component':
      default:
        return (
          <div className='rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20'>
            <div className='flex items-center gap-2 text-red-700 dark:text-red-400'>
              <AlertTriangle className='h-4 w-4' />
              <span className='text-sm font-medium'>
                {name ? `${name} Error` : 'Component Error'}
              </span>
            </div>
            <p className='mt-1 text-xs text-red-600 dark:text-red-400'>
              This component failed to render properly.
            </p>
          </div>
        )
    }
  }

  return (
    <ErrorBoundary fallback={getFallbackUI()} onError={handleError}>
      {children}
    </ErrorBoundary>
  )
}
