import React from 'react'
import { cn } from '../utils/cn'

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
    const baseClasses = cn(
      'w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-colors',
      'text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400',
      {
        'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-700': disabled,
      }
    )

    // Error state classes with conditional application
    const errorClasses = cn({
      'border-red-500 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900/30':
        error,
    })

    switch (variant) {
      case 'filled':
        return cn(
          baseClasses,
          error
            ? errorClasses
            : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/30'
        )

      case 'outlined':
        return cn(
          baseClasses,
          error
            ? errorClasses
            : 'bg-transparent border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/30'
        )

      default: // 'default'
        return cn(
          baseClasses,
          error
            ? errorClasses
            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/30'
        )
    }
  }

  const inputStyles = getVariantStyles()

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label className='px-1 text-sm font-medium text-gray-700 dark:text-gray-300'>
          {label}
          {required && (
            <span className='ml-1 text-rose-500 dark:text-rose-400'>*</span>
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
        <p className='px-1 text-sm text-red-600 dark:text-red-400'>{error}</p>
      )}
    </div>
  )
}
