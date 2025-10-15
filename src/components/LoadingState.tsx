import React, { memo } from 'react'

/**
 * Props for the LoadingState component
 */
interface LoadingStateProps {
  /** Custom loading message to display */
  message?: string
  /** Size of the loading spinner and text */
  size?: 'sm' | 'md' | 'lg'
  /** Additional CSS classes to apply */
  className?: string
}

/**
 * A reusable loading state component with spinner and message
 *
 * Provides a consistent loading indicator across the application with:
 * - Animated spinner with theme support (light/dark)
 * - Customizable loading message
 * - Multiple size options
 * - Accessibility features (role, aria-live)
 * - Additional styling support via className
 *
 * The component is memoized to prevent unnecessary re-renders.
 *
 * @param props - The component props
 * @returns A loading indicator with spinner and message
 *
 * @example
 * ```tsx
 * <LoadingState message="Loading babies..." size="lg" />
 * <LoadingState /> // Uses default "Loading..." message
 * ```
 */
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
