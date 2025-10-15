import React, { memo } from 'react'

interface LoadingStateProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const LoadingState: React.FC<LoadingStateProps> = memo(
  ({ message = 'Loading...', size = 'md', className = '' }) => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8',
    }

    const textSizeClasses = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    }

    return (
      <div
        className={`flex items-center justify-center space-x-2 ${className}`}
        role='status'
        aria-live='polite'
      >
        <div
          className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 dark:border-gray-600 dark:border-t-blue-400`}
          aria-hidden='true'
        />
        <span
          className={`${textSizeClasses[size]} text-gray-600 dark:text-gray-400`}
        >
          {message}
        </span>
      </div>
    )
  }
)
