import React, { useEffect } from 'react'
import { ModalForm } from './ModalForm'
import { ActivityForm, type ActivityFormData } from './ActivityForm'
import { useForm } from '../hooks/useForm'
import { useActivityOperations } from '../hooks/useActivityOperations'
import { dateUtils } from '../utils/dateUtils'
import type { TrackerEntry, UpdateTrackerEntry } from '../types'

interface ActivityModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (updatedEntry: TrackerEntry) => void
  onError: (error: string) => void
  entry: TrackerEntry | null
}

export const ActivityModal: React.FC<ActivityModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onError,
  entry,
}) => {
  const { updateActivity } = useActivityOperations()

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
    if (!entry) return

    try {
      // Prepare updates object
      const updates: UpdateTrackerEntry = {
        entry_type: values.entryType,
        start_time: values.startTime,
        end_time: values.endTime || null,
        quantity: values.quantity ? parseFloat(values.quantity) : null,
        notes: values.notes || null,
      }

      // Add type-specific fields
      if (values.entryType === 'feeding') {
        updates.feeding_type = values.feedingType
      }
      if (values.entryType === 'diaper') {
        updates.diaper_type = values.diaperType
      }

      const updatedEntry = await updateActivity.execute(entry.id, updates)
      onSave(updatedEntry)
      onClose()
    } catch (error) {
      console.error('Error updating activity:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update activity'
      onError(errorMessage)
    }
  }

  // Initialize form
  const form = useForm<ActivityFormData>({
    initialValues: {
      entryType: 'feeding',
      startTime: '',
      endTime: '',
      quantity: '',
      feedingType: 'bottle',
      diaperType: 'wet',
      notes: '',
    },
    validate: validateActivity,
    onSubmit: handleSubmit,
  })

  // Update form values when entry changes
  useEffect(() => {
    if (entry) {
      form.setValues({
        entryType: entry.entry_type,
        startTime: dateUtils.toLocalDateTimeString(entry.start_time),
        endTime: entry.end_time
          ? dateUtils.toLocalDateTimeString(entry.end_time)
          : '',
        quantity: entry.quantity?.toString() || '',
        feedingType: entry.feeding_type || 'bottle',
        diaperType: entry.diaper_type || 'wet',
        notes: entry.notes || '',
      })
    } else {
      form.reset()
    }
  }, [entry]) // eslint-disable-line react-hooks/exhaustive-deps

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      form.reset()
    }
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  const isSubmitting = updateActivity.loading

  if (!entry) return null

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit ${
        entry.entry_type.charAt(0).toUpperCase() + entry.entry_type.slice(1)
      } Activity`}
      onSubmit={form.handleSubmit}
      isSubmitting={isSubmitting}
      submitText='Save Changes'
      submitDisabled={
        Object.keys(form.errors).length > 0 || !form.values.startTime
      }
      size='lg'
    >
      <div className='mb-4'>
        <p className='text-sm text-gray-500'>
          Created: {new Date(entry.created_at).toLocaleString()}
        </p>
      </div>
      <ActivityForm
        values={form.values}
        errors={form.errors}
        onChange={form.handleChange}
        disabled={isSubmitting}
      />
    </ModalForm>
  )
}
