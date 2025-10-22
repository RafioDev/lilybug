import React, { useEffect } from 'react'
import { ModalForm } from './ModalForm'
import { Input } from './Input'
import { Button } from './Button'
import { useForm } from '../hooks/useForm'
import { useCreateEntry } from '../hooks/queries/useTrackerQueries'
import { useSmartDefaults } from '../hooks/useSmartDefaults'
import { ComponentErrorBoundary } from './ComponentErrorBoundary'
import { reportError } from '../utils/errorHandler'
import type {
  EntryType,
  FeedingType,
  DiaperType,
  NewTrackerEntry,
} from '../types'

interface QuickEntryFormData {
  startTime: string
  endTime: string
  quantity: string
  feedingType: FeedingType
  diaperType: DiaperType
  notes: string
  [key: string]: unknown
}

interface QuickEntryModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  onError: (error: string) => void
  entryType: EntryType
  babyId: string
}

export const QuickEntryModal: React.FC<QuickEntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onError,
  entryType,
  babyId,
}) => {
  const createEntry = useCreateEntry()
  const { smartDefaults, hasDefaults } = useSmartDefaults({
    entryType,
    babyId,
    enabled: isOpen,
  })

  // Form validation
  const validateQuickEntry = (values: QuickEntryFormData) => {
    const errors: Record<string, string> = {}

    if (!values.startTime) {
      errors.startTime = 'Start time is required'
    }

    if (values.endTime && values.startTime) {
      const startDate = new Date(values.startTime)
      const endDate = new Date(values.endTime)
      if (endDate <= startDate) {
        errors.endTime = 'End time must be after start time'
      }
    }

    if (
      (entryType === 'feeding' && values.feedingType === 'bottle') ||
      entryType === 'pumping'
    ) {
      if (values.quantity && parseFloat(values.quantity) <= 0) {
        errors.quantity = 'Quantity must be greater than 0'
      }
    }

    return errors
  }

  // Form submission handler
  const handleSubmit = async (values: QuickEntryFormData) => {
    const newEntry: NewTrackerEntry = {
      baby_id: babyId,
      entry_type: entryType,
      start_time: values.startTime,
      end_time: values.endTime || null,
      quantity: values.quantity ? parseFloat(values.quantity) : null,
      notes: values.notes || null,
    }

    // Add type-specific fields
    if (entryType === 'feeding') {
      newEntry.feeding_type = values.feedingType
    }
    if (entryType === 'diaper') {
      newEntry.diaper_type = values.diaperType
    }

    try {
      await createEntry.mutateAsync(newEntry)
      onSave()
      onClose()
    } catch (error) {
      console.error('Error creating quick entry:', error)
      reportError(error instanceof Error ? error : new Error(String(error)), {
        context: 'createQuickEntry',
        entryType,
        babyId,
      })
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create entry'
      onError(errorMessage)
    }
  }

  // Initialize form with smart defaults
  const form = useForm<QuickEntryFormData>({
    initialValues: {
      startTime:
        smartDefaults.startTime || new Date().toISOString().slice(0, 16),
      endTime: smartDefaults.endTime || '',
      quantity: smartDefaults.quantity?.toString() || '',
      feedingType: smartDefaults.feedingType || 'bottle',
      diaperType: smartDefaults.diaperType || 'wet',
      notes: smartDefaults.notes || '',
    },
    validate: validateQuickEntry,
    onSubmit: handleSubmit,
  })

  // Update form values when smart defaults change
  useEffect(() => {
    if (Object.keys(smartDefaults).length > 0) {
      form.setValues({
        startTime:
          smartDefaults.startTime || new Date().toISOString().slice(0, 16),
        endTime: smartDefaults.endTime || '',
        quantity: smartDefaults.quantity?.toString() || '',
        feedingType: smartDefaults.feedingType || 'bottle',
        diaperType: smartDefaults.diaperType || 'wet',
        notes: smartDefaults.notes || '',
      })
    }
  }, [smartDefaults]) // eslint-disable-line react-hooks/exhaustive-deps

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      form.reset()
    }
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  const isSubmitting = createEntry.isPending

  const getEntryIcon = (type: EntryType) => {
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

  const getEntryTitle = (type: EntryType) => {
    return `Quick ${type.charAt(0).toUpperCase() + type.slice(1)} Entry`
  }

  return (
    <ComponentErrorBoundary componentName='QuickEntryModal'>
      <ModalForm
        isOpen={isOpen}
        onClose={onClose}
        title={getEntryTitle(entryType)}
        onSubmit={form.handleSubmit}
        isSubmitting={isSubmitting}
        submitText='Save Entry'
        submitDisabled={
          Object.keys(form.errors).length > 0 || !form.values.startTime
        }
        size='md'
      >
        {/* Entry Type Display */}
        <div className='flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700'>
          <span className='text-2xl'>{getEntryIcon(entryType)}</span>
          <div>
            <p className='font-medium text-gray-900 capitalize dark:text-gray-100'>
              {entryType} Entry
            </p>
            {hasDefaults && (
              <p className='text-xs text-blue-600 dark:text-blue-400'>
                ✨ Smart defaults applied
              </p>
            )}
          </div>
        </div>

        {/* Start Time */}
        <Input
          label='Start Time'
          type='datetime-local'
          value={form.values.startTime}
          onChange={(val) => form.handleChange('startTime', val)}
          disabled={isSubmitting}
          required
          error={form.errors.startTime}
        />

        {/* End Time (for sleep and feeding) */}
        {(entryType === 'sleep' || entryType === 'feeding') && (
          <Input
            label='End Time (optional)'
            type='datetime-local'
            value={form.values.endTime}
            onChange={(val) => form.handleChange('endTime', val)}
            disabled={isSubmitting}
            error={form.errors.endTime}
          />
        )}

        {/* Feeding-specific fields */}
        {entryType === 'feeding' && (
          <>
            <div>
              <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
                Feeding Type
              </label>
              <div className='grid grid-cols-2 gap-2'>
                {(
                  ['bottle', 'breast_left', 'breast_right'] as FeedingType[]
                ).map((type) => (
                  <Button
                    key={type}
                    type='button'
                    onClick={() => form.handleChange('feedingType', type)}
                    variant={
                      form.values.feedingType === type ? 'primary' : 'outline'
                    }
                    size='sm'
                    disabled={isSubmitting}
                    className='text-xs'
                  >
                    {type === 'breast_left'
                      ? 'Left Breast'
                      : type === 'breast_right'
                        ? 'Right Breast'
                        : 'Bottle'}
                  </Button>
                ))}
              </div>
              {form.errors.feedingType && (
                <p className='mt-1 text-sm text-red-600 dark:text-red-400'>
                  {form.errors.feedingType}
                </p>
              )}
            </div>

            {form.values.feedingType === 'bottle' && (
              <Input
                label='Amount (oz)'
                type='number'
                step='0.5'
                value={form.values.quantity}
                onChange={(val) => form.handleChange('quantity', val)}
                placeholder='e.g., 4'
                disabled={isSubmitting}
                error={form.errors.quantity}
              />
            )}
          </>
        )}

        {/* Pumping-specific fields */}
        {entryType === 'pumping' && (
          <Input
            label='Amount (oz)'
            type='number'
            step='0.5'
            value={form.values.quantity}
            onChange={(val) => form.handleChange('quantity', val)}
            placeholder='e.g., 4'
            disabled={isSubmitting}
            error={form.errors.quantity}
          />
        )}

        {/* Diaper-specific fields */}
        {entryType === 'diaper' && (
          <div>
            <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
              Diaper Type
            </label>
            <div className='grid grid-cols-3 gap-2'>
              {(['wet', 'dirty', 'both'] as DiaperType[]).map((type) => (
                <Button
                  key={type}
                  type='button'
                  onClick={() => form.handleChange('diaperType', type)}
                  variant={
                    form.values.diaperType === type ? 'primary' : 'outline'
                  }
                  size='sm'
                  disabled={isSubmitting}
                  className='text-xs capitalize'
                >
                  {type}
                </Button>
              ))}
            </div>
            {form.errors.diaperType && (
              <p className='mt-1 text-sm text-red-600 dark:text-red-400'>
                {form.errors.diaperType}
              </p>
            )}
          </div>
        )}

        {/* Notes - Optional and minimal */}
        <Input
          label='Notes (optional)'
          type='textarea'
          value={form.values.notes}
          onChange={(val) => form.handleChange('notes', val)}
          placeholder='Quick note...'
          rows={2}
          disabled={isSubmitting}
          error={form.errors.notes}
        />
      </ModalForm>
    </ComponentErrorBoundary>
  )
}
