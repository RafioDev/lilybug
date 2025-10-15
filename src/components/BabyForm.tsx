import React, { memo } from 'react'
import { Input } from './Input'

/**
 * Form data structure for baby information
 */
export interface BabyFormData {
  /** Baby's name */
  name: string
  /** Baby's birth date in YYYY-MM-DD format */
  birthdate: string
  /** Additional form fields */
  [key: string]: unknown
}

/**
 * Props for the BabyForm component
 */
interface BabyFormProps {
  /** Current form field values */
  values: BabyFormData
  /** Validation errors by field name */
  errors: Record<string, string>
  /** Function called when a field value changes */
  onChange: (field: keyof BabyFormData, value: unknown) => void
  /** Whether form fields should be disabled */
  disabled?: boolean
}

/**
 * A reusable form component for baby information input
 *
 * Provides standardized form fields for baby data including:
 * - Name input with validation
 * - Birth date input with validation
 * - Error display for each field
 * - Disabled state support
 *
 * The component is memoized to prevent unnecessary re-renders when
 * parent components update.
 *
 * @param props - The component props
 * @returns Form fields for baby information
 *
 * @example
 * ```tsx
 * <BabyForm
 *   values={{ name: 'John', birthdate: '2024-01-01' }}
 *   errors={{ name: 'Name is required' }}
 *   onChange={(field, value) => updateField(field, value)}
 *   disabled={isSubmitting}
 * />
 * ```
 */
export const BabyForm: React.FC<BabyFormProps> = memo(
  ({ values, errors, onChange, disabled = false }) => {
    return (
      <>
        <div>
          <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
            Baby's Name
          </label>
          <Input
            type='text'
            value={values.name}
            onChange={(value) => onChange('name', value)}
            placeholder="Enter baby's name"
            required
            disabled={disabled}
          />
          {errors.name && (
            <p className='mt-1 text-sm text-red-600 dark:text-red-400'>
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
            Birth Date
          </label>
          <Input
            type='date'
            value={values.birthdate}
            onChange={(value) => onChange('birthdate', value)}
            required
            disabled={disabled}
          />
          {errors.birthdate && (
            <p className='mt-1 text-sm text-red-600 dark:text-red-400'>
              {errors.birthdate}
            </p>
          )}
        </div>
      </>
    )
  }
)
