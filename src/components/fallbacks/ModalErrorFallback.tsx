import React from 'react'
import { AlertTriangle, RefreshCw, X } from 'lucide-react'
import { ErrorFallbackProps } from '../../contexts/ErrorBoundaryContext'
import { formatErrorForUser } from '../../utils/errorBoundaryUtils'
import { Button } from '../Button'

interface ModalErrorFallbackProps extends ErrorFallbackProps {
  onClose?: () => void
}

export const ModalErrorFallback: React.FC<ModalErrorFallbackProps> = ({
  error,
  resetError,
  config,
  context,
  onClose,
}) => {
  const errorMessage = formatErrorForUser(config.level, config.name)

  const handleClose = () => {
    onClose?.()
  }

  return (
    <div className='space-y-4 p-6'>
      <div className='flex items-center gap-3'>
        <div className='rounded-full bg-red-100 p-2 dark:bg-red-900/30'>
          <AlertTriangle className='h-5 w-5 text-red-600 dark:text-red-400' />
        </div>
        <div className='flex-1'>
          <h3 className='font-medium text-red-900 dark:text-red-100'>
            {config.name ? `${config.name} Error` : 'Dialog Error'}
          </h3>
          <p className='text-sm text-red-700 dark:text-red-300'>
            {errorMessage}
          </p>
        </div>
        {onClose && (
          <button
            onClick={handleClose}
            className='rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300'
            title='Close'
          >
            <X className='h-4 w-4' />
          </button>
        )}
      </div>

      <div className='flex gap-2'>
        {config.retryable && (
          <Button
            onClick={resetError}
            variant='outline'
            size='sm'
            leftIcon={<RefreshCw />}
            className='border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-800/30'
          >
            Retry
          </Button>
        )}
        {onClose && (
          <Button
            onClick={handleClose}
            variant='outline'
            size='sm'
            leftIcon={<X />}
            className='text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
          >
            Close Dialog
          </Button>
        )}
      </div>

      {config.showErrorDetails && (
        <details className='rounded border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20'>
          <summary className='cursor-pointer text-sm font-medium text-red-800 dark:text-red-200'>
            Error Details
          </summary>
          <div className='mt-2 space-y-2 text-sm'>
            <div>
              <span className='font-medium text-red-900 dark:text-red-100'>
                Type:
              </span>
              <span className='ml-2 text-red-700 dark:text-red-300'>
                {error.name}
              </span>
            </div>
            <div>
              <span className='font-medium text-red-900 dark:text-red-100'>
                Message:
              </span>
              <span className='ml-2 text-red-700 dark:text-red-300'>
                {error.message}
              </span>
            </div>
            <div>
              <span className='font-medium text-red-900 dark:text-red-100'>
                Modal:
              </span>
              <span className='ml-2 text-red-700 dark:text-red-300'>
                {config.name || 'Unknown'}
              </span>
            </div>
            <div>
              <span className='font-medium text-red-900 dark:text-red-100'>
                Time:
              </span>
              <span className='ml-2 text-red-700 dark:text-red-300'>
                {context.timestamp.toLocaleTimeString()}
              </span>
            </div>
            {error.stack && (
              <div>
                <span className='font-medium text-red-900 dark:text-red-100'>
                  Stack:
                </span>
                <pre className='mt-1 max-h-24 overflow-auto font-mono text-xs whitespace-pre-wrap text-red-600 dark:text-red-400'>
                  {error.stack.split('\n').slice(0, 4).join('\n')}
                </pre>
              </div>
            )}
          </div>
        </details>
      )}
    </div>
  )
}
