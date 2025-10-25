import React from 'react'
import { LilybugLogo } from './LilybugLogo'
import { cn } from '../utils/cn'

interface AppLoadingScreenProps {
  /** Custom loading message to display */
  message?: string
  /** Whether to show a progress bar */
  showProgress?: boolean
  /** Progress value (0-100) */
  progress?: number
  /** Additional CSS classes */
  className?: string
}

/**
 * Enhanced loading screen component with Lilybug logo branding
 *
 * Features:
 * - Displays Lilybug logo with theme-aware switching
 * - Smooth animations and transitions
 * - Optional progress bar
 * - Customizable loading message
 * - Responsive design
 * - Accessibility support
 */
export const AppLoadingScreen: React.FC<AppLoadingScreenProps> = ({
  message = 'Loading...',
  showProgress = false,
  progress = 0,
  className = '',
}) => {
  return (
    <div
      className={cn(
        'flex min-h-screen items-center justify-center',
        'bg-gradient-to-b from-blue-50 via-white to-blue-50',
        'dark:from-gray-900 dark:via-gray-800 dark:to-gray-900',
        'transition-colors duration-300',
        className
      )}
      role='status'
      aria-live='polite'
      aria-label='Application loading'
    >
      <div className='animate-fade-in space-y-6 text-center'>
        {/* Logo Container */}
        <div className='flex justify-center'>
          <div className='relative'>
            {/* Logo with pulse animation */}
            <div className='animate-pulse-slow'>
              <LilybugLogo className='h-20 w-auto sm:h-24 md:h-28' />
            </div>

            {/* Subtle glow effect */}
            <div className='animate-pulse-slow absolute inset-0 -z-10 rounded-full bg-blue-400 opacity-20 blur-xl dark:bg-blue-600' />
          </div>
        </div>

        {/* Loading Content */}
        <div className='space-y-4'>
          {/* Loading Message */}
          <p className='animate-fade-in-delay text-lg font-medium text-gray-700 dark:text-gray-300'>
            {message}
          </p>

          {/* Animated Dots */}
          <div className='flex justify-center space-x-1'>
            <div
              className='h-2 w-2 animate-bounce rounded-full bg-blue-500'
              style={{ animationDelay: '0ms' }}
            />
            <div
              className='h-2 w-2 animate-bounce rounded-full bg-blue-500'
              style={{ animationDelay: '150ms' }}
            />
            <div
              className='h-2 w-2 animate-bounce rounded-full bg-blue-500'
              style={{ animationDelay: '300ms' }}
            />
          </div>

          {/* Progress Bar */}
          {showProgress && (
            <div className='mx-auto w-64 space-y-2'>
              <div className='h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700'>
                <div
                  className='h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 ease-out'
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
              </div>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                {Math.round(progress)}%
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
