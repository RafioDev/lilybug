import React from 'react'
import { Input } from './Input'

export interface BabyFormData {
  name: string
  birthdate: string
}

interface BabyFormProps {
  values: BabyFormData
  errors: Record<string, string>
  onChange: (field: keyof BabyFormData, value: string) => void
  disabled?: boolean
}

export const BabyForm: React.FC<BabyFormProps> = ({
  values,
  errors,
  onChange,
  disabled = false,
}) => {
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
