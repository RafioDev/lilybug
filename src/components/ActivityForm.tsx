import React, { memo } from 'react'
import { Input } from './Input'
import type { EntryType, FeedingType, DiaperType } from '../types'

export interface ActivityFormData {
  entryType: EntryType
  startTime: string
  endTime: string
  quantity: string
  feedingType: FeedingType
  diaperType: DiaperType
  notes: string
  [key: string]: unknown
}

interface ActivityFormProps {
  values: ActivityFormData
  errors: Record<string, string>
  onChange: (field: keyof ActivityFormData, value: unknown) => void
  disabled?: boolean
}

export const ActivityForm: React.FC<ActivityFormProps> = memo(
  ({ values, errors, onChange, disabled = false }) => {
    const getFeedingTypeLabel = (type: FeedingType) => {
      switch (type) {
        case 'both':
          return 'Both Breasts'
        case 'breast_left':
          return 'Breast Left'
        case 'breast_right':
          return 'Breast Right'
        case 'bottle':
          return 'Bottle'
      }
    }

    const getActivityIcon = (type: EntryType) => {
      switch (type) {
        case 'feeding':
          return '🍼'
        case 'sleep':
          return '😴'
        case 'diaper':
          return '👶'
        case 'pumping':
          return '🥛'
      }
    }

    return (
      <div className='space-y-4'>
        {/* Activity Type Display */}
        <div className='flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700'>
          <span className='text-2xl'>{getActivityIcon(values.entryType)}</span>
          <div>
            <p className='font-medium text-gray-900 capitalize dark:text-gray-100'>
              {values.entryType} Activity
            </p>
          </div>
        </div>

        {/* Entry Type Selection */}
        <div>
          <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
            Activity Type
          </label>
          <div className='grid grid-cols-2 gap-2'>
            {(['feeding', 'sleep', 'diaper', 'pumping'] as EntryType[]).map(
              (type) => (
                <button
                  key={type}
                  type='button'
                  onClick={() => onChange('entryType', type)}
                  className={`rounded-xl border-2 p-3 capitalize transition-all ${
                    values.entryType === type
                      ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-300'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:border-gray-500 dark:hover:bg-gray-700'
                  }`}
                  disabled={disabled}
                >
                  {getActivityIcon(type)} {type}
                </button>
              )
            )}
          </div>
          {errors.entryType && (
            <p className='mt-1 text-sm text-red-600 dark:text-red-400'>
              {errors.entryType}
            </p>
          )}
        </div>

        {/* Start Time */}
        <Input
          label='Start Time'
          type='datetime-local'
          value={values.startTime}
          onChange={(val) => onChange('startTime', val)}
          disabled={disabled}
          required
          error={errors.startTime}
        />

        {/* End Time (for sleep and feeding) */}
        {(values.entryType === 'sleep' || values.entryType === 'feeding') && (
          <Input
            label='End Time (optional)'
            type='datetime-local'
            value={values.endTime}
            onChange={(val) => onChange('endTime', val)}
            disabled={disabled}
            error={errors.endTime}
          />
        )}

        {/* Feeding-specific fields */}
        {values.entryType === 'feeding' && (
          <>
            <div>
              <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
                Feeding Type
              </label>
              <div className='grid grid-cols-2 gap-2'>
                {(
                  [
                    'both',
                    'breast_left',
                    'breast_right',
                    'bottle',
                  ] as FeedingType[]
                ).map((type) => (
                  <button
                    key={type}
                    type='button'
                    onClick={() => onChange('feedingType', type)}
                    className={`rounded-xl border-2 p-3 text-sm transition-all ${
                      values.feedingType === type
                        ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:border-gray-500 dark:hover:bg-gray-700'
                    }`}
                    disabled={disabled}
                  >
                    {getFeedingTypeLabel(type)}
                  </button>
                ))}
              </div>
              {errors.feedingType && (
                <p className='mt-1 text-sm text-red-600 dark:text-red-400'>
                  {errors.feedingType}
                </p>
              )}
            </div>

            {values.feedingType === 'bottle' && (
              <Input
                label='Amount (oz)'
                type='number'
                step='0.5'
                value={values.quantity}
                onChange={(val) => onChange('quantity', val)}
                placeholder='e.g., 4'
                disabled={disabled}
                error={errors.quantity}
              />
            )}
          </>
        )}

        {/* Pumping-specific fields */}
        {values.entryType === 'pumping' && (
          <Input
            label='Amount (oz)'
            type='number'
            step='0.5'
            value={values.quantity}
            onChange={(val) => onChange('quantity', val)}
            placeholder='e.g., 4'
            disabled={disabled}
            error={errors.quantity}
          />
        )}

        {/* Diaper-specific fields */}
        {values.entryType === 'diaper' && (
          <div>
            <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
              Diaper Type
            </label>
            <div className='grid grid-cols-3 gap-2'>
              {(['wet', 'dirty', 'both'] as DiaperType[]).map((type) => (
                <button
                  key={type}
                  type='button'
                  onClick={() => onChange('diaperType', type)}
                  className={`rounded-xl border-2 p-3 capitalize transition-all ${
                    values.diaperType === type
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-400 dark:bg-emerald-900/30 dark:text-emerald-300'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:border-gray-500 dark:hover:bg-gray-700'
                  }`}
                  disabled={disabled}
                >
                  {type}
                </button>
              ))}
            </div>
            {errors.diaperType && (
              <p className='mt-1 text-sm text-red-600 dark:text-red-400'>
                {errors.diaperType}
              </p>
            )}
          </div>
        )}

        {/* Notes */}
        <Input
          label='Notes (optional)'
          type='textarea'
          value={values.notes}
          onChange={(val) => onChange('notes', val)}
          placeholder='Any additional details...'
          rows={3}
          disabled={disabled}
          error={errors.notes}
        />
      </div>
    )
  }
)
