import React, { memo } from 'react'
import { LilybugLogo } from './LilybugLogo'
import { cn } from '../utils/cn'

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
  /** Whether to show the Lilybug logo */
  showLogo?: boolean
  /** Size of the logo when displayed */
  logoSize?: 'sm' | 'md' | 'lg'
}

/**
 * A reusable loading state component with spinner and message
 *
 * Provides a consistent loading indicator across the application with:
 * - Animated spinner with theme support (light/dark)
 * - Optional Lilybug logo display
 * - Customizable loading message
 * - Multiple size options for both spinner and logo
 * - Accessibility features (role, aria-live)
 * - Additional styling support via className
 * - Backward compatibility with existing usage
 *
 * The component is memoized to prevent unnecessary re-renders.
 *
 * @param props - The component props
 * @returns A loading indicator with spinner and message, optionally with logo
 *
 * @example
 * ```tsx
 * <LoadingState message="Loading babies..." size="lg" />
 * <LoadingState showLogo logoSize="lg" message="Loading app..." />
 * <LoadingState /> // Uses default "Loading..." message
 * ```
 */
export const LoadingState: React.FC<LoadingStateProps> = memo(
  ({
    message = 'Loading...',
    size = 'md',
    className = '',
    showLogo = false,
    logoSize = 'md',
  }) => {
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

    const logoSizeClasses = {
      sm: 'h-8 w-auto',
      md: 'h-12 w-auto',
      lg: 'h-16 w-auto',
    }

    if (showLogo) {
      return (
        <div
          className={cn(
            'flex flex-col items-center justify-center space-y-4',
            className
          )}
          role='status'
          aria-live='polite'
        >
          {/* Logo */}
          <div className='animate-pulse-slow'>
            <LilybugLogo className={logoSizeClasses[logoSize]} />
          </div>

          {/* Loading content */}
          <div className='flex items-center space-x-2'>
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
        </div>
      )
    }

    // Original layout for backward compatibility
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
