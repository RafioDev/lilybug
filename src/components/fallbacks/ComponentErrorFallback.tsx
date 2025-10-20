import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { ErrorFallbackProps } from '../../contexts/ErrorBoundaryContext'

export const ComponentErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
  config,
}) => {
  return (
    <div className='inline-flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm dark:border-red-800 dark:bg-red-900/20'>
      <AlertTriangle className='h-4 w-4 text-red-600 dark:text-red-400' />
      <span className='text-red-700 dark:text-red-300'>
        {config.name ? `${config.name} Error` : 'Component Error'}
      </span>
      {config.retryable && (
        <button
          onClick={resetError}
          className='ml-2 inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-800/30'
          title='Retry'
        >
          <RefreshCw className='h-3 w-3' />
          Retry
        </button>
      )}

      {config.showErrorDetails && (
        <details className='mt-2 w-full'>
          <summary className='cursor-pointer text-xs text-red-600 dark:text-red-400'>
            Error Details
          </summary>
          <div className='mt-1 rounded bg-red-100 p-2 font-mono text-xs text-red-800 dark:bg-red-900/40 dark:text-red-200'>
            <div className='font-semibold'>
              {error.name}: {error.message}
            </div>
            {error.stack && (
              <pre className='mt-1 text-xs whitespace-pre-wrap opacity-75'>
                {error.stack.split('\n').slice(0, 3).join('\n')}
              </pre>
            )}
          </div>
        </details>
      )}
    </div>
  )
}
