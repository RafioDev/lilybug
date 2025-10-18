import React from 'react'
import { cn } from '../utils/cn'

interface ButtonProps {
  children?: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'outline' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  className?: string
  fullRounded?: boolean // New prop for fully circular buttons

  // Icon props
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  iconOnly?: boolean
  iconSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'

  // Loading props
  loading?: boolean
  loadingText?: string

  // Accessibility props
  'aria-label'?: string
  'aria-describedby'?: string
}

// Pre-computed static CSS classes for better performance
const BUTTON_BASE_CLASSES =
  'font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 dark:disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 disabled:shadow-none focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 inline-flex items-center justify-center cursor-pointer'

const BUTTON_VARIANT_CLASSES = {
  primary:
    'bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white shadow-sm hover:shadow-md hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 focus:ring-blue-500 dark:focus:ring-blue-400',
  secondary:
    'bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 text-white shadow-sm hover:shadow-md hover:from-emerald-600 hover:to-emerald-700 dark:hover:from-emerald-700 dark:hover:to-emerald-800 focus:ring-emerald-500 dark:focus:ring-emerald-400',
  outline:
    'border-2 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-300 bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-600 dark:hover:border-blue-300 focus:ring-blue-500 dark:focus:ring-blue-400',
  danger:
    'bg-gradient-to-r from-rose-500 to-rose-600 dark:from-rose-600 dark:to-rose-700 text-white shadow-sm hover:shadow-md hover:from-rose-600 hover:to-rose-700 dark:hover:from-rose-700 dark:hover:to-rose-800 focus:ring-rose-500 dark:focus:ring-rose-400',
} as const

const BUTTON_ROUNDED_CLASSES = {
  default: 'rounded-xl',
  full: 'rounded-full',
} as const

const BUTTON_SIZE_CLASSES = {
  sm: {
    default: 'px-4 py-2 text-sm min-h-[32px]',
    iconOnly: 'p-2 min-h-[32px] min-w-[32px]',
  },
  md: {
    default: 'px-6 py-3 text-base min-h-[40px]',
    iconOnly: 'p-2.5 min-h-[40px] min-w-[40px]',
  },
  lg: {
    default: 'px-8 py-4 text-lg min-h-[48px]',
    iconOnly: 'p-3 min-h-[48px] min-w-[48px]',
  },
} as const

const ICON_SIZE_CLASSES = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
  '2xl': 'w-10 h-10',
  '3xl': 'w-12 h-12',
} as const

// Default icon sizes based on button size
const DEFAULT_ICON_SIZES = {
  sm: 'sm' as const,
  md: 'md' as const,
  lg: 'lg' as const,
} as const

const GAP_CLASSES = {
  sm: 'gap-1.5',
  md: 'gap-2',
  lg: 'gap-2.5',
} as const

