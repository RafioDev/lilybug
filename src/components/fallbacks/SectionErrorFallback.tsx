import React from 'react'
import { AlertTriangle, RefreshCw, SkipForward } from 'lucide-react'
import { ErrorFallbackProps } from '../../contexts/ErrorBoundaryContext'
import { formatErrorForUser } from '../../utils/errorBoundaryUtils'
import { Button } from '../Button'
import { Card } from '../Card'

export const SectionErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
  config,
  context,
}) => {
  const errorMessage = formatErrorForUser(config.level, config.name)

  return (
    <Card className='border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'>
      <div className='space-y-4'>
        <div className='flex items-center gap-3'>
          <div className='rounded-full bg-red-100 p-2 dark:bg-red-900/30'>
            <AlertTriangle className='h-5 w-5 text-red-600 dark:text-red-400' />
          </div>
          <div>
            <h3 className='font-medium text-red-900 dark:text-red-100'>
              {config.name
                ? `${config.name} Unavailable`
                : 'Section Unavailable'}
            </h3>
            <p className='text-sm text-red-700 dark:text-red-300'>
              {errorMessage}
            </p>
          </div>
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
              Retry Section
            </Button>
          )}
          <Button
            onClick={() => {
              // Hide this section by setting display none
              const element = document.querySelector(
                `[data-section="${config.name}"]`
              )
              if (element) {
                ;(element as HTMLElement).style.display = 'none'
              }
            }}
            variant='outline'
            size='sm'
            leftIcon={<SkipForward />}
            className='text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-800/30'
          >
            Skip Section
          </Button>
        </div>

        {config.showErrorDetails && (
          <details className='rounded border border-red-200 bg-red-100/50 p-3 dark:border-red-800 dark:bg-red-900/10'>
            <summary className='cursor-pointer text-sm font-medium text-red-800 dark:text-red-200'>
              Technical Details
            </summary>
            <div className='mt-2 space-y-2'>
              <div className='text-sm'>
                <span className='font-medium text-red-900 dark:text-red-100'>
                  Error:
                </span>
                <span className='ml-2 text-red-700 dark:text-red-300'>
                  {error.name}: {error.message}
                </span>
              </div>
              <div className='text-sm'>
                <span className='font-medium text-red-900 dark:text-red-100'>
                  Section:
                </span>
                <span className='ml-2 text-red-700 dark:text-red-300'>
                  {config.name || 'Unknown'}
                </span>
              </div>
              <div className='text-sm'>
                <span className='font-medium text-red-900 dark:text-red-100'>
                  Time:
                </span>
                <span className='ml-2 text-red-700 dark:text-red-300'>
                  {context.timestamp.toLocaleTimeString()}
                </span>
              </div>
              {error.stack && (
                <div className='text-sm'>
                  <span className='font-medium text-red-900 dark:text-red-100'>
                    Stack:
                  </span>
                  <pre className='mt-1 font-mono text-xs whitespace-pre-wrap text-red-600 dark:text-red-400'>
                    {error.stack.split('\n').slice(0, 5).join('\n')}
                  </pre>
                </div>
              )}
            </div>
          </details>
        )}
      </div>
    </Card>
  )
}
