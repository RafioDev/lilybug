import React from 'react'

interface InputProps {
  label?: string
  type?: 'text' | 'number' | 'date' | 'time' | 'datetime-local' | 'textarea'
  value: string | number
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  min?: string | number
  max?: string | number
  step?: string | number
  rows?: number
  className?: string
  error?: string
  variant?: 'default' | 'filled' | 'outlined'
}

export const Input: React.FC<InputProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  min,
  max,
  step,
  rows = 3,
  className = '',
  error,
  variant = 'default',
}) => {
  const getVariantStyles = () => {
    const baseClasses =
      'w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-colors'

    // Text and placeholder colors for all variants
    const textClasses =
      'text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400'

    // Disabled state classes
    const disabledClasses = disabled
      ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-700'
      : ''

    // Error state classes
    const errorClasses = error
      ? 'border-red-500 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900/30'
      : ''

    switch (variant) {
      case 'filled':
        return `${baseClasses} ${textClasses} ${disabledClasses} ${
          error
            ? errorClasses
            : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/30'
        }`

      case 'outlined':
        return `${baseClasses} ${textClasses} ${disabledClasses} ${
          error
            ? errorClasses
            : 'bg-transparent border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/30'
        }`

      default: // 'default'
        return `${baseClasses} ${textClasses} ${disabledClasses} ${
          error
            ? errorClasses
            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/30'
        }`
    }
  }

  const inputStyles = getVariantStyles()

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className='text-sm font-medium text-gray-700 dark:text-gray-300 px-1'>
          {label}
          {required && (
            <span className='text-rose-500 dark:text-rose-400 ml-1'>*</span>
          )}
        </label>
      )}
      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={rows}
          className={`${inputStyles} resize-none`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          className={inputStyles}
        />
      )}
      {error && (
        <p className='text-red-600 dark:text-red-400 text-sm px-1'>{error}</p>
      )}
    </div>
  )
}
