import React, { useEffect } from 'react'
import { ModalForm } from './ModalForm'
import { ActivityForm, type ActivityFormData } from './ActivityForm'
import { useForm } from '../hooks/useForm'
import {
  useUpdateEntry,
  useCreateEntry,
} from '../hooks/queries/useTrackerQueries'
import { dateUtils } from '../utils/dateUtils'
import { ComponentErrorBoundary } from './ComponentErrorBoundary'
import { reportError } from '../utils/errorHandler'
import type {
  TrackerEntry,
  UpdateTrackerEntry,
  NewTrackerEntry,
  EntryType,
} from '../types'

interface ActivityModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (entry?: TrackerEntry) => void
  onError: (error: string) => void
  entry?: TrackerEntry | null // Optional - if provided, edit mode; if not, create mode
  babyId?: string // Required for create mode
  initialEntryType?: EntryType // For create mode
}

export const ActivityModal: React.FC<ActivityModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onError,
  entry,
  babyId,
  initialEntryType = 'feeding',
}) => {
  const updateEntry = useUpdateEntry()
  const createEntry = useCreateEntry()

  const isEditMode = Boolean(entry)
  const isCreateMode = !isEditMode

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
    if (isEditMode && !entry) return
    if (isCreateMode && !babyId) return

    try {
      if (isEditMode) {
        // Update existing entry
        const updates: UpdateTrackerEntry = {
          entry_type: values.entryType,
          start_time: dateUtils.fromLocalDateTimeString(values.startTime),
          end_time: values.endTime
            ? dateUtils.fromLocalDateTimeString(values.endTime)
            : null,
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

        const updatedEntry = await updateEntry.mutateAsync({
          id: entry!.id,
          updates,
        })
        onSave(updatedEntry)
      } else {
        // Create new entry
        const newEntry: NewTrackerEntry = {
          baby_id: babyId!,
          entry_type: values.entryType,
          start_time: dateUtils.fromLocalDateTimeString(values.startTime),
          end_time: values.endTime
            ? dateUtils.fromLocalDateTimeString(values.endTime)
            : null,
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

        await createEntry.mutateAsync(newEntry)
        onSave()
      }

      onClose()
    } catch (error) {
      console.error(
        `Error ${isEditMode ? 'updating' : 'creating'} activity:`,
        error
      )
      reportError(error instanceof Error ? error : new Error(String(error)), {
        context: isEditMode ? 'updateActivity' : 'createActivity',
        entryId: entry?.id,
        babyId,
      })
      const errorMessage =
        error instanceof Error
          ? error.message
          : `Failed to ${isEditMode ? 'update' : 'create'} activity`
      onError(errorMessage)
    }
  }

  // Initialize form
  const form = useForm<ActivityFormData>({
    initialValues: {
      entryType: initialEntryType,
      startTime: dateUtils.getCurrentLocalDateTime(),
      endTime: '',
      quantity: '',
      feedingType: 'bottle',
      diaperType: 'wet',
      notes: '',
    },
    validate: validateActivity,
    onSubmit: handleSubmit,
  })

  // Update form values when entry changes (edit mode) or reset for create mode
  useEffect(() => {
    if (isEditMode && entry) {
      // Edit mode - populate with existing entry data
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
    } else if (isCreateMode) {
      // Create mode - simple defaults (current time)
      form.setValues({
        entryType: initialEntryType,
        startTime: dateUtils.getCurrentLocalDateTime(),
        endTime: '',
        quantity: '',
        feedingType: 'bottle',
        diaperType: 'wet',
        notes: '',
      })
    }
  }, [entry, isEditMode, isCreateMode, initialEntryType]) // eslint-disable-line react-hooks/exhaustive-deps

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      form.reset()
    }
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  const isSubmitting = updateEntry.isPending || createEntry.isPending

  return (
    <ComponentErrorBoundary componentName='ActivityModal'>
      <ModalForm
        isOpen={isOpen}
        onClose={onClose}
        title={
          isEditMode
            ? `Edit ${entry!.entry_type.charAt(0).toUpperCase() + entry!.entry_type.slice(1)} Activity`
            : 'New Activity Entry'
        }
        onSubmit={form.handleSubmit}
        isSubmitting={isSubmitting}
        submitText={isEditMode ? 'Save' : 'Create Entry'}
        submitDisabled={
          Object.keys(form.errors).length > 0 || !form.values.startTime
        }
        size='lg'
      >
        <ComponentErrorBoundary componentName='ActivityForm'>
          <ActivityForm
            values={form.values}
            errors={form.errors}
            onChange={form.handleChange}
            disabled={isSubmitting}
            quickEntryMode={isCreateMode}
            isEditMode={isEditMode}
          />
        </ComponentErrorBoundary>
      </ModalForm>
    </ComponentErrorBoundary>
  )
}
