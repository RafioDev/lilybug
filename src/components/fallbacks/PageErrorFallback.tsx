import React from 'react'
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react'
import { ErrorFallbackProps } from '../../contexts/ErrorBoundaryContext'
import { formatErrorForUser } from '../../utils/errorBoundaryUtils'
import { Button } from '../Button'
import { Card } from '../Card'

export const PageErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
  config,
  context,
}) => {
  const errorMessage = formatErrorForUser(config.level, config.name)

  const handleGoHome = () => {
    window.location.href = '/'
  }

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back()
    } else {
      handleGoHome()
    }
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className='flex min-h-[60vh] items-center justify-center p-4'>
      <Card className='w-full max-w-lg'>
        <div className='space-y-6 text-center'>
          <div className='flex justify-center'>
            <div className='rounded-full bg-red-100 p-4 dark:bg-red-900/30'>
              <AlertTriangle className='h-8 w-8 text-red-600 dark:text-red-400' />
            </div>
          </div>

          <div>
            <h1 className='mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100'>
              {config.name ? `${config.name} Error` : 'Page Error'}
            </h1>
            <p className='text-gray-600 dark:text-gray-400'>{errorMessage}</p>
            <p className='mt-2 text-sm text-gray-500 dark:text-gray-500'>
              Don't worry, your data is safe. Try one of the options below.
            </p>
          </div>

          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
            {config.retryable && (
              <Button
                onClick={resetError}
                variant='outline'
                leftIcon={<RefreshCw />}
                className='w-full'
              >
                Retry Page
              </Button>
            )}
            <Button
              onClick={handleRefresh}
              variant='outline'
              leftIcon={<RefreshCw />}
              className='w-full'
            >
              Refresh Page
            </Button>
            <Button
              onClick={handleGoBack}
              variant='outline'
              leftIcon={<ArrowLeft />}
              className='w-full'
            >
              Go Back
            </Button>
            <Button
              onClick={handleGoHome}
              leftIcon={<Home />}
              className='w-full'
            >
              Go Home
            </Button>
          </div>

          {config.showErrorDetails && (
            <details className='text-left'>
              <summary className='mb-3 cursor-pointer text-center text-sm font-medium text-gray-700 dark:text-gray-300'>
                Technical Details
              </summary>
              <div className='rounded-lg bg-gray-100 p-4 dark:bg-gray-800'>
                <div className='space-y-2 text-sm'>
                  <div>
                    <span className='font-medium text-gray-900 dark:text-gray-100'>
                      Error:
                    </span>
                    <span className='ml-2 text-gray-700 dark:text-gray-300'>
                      {error.name}: {error.message}
                    </span>
                  </div>
                  <div>
                    <span className='font-medium text-gray-900 dark:text-gray-100'>
                      Page:
                    </span>
                    <span className='ml-2 text-gray-700 dark:text-gray-300'>
                      {config.name || window.location.pathname}
                    </span>
                  </div>
                  <div>
                    <span className='font-medium text-gray-900 dark:text-gray-100'>
                      Time:
                    </span>
                    <span className='ml-2 text-gray-700 dark:text-gray-300'>
                      {context.timestamp.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className='font-medium text-gray-900 dark:text-gray-100'>
                      URL:
                    </span>
                    <span className='ml-2 break-all text-gray-700 dark:text-gray-300'>
                      {context.url}
                    </span>
                  </div>
                  {error.stack && (
                    <div>
                      <span className='font-medium text-gray-900 dark:text-gray-100'>
                        Stack Trace:
                      </span>
                      <pre className='mt-1 max-h-32 overflow-auto font-mono text-xs whitespace-pre-wrap text-gray-600 dark:text-gray-400'>
                        {error.stack}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </details>
          )}
        </div>
      </Card>
    </div>
  )
}
