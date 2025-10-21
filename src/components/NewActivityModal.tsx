import React, { useEffect } from 'react'
import { ModalForm } from './ModalForm'
import { ActivityForm, type ActivityFormData } from './ActivityForm'
import { useForm } from '../hooks/useForm'
import { useCreateEntry } from '../hooks/queries/useTrackerQueries'
import { useSmartDefaults } from '../hooks/useSmartDefaults'
import { dateUtils } from '../utils/dateUtils'
import { ComponentErrorBoundary } from './ComponentErrorBoundary'
import { reportError } from '../utils/errorHandler'
import type { EntryType, NewTrackerEntry } from '../types'

interface NewActivityModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  onError: (error: string) => void
  babyId: string
  initialEntryType?: EntryType
}

export const NewActivityModal: React.FC<NewActivityModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onError,
  babyId,
  initialEntryType = 'feeding',
}) => {
  const createEntry = useCreateEntry()
  const { smartDefaults, hasDefaults } = useSmartDefaults({
    entryType: initialEntryType,
    babyId,
    enabled: isOpen,
  })

  // Form validation
  const validateActivity = (values: ActivityFormData) => {
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
      (values.entryType === 'feeding' && values.feedingType === 'bottle') ||
      values.entryType === 'pumping'
    ) {
      if (values.quantity && parseFloat(values.quantity) <= 0) {
        errors.quantity = 'Quantity must be greater than 0'
      }
    }

    return errors
  }

  // Form submission handler
  const handleSubmit = async (values: ActivityFormData) => {
    const newEntry: NewTrackerEntry = {
      baby_id: babyId,
      entry_type: values.entryType,
      start_time: values.startTime,
      end_time: values.endTime || null,
      quantity: values.quantity ? parseFloat(values.quantity) : null,
      notes: values.notes || null,
    }

    // Add type-specific fields
    if (values.entryType === 'feeding') {
      newEntry.feeding_type = values.feedingType
    }
    if (values.entryType === 'diaper') {
      newEntry.diaper_type = values.diaperType
    }

    try {
      await createEntry.mutateAsync(newEntry)
      onSave()
      onClose()
    } catch (error) {
      console.error('Error creating activity:', error)
      reportError(error instanceof Error ? error : new Error(String(error)), {
        context: 'createActivity',
        babyId,
        entryType: values.entryType,
      })
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create activity'
      onError(errorMessage)
    }
  }

  // Initialize form with smart defaults
  const form = useForm<ActivityFormData>({
    initialValues: {
      entryType: smartDefaults.entryType || initialEntryType,
      startTime: smartDefaults.startTime || dateUtils.getCurrentLocalDateTime(),
      endTime: smartDefaults.endTime || '',
      quantity: smartDefaults.quantity?.toString() || '',
      feedingType: smartDefaults.feedingType || 'bottle',
      diaperType: smartDefaults.diaperType || 'wet',
      notes: smartDefaults.notes || '',
    },
    validate: validateActivity,
    onSubmit: handleSubmit,
  })

  // Update form values when smart defaults change
  useEffect(() => {
    if (Object.keys(smartDefaults).length > 0) {
      form.setValues({
        entryType: smartDefaults.entryType || initialEntryType,
        startTime:
          smartDefaults.startTime || dateUtils.getCurrentLocalDateTime(),
        endTime: smartDefaults.endTime || '',
        quantity: smartDefaults.quantity?.toString() || '',
        feedingType: smartDefaults.feedingType || 'bottle',
        diaperType: smartDefaults.diaperType || 'wet',
        notes: smartDefaults.notes || '',
      })
    }
  }, [smartDefaults, initialEntryType]) // eslint-disable-line react-hooks/exhaustive-deps

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      form.reset()
    }
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  const isSubmitting = createEntry.isPending

  return (
    <ComponentErrorBoundary componentName='NewActivityModal'>
      <ModalForm
        isOpen={isOpen}
        onClose={onClose}
        title='New Activity Entry'
        onSubmit={form.handleSubmit}
        isSubmitting={isSubmitting}
        submitText='Create Entry'
        submitDisabled={
          Object.keys(form.errors).length > 0 || !form.values.startTime
        }
        size='lg'
      >
        {/* Smart Defaults Indicator */}
        {hasDefaults && (
          <div className='mb-4 rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/30'>
            <p className='text-sm text-emerald-800 dark:text-emerald-200'>
              ✨ <strong>Smart defaults applied!</strong> Values are pre-filled
              based on your recent patterns and time of day. Feel free to adjust
              as needed.
            </p>
          </div>
        )}

        <ComponentErrorBoundary componentName='ActivityForm'>
          <ActivityForm
            values={form.values}
            errors={form.errors}
            onChange={form.handleChange}
            disabled={isSubmitting}
          />
        </ComponentErrorBoundary>
      </ModalForm>
    </ComponentErrorBoundary>
  )
}
