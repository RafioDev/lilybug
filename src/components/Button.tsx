import React from 'react'

interface ButtonProps {
  children?: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'outline' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  className?: string

  // Icon props
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  iconOnly?: boolean

  // Loading props
  loading?: boolean
  loadingText?: string

  // Accessibility props
  'aria-label'?: string
  'aria-describedby'?: string
}

// Loading Spinner Component
const LoadingSpinner: React.FC<{ size: 'sm' | 'md' | 'lg' }> = ({ size }) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  return (
    <svg
      className={`animate-spin ${sizeMap[size]} text-current`}
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
}

// IconButton Props Interface
interface IconButtonProps
  extends Omit<
    ButtonProps,
    'children' | 'leftIcon' | 'rightIcon' | 'iconOnly'
  > {
  icon: React.ReactNode
  'aria-label': string // Required for accessibility
}

// IconButton Component
export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  'aria-label': ariaLabel,
  ...props
}) => {
  return (
    <Button {...props} leftIcon={icon} iconOnly={true} aria-label={ariaLabel} />
  )
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  type = 'button',
  className = '',
  leftIcon,
  rightIcon,
  iconOnly = false,
  loading = false,
  loadingText,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
}) => {
  // Accessibility warning for icon-only buttons
  React.useEffect(() => {
    if (iconOnly && !ariaLabel) {
      console.warn('Icon-only buttons require an aria-label for accessibility')
    }
  }, [iconOnly, ariaLabel])

  // Screen reader announcements for state changes
  const getAriaLabel = () => {
    if (iconOnly) return ariaLabel
    if (loading && loadingText) return loadingText
    if (loading) return 'Loading'
    return undefined
  }

  const getAriaPressed = () => {
    // Only return aria-pressed for toggle buttons, not regular buttons
    return undefined
  }

  const getAriaDisabled = () => {
    return isDisabled ? 'true' : undefined
  }

  const baseStyles =
    'font-medium rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 dark:disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 disabled:shadow-none focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 inline-flex items-center cursor-pointer'

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white shadow-sm hover:shadow-md hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 focus:ring-blue-500 dark:focus:ring-blue-400',
    secondary:
      'bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 text-white shadow-sm hover:shadow-md hover:from-emerald-600 hover:to-emerald-700 dark:hover:from-emerald-700 dark:hover:to-emerald-800 focus:ring-emerald-500 dark:focus:ring-emerald-400',
    outline:
      'border-2 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-300 bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-600 dark:hover:border-blue-300 focus:ring-blue-500 dark:focus:ring-blue-400',
    danger:
      'bg-gradient-to-r from-rose-500 to-rose-600 dark:from-rose-600 dark:to-rose-700 text-white shadow-sm hover:shadow-md hover:from-rose-600 hover:to-rose-700 dark:hover:from-rose-700 dark:hover:to-rose-800 focus:ring-rose-500 dark:focus:ring-rose-400',
  }

  const sizeStyles = {
    sm: iconOnly ? 'p-2 min-h-[32px] min-w-[32px]' : 'px-4 py-2 text-sm',
    md: iconOnly ? 'p-2.5 min-h-[40px] min-w-[40px]' : 'px-6 py-3 text-base',
    lg: iconOnly ? 'p-3 min-h-[48px] min-w-[48px]' : 'px-8 py-4 text-lg',
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  const gapStyles = {
    sm: 'gap-1.5',
    md: 'gap-2',
    lg: 'gap-2.5',
  }

  const widthStyle = fullWidth ? 'w-full' : ''
  const isDisabled = disabled || loading

  // Render icon with proper sizing
  const renderIcon = (icon: React.ReactNode) => {
    if (!icon) return null

    return <span className={`inline-flex ${iconSizes[size]}`}>{icon}</span>
  }

  // Render button content based on configuration
  const renderContent = () => {
    if (loading) {
      return (
        <span
          className={`inline-flex items-center ${
            iconOnly ? 'justify-center' : gapStyles[size]
          }`}
        >
          <LoadingSpinner size={size} />
          {!iconOnly && (loadingText || children)}
        </span>
      )
    }

    if (iconOnly) {
      return (
        <span className='inline-flex items-center justify-center'>
          {renderIcon(leftIcon || rightIcon)}
        </span>
      )
    }

    return (
      <span className={`inline-flex items-center ${gapStyles[size]}`}>
        {leftIcon && renderIcon(leftIcon)}
        {children}
        {rightIcon && renderIcon(rightIcon)}
      </span>
    )
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      aria-label={getAriaLabel()}
      aria-describedby={ariaDescribedBy}
      aria-disabled={getAriaDisabled()}
      aria-pressed={getAriaPressed()}
      role='button'
      tabIndex={isDisabled ? -1 : 0}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
    >
      {renderContent()}
    </button>
  )
}