// Memoized Loading Spinner Component
const LoadingSpinner = React.memo<{
  size: 'sm' | 'md' | 'lg'
  iconSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
}>(({ size, iconSize }) => {
  const spinnerSize = iconSize || DEFAULT_ICON_SIZES[size]

  return (
    <svg
      className={`animate-spin ${ICON_SIZE_CLASSES[spinnerSize]} text-current`}
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

// IconButton Props Interface
interface IconButtonProps
  extends Omit<
    ButtonProps,
    'children' | 'leftIcon' | 'rightIcon' | 'iconOnly'
  > {
  icon: React.ReactNode
  'aria-label': string // Required for accessibility
}

// Memoized IconButton Component
export const IconButton = React.memo<IconButtonProps>(
  ({ icon, 'aria-label': ariaLabel, ...props }) => {
    return (
      <Button
        {...props}
        leftIcon={icon}
        iconOnly={true}
        aria-label={ariaLabel}
      />
    )
  }
)

// Export ButtonGroup components
export {
  ButtonGroup,
  ActionButtonGroup,
  FormButtonGroup,
  ToolbarButtonGroup,
} from './ButtonGroup'

// Memoized Button Component with performance optimizations
export const Button = React.memo<ButtonProps>(
  ({
    children,
    onClick,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    disabled = false,
    type = 'button',
    className = '',
    fullRounded = false,
    leftIcon,
    rightIcon,
    iconOnly = false,
    iconSize,
    loading = false,
    loadingText,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
  }) => {
    // Accessibility warning for icon-only buttons (only in development)
    React.useEffect(() => {
      if (process.env.NODE_ENV === 'development' && iconOnly && !ariaLabel) {
        console.warn(
          'Icon-only buttons require an aria-label for accessibility'
        )
      }
    }, [iconOnly, ariaLabel])

    // Memoized event handler to prevent unnecessary re-renders
    const handleClick = React.useCallback(() => {
      if (!disabled && !loading && onClick) {
        onClick()
      }
    }, [onClick, disabled, loading])

    // Memoized computed values for better performance
    const computedValues = React.useMemo(() => {
      const isDisabled = disabled || loading
      const sizeClass = iconOnly
        ? BUTTON_SIZE_CLASSES[size].iconOnly
        : BUTTON_SIZE_CLASSES[size].default
      // Use cn function to merge classes and resolve conflicts
      const finalClassName = cn(
        BUTTON_BASE_CLASSES,
        BUTTON_VARIANT_CLASSES[variant],
        sizeClass,
        {
          'w-full': fullWidth,
        },
        fullRounded
          ? BUTTON_ROUNDED_CLASSES.full
          : BUTTON_ROUNDED_CLASSES.default,
        className
      )

      return {
        isDisabled,
        finalClassName,
        ariaLabel: iconOnly
          ? ariaLabel
          : loading && loadingText
            ? loadingText
            : loading
              ? 'Loading'
              : undefined,
        ariaDisabled: isDisabled ? true : undefined,
      }
    }, [
      disabled,
      loading,
      iconOnly,
      size,
      fullWidth,
      variant,
      fullRounded,
      className,
      ariaLabel,
      loadingText,
    ])

    // Memoized icon renderer
    const renderIcon = React.useCallback(
      (icon: React.ReactNode) => {
        if (!icon) return null
        const effectiveIconSize = iconSize || DEFAULT_ICON_SIZES[size]

        // Only apply custom sizing when iconSize is explicitly provided
        const shouldOverrideSize = iconSize !== undefined

        return (
          <span
            className={`inline-flex items-center justify-center ${ICON_SIZE_CLASSES[effectiveIconSize]}`}
          >
            {React.isValidElement(icon) && shouldOverrideSize
              ? React.cloneElement(icon, {
                  style: { width: '100%', height: '100%' },
                } as React.HTMLAttributes<HTMLElement>)
              : icon}
          </span>
        )
      },
      [size, iconSize]
    )

    // Memoized content renderer
    const renderContent = React.useMemo(() => {
      if (loading) {
        return (
          <span
            className={`inline-flex items-center justify-center ${
              iconOnly ? '' : GAP_CLASSES[size]
            }`}
          >
            <LoadingSpinner size={size} iconSize={iconSize} />
            {!iconOnly && (loadingText || children)}
          </span>
        )
      }

      if (iconOnly) {
        return (
          <span className='inline-flex h-full w-full items-center justify-center'>
            {renderIcon(leftIcon || rightIcon)}
          </span>
        )
      }

      return (
        <span
          className={`inline-flex items-center justify-center ${GAP_CLASSES[size]}`}
        >
          {leftIcon && renderIcon(leftIcon)}
          <span className='inline-flex items-center justify-center'>
            {children}
          </span>
          {rightIcon && renderIcon(rightIcon)}
        </span>
      )
    }, [
      loading,
      iconOnly,
      size,
      iconSize,
      loadingText,
      children,
      leftIcon,
      rightIcon,
      renderIcon,
    ])

    return (
      <button
        type={type}
        onClick={handleClick}
        disabled={computedValues.isDisabled}
        aria-label={computedValues.ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-disabled={computedValues.ariaDisabled}
        role='button'
        tabIndex={computedValues.isDisabled ? -1 : 0}
        className={computedValues.finalClassName}
      >
        {renderContent}
      </button>
    )
  }
)
