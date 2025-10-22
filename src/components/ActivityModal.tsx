import React, { useState } from 'react'
import { Modal } from './Modal'
import { Button } from './Button'
import { Input } from './Input'
import { activityUtils } from '../utils/activityUtils'
import { dateUtils } from '../utils/dateUtils'
import {
  useCreateEntry,
  useUpdateEntry,
} from '../hooks/queries/useTrackerQueries'
import { useActiveBaby } from '../hooks/queries/useBabyQueries'
import type { TrackerEntry, EntryType, FeedingType, DiaperType } from '../types'

interface ActivityModalProps {
  isOpen: boolean
  onClose: () => void
  onSave?: () => void
  onError?: (error: string) => void
  entry?: TrackerEntry | null
  babyId?: string
}

export const ActivityModal: React.FC<ActivityModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onError,
  entry,
  babyId,
}) => {
  const { data: activeBaby } = useActiveBaby()
  const createEntryMutation = useCreateEntry()
  const updateEntryMutation = useUpdateEntry()

  const isEditMode = !!entry
  const effectiveBabyId = babyId || activeBaby?.id
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const [hasUserModifiedTime, setHasUserModifiedTime] = useState(isEditMode)

  // Initialize form data based on entry prop
  const getInitialFormData = () => {
    if (entry) {
      return {
        entryType: entry.entry_type,
        startTime: dateUtils.toLocalDateTimeString(entry.start_time),
        endTime: entry.end_time
          ? dateUtils.toLocalDateTimeString(entry.end_time)
          : '',
        quantity: entry.quantity?.toString() || '',
        feedingType: entry.feeding_type || ('bottle' as FeedingType),
        diaperType: entry.diaper_type || ('wet' as DiaperType),
        notes: entry.notes || '',
      }
    }
    return {
      entryType: 'feeding' as EntryType,
      startTime: dateUtils.getCurrentLocalDateTime(),
      endTime: '',
      quantity: '',
      feedingType: 'bottle' as FeedingType,
      diaperType: 'wet' as DiaperType,
      notes: '',
    }
  }

  const [formData, setFormData] = useState(getInitialFormData)

  // For edit mode, always show advanced options
  const shouldShowAdvanced = isEditMode || showAdvancedOptions

  const handleSubmit = async () => {
    if (!effectiveBabyId) {
      onError?.('No baby selected')
      return
    }

    try {
      // For new activities, use current time unless user has explicitly modified it
      const shouldUseCurrentTime = !isEditMode && !hasUserModifiedTime
      const actualStartTime = shouldUseCurrentTime
        ? dateUtils.getCurrentLocalDateTime()
        : formData.startTime

      const entryData = {
        entry_type: formData.entryType,
        start_time: dateUtils.fromLocalDateTimeString(actualStartTime),
        end_time: formData.endTime
          ? dateUtils.fromLocalDateTimeString(formData.endTime)
          : null,
        quantity: formData.quantity ? parseFloat(formData.quantity) : null,
        feeding_type:
          formData.entryType === 'feeding' ? formData.feedingType : null,
        diaper_type:
          formData.entryType === 'diaper' ? formData.diaperType : null,
        notes: formData.notes || null,
        baby_id: effectiveBabyId,
      }

      if (isEditMode && entry) {
        await updateEntryMutation.mutateAsync({
          id: entry.id,
          updates: entryData,
        })
      } else {
        await createEntryMutation.mutateAsync(entryData)
      }

      onSave?.()
      // Reset flags for next time
      setHasUserModifiedTime(false)
      setShowAdvancedOptions(false)
      onClose()
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'An error occurred')
    }
  }

  const getFeedingTypeLabel = (type: FeedingType) => {
    switch (type) {
      case 'breast_left':
        return 'Left Breast'
      case 'breast_right':
        return 'Right Breast'
      case 'bottle':
        return 'Bottle'
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Activity' : 'Add Activity'}
    >
      <div className='space-y-4'>
        {!isEditMode && (
          <div className='rounded-lg bg-blue-50 p-3 dark:bg-blue-900/30'>
            <p className='text-sm text-blue-800 dark:text-blue-200'>
              💡 <strong>Quick Entry:</strong> Just select the activity type and
              save! Use "Show more options" below for detailed tracking.
            </p>
          </div>
        )}

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
                  onClick={() => setFormData({ ...formData, entryType: type })}
                  className={`rounded-xl border-2 p-3 capitalize transition-all ${
                    formData.entryType === type
                      ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  {activityUtils.getActivityIcon(type)} {type}
                </button>
              )
            )}
          </div>
        </div>

        {/* Essential fields for feeding */}
        {formData.entryType === 'feeding' && (
          <div>
            <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
              Feeding Type
            </label>
            <div className='grid grid-cols-2 gap-2'>
              {(['breast_left', 'breast_right', 'bottle'] as FeedingType[]).map(
                (type) => (
                  <button
                    key={type}
                    onClick={() =>
                      setFormData({ ...formData, feedingType: type })
                    }
                    className={`rounded-xl border-2 p-3 text-sm transition-all ${
                      formData.feedingType === type
                        ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    {getFeedingTypeLabel(type)}
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {/* Essential fields for bottle feeding */}
        {formData.entryType === 'feeding' &&
          formData.feedingType === 'bottle' && (
            <Input
              label='Amount (oz)'
              type='number'
              step='0.5'
              value={formData.quantity}
              onChange={(val) => setFormData({ ...formData, quantity: val })}
              placeholder='e.g., 4'
            />
          )}

        {/* Essential fields for pumping */}
        {formData.entryType === 'pumping' && (
          <Input
            label='Amount (oz)'
            type='number'
            step='0.5'
            value={formData.quantity}
            onChange={(val) => setFormData({ ...formData, quantity: val })}
            placeholder='e.g., 4'
          />
        )}

        {/* Essential fields for diaper */}
        {formData.entryType === 'diaper' && (
          <div>
            <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
              Diaper Type
            </label>
            <div className='grid grid-cols-3 gap-2'>
              {(['wet', 'dirty', 'both'] as DiaperType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setFormData({ ...formData, diaperType: type })}
                  className={`rounded-xl border-2 p-3 capitalize transition-all ${
                    formData.diaperType === type
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Show more options toggle for new activities */}
        {!isEditMode && (
          <button
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            className='flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 p-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
          >
            {showAdvancedOptions ? 'Hide' : 'Show more'} options
          </button>
        )}

        {/* Advanced options */}
        {shouldShowAdvanced && (
          <div className='space-y-4 border-t border-gray-200 pt-4 dark:border-gray-600'>
            <Input
              label='Start Time'
              type='datetime-local'
              value={formData.startTime}
              onChange={(val) => {
                setFormData({ ...formData, startTime: val })
                setHasUserModifiedTime(true)
              }}
            />

            {(formData.entryType === 'sleep' ||
              (formData.entryType === 'feeding' &&
                formData.feedingType !== 'bottle')) && (
              <Input
                label='End Time (optional)'
                type='datetime-local'
                value={formData.endTime}
                onChange={(val) => setFormData({ ...formData, endTime: val })}
              />
            )}

            <Input
              label='Notes (optional)'
              type='textarea'
              value={formData.notes}
              onChange={(val) => setFormData({ ...formData, notes: val })}
              placeholder='Any additional details...'
              rows={2}
            />
          </div>
        )}

        <div className='flex gap-3'>
          <Button
            onClick={() => {
              setHasUserModifiedTime(false)
              setShowAdvancedOptions(false)
              onClose()
            }}
            variant='outline'
            fullWidth
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} fullWidth>
            {isEditMode ? 'Update' : 'Save'} Activity
          </Button>
        </div>
      </div>
    </Modal>
  )
}
