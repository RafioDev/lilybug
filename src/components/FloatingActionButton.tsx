import React from 'react'
import { cn } from '../utils/cn'

export interface FABProps {
  children?: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  className?: string

  // Icon props
  icon?: React.ReactNode

  // Loading props
  loading?: boolean

  // Accessibility props
  'aria-label': string // Required for FABs
  'aria-describedby'?: string

  // Animation props
  animate?: boolean

  // Position props (for absolute positioning)
  position?: {
    bottom?: string
    right?: string
    left?: string
    top?: string
  }
}

// Pre-computed static CSS classes for better performance
const FAB_BASE_CLASSES =
  'fixed inline-flex items-center justify-center font-medium transition-all duration-300 ease-out active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 disabled:shadow-none focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 cursor-pointer rounded-full shadow-lg hover:shadow-xl z-50'

const FAB_VARIANT_CLASSES = {
  primary:
    'bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 focus:ring-blue-500 dark:focus:ring-blue-400 hover:scale-105',
  secondary:
    'bg-gradient-to-r from-gray-500 to-gray-600 dark:from-gray-600 dark:to-gray-700 text-white hover:from-gray-600 hover:to-gray-700 dark:hover:from-gray-700 dark:hover:to-gray-800 focus:ring-gray-500 dark:focus:ring-gray-400 hover:scale-105',
  success:
    'bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 text-white hover:from-emerald-600 hover:to-emerald-700 dark:hover:from-emerald-700 dark:hover:to-emerald-800 focus:ring-emerald-500 dark:focus:ring-emerald-400 hover:scale-105',
  warning:
    'bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 text-white hover:from-amber-600 hover:to-amber-700 dark:hover:from-amber-700 dark:hover:to-amber-800 focus:ring-amber-500 dark:focus:ring-amber-400 hover:scale-105',
  danger:
    'bg-gradient-to-r from-rose-500 to-rose-600 dark:from-rose-600 dark:to-rose-700 text-white hover:from-rose-600 hover:to-rose-700 dark:hover:from-rose-700 dark:hover:to-rose-800 focus:ring-rose-500 dark:focus:ring-rose-400 hover:scale-105',
} as const

const FAB_SIZE_CLASSES = {
  sm: 'h-12 w-12 text-sm',
  md: 'h-14 w-14 text-base',
  lg: 'h-16 w-16 text-lg',
} as const

const ICON_SIZE_CLASSES = {
  sm: 'h-5 w-5',
  md: 'h-6 w-6',
  lg: 'h-7 w-7',
} as const

// Loading Spinner Component for FAB
const FABLoadingSpinner = React.memo<{
  size: 'sm' | 'md' | 'lg'
}>(({ size }) => {
  const spinnerSize = ICON_SIZE_CLASSES[size]

  return (
    <svg
      className={`animate-spin ${spinnerSize} text-current`}
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      role='status'
      aria-label='Loading'
    >
      <circle
        className='opacity-25 dark:opacity-30'
        cx='12'
        cy='12'
        r='10'
        stroke='currentColor'
        strokeWidth='4'
      />
      <path
        className='opacity-75 dark:opacity-80'
        fill='currentColor'
        d='m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
      />
    </svg>
  )
})

FABLoadingSpinner.displayName = 'FABLoadingSpinner'

// Main FloatingActionButton Component
export const FloatingActionButton = React.memo<FABProps>(
  ({
    children,
    onClick,
    variant = 'primary',
    size = 'md',
    disabled = false,
    className = '',
    icon,
    loading = false,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    animate = true,
    position = { bottom: '1.5rem', right: '1.5rem' },
  }) => {
    // Memoized event handler to prevent unnecessary re-renders
    const handleClick = React.useCallback(() => {
      if (!disabled && !loading && onClick) {
        onClick()
      }
    }, [onClick, disabled, loading])

    // Memoized computed values for better performance
    const computedValues = React.useMemo(() => {
      const isDisabled = disabled || loading

      // Build position styles
      const positionStyles: React.CSSProperties = {}
      if (position.bottom) positionStyles.bottom = position.bottom
      if (position.right) positionStyles.right = position.right
      if (position.left) positionStyles.left = position.left
      if (position.top) positionStyles.top = position.top

      // Use cn function to merge classes and resolve conflicts
      const finalClassName = cn(
        FAB_BASE_CLASSES,
        FAB_VARIANT_CLASSES[variant],
        FAB_SIZE_CLASSES[size],
        {
          'animate-bounce': animate && !isDisabled && !loading,
        },
        className
      )

      return {
        isDisabled,
        finalClassName,
        positionStyles,
        ariaDisabled: isDisabled ? true : undefined,
      }
    }, [disabled, loading, variant, size, animate, className, position])

    // Memoized icon renderer
    const renderIcon = React.useCallback(() => {
      if (loading) {
        return <FABLoadingSpinner size={size} />
      }

      if (icon) {
        const iconSize = ICON_SIZE_CLASSES[size]
        return (
          <span
            className={`inline-flex items-center justify-center ${iconSize}`}
          >
            {React.isValidElement(icon)
              ? React.cloneElement(icon, {
                  className: cn(
                    iconSize,
                    (icon.props as { className?: string })?.className
                  ),
                } as React.HTMLAttributes<HTMLElement>)
              : icon}
          </span>
        )
      }

      return children
    }, [loading, icon, children, size])

    return (
      <button
        type='button'
        onClick={handleClick}
        disabled={computedValues.isDisabled}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-disabled={computedValues.ariaDisabled}
        role='button'
        tabIndex={computedValues.isDisabled ? -1 : 0}
        className={computedValues.finalClassName}
        style={computedValues.positionStyles}
      >
        {renderIcon()}
      </button>
    )
  }
)

FloatingActionButton.displayName = 'FloatingActionButton'

// Export default
export default FloatingActionButton
