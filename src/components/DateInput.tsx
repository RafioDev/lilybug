import React from 'react'
import { DatePicker, DateTimePicker } from './ui/date-picker'
import { cn } from '../utils/cn'

interface DateInputProps {
  label?: string
  value: string
  onChange: (value: string) => void
  type?: 'date' | 'datetime-local'
  placeholder?: string
  disabled?: boolean
  required?: boolean
  error?: string
  className?: string
  max?: string
}

export const DateInput: React.FC<DateInputProps> = ({
  label,
  value,
  onChange,
  type = 'date',
  placeholder,
  disabled = false,
  required = false,
  error,
  className,
  max,
}) => {
  // Convert string value to Date object
  const dateValue = value ? new Date(value) : undefined

  // Convert max string to Date object for validation
  const maxDate = max ? new Date(max) : undefined

  const handleDateChange = (date: Date | undefined) => {
    if (!date) {
      onChange('')
      return
    }

    // Check max date constraint
    if (maxDate && date > maxDate) {
      return // Don't allow dates after max
    }

    if (type === 'datetime-local') {
      // For datetime-local, format as ISO string without timezone
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      onChange(`${year}-${month}-${day}T${hours}:${minutes}`)
    } else {
      // For date, format as YYYY-MM-DD
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      onChange(`${year}-${month}-${day}`)
    }
  }

  const getPlaceholder = () => {
    if (placeholder) return placeholder
    if (type === 'datetime-local') return 'Pick a date and time'
    return 'Pick a date'
  }

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
          {label}
          {required && <span className='ml-1 text-red-500'>*</span>}
        </label>
      )}

      <div className='w-full'>
        {type === 'datetime-local' ? (
          <DateTimePicker
            date={dateValue}
            onDateChange={handleDateChange}
            placeholder={getPlaceholder()}
            disabled={disabled}
            className='w-full'
          />
        ) : (
          <DatePicker
            date={dateValue}
            onDateChange={handleDateChange}
            placeholder={getPlaceholder()}
            disabled={disabled}
            className='w-full'
          />
        )}
      </div>

      {error && (
        <p className='text-sm text-red-600 dark:text-red-400'>{error}</p>
      )}
    </div>
  )
}
