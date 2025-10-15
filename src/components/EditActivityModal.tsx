import React, { useState, useEffect } from 'react'
import { Modal } from './Modal'
import { Button } from './Button'
import { Input } from './Input'
import { trackerService } from '../services/trackerService'
import type {
  TrackerEntry,
  EntryType,
  FeedingType,
  DiaperType,
  UpdateTrackerEntry,
} from '../types'

interface EditActivityModalProps {
  isOpen: boolean
  entry: TrackerEntry | null
  onClose: () => void
  onSave: (updatedEntry: TrackerEntry) => void
  onError?: (error: string) => void
}

export const EditActivityModal: React.FC<EditActivityModalProps> = ({
  isOpen,
  entry,
  onClose,
  onSave,
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    entryType: 'feeding' as EntryType,
    startTime: '',
    endTime: '',
    quantity: '',
    feedingType: 'bottle' as FeedingType,
    diaperType: 'wet' as DiaperType,
    notes: '',
  })

  // Initialize form data when entry changes
  useEffect(() => {
    if (entry) {
      setFormData({
        entryType: entry.entry_type,
        startTime: new Date(entry.start_time).toISOString().slice(0, 16),
        endTime: entry.end_time
          ? new Date(entry.end_time).toISOString().slice(0, 16)
          : '',
        quantity: entry.quantity?.toString() || '',
        feedingType: entry.feeding_type || 'bottle',
        diaperType: entry.diaper_type || 'wet',
        notes: entry.notes || '',
      })
    }
  }, [entry])

  const handleSave = async () => {
    if (!entry) return

    setIsLoading(true)
    try {
      // Prepare updates object
      const updates: UpdateTrackerEntry = {
        entry_type: formData.entryType,
        start_time: formData.startTime,
        end_time: formData.endTime || null,
        quantity: formData.quantity ? parseFloat(formData.quantity) : null,
        notes: formData.notes || null,
      }

      // Add type-specific fields
      if (formData.entryType === 'feeding') {
        updates.feeding_type = formData.feedingType
      }
      if (formData.entryType === 'diaper') {
        updates.diaper_type = formData.diaperType
      }

      // Update the entry
      const updatedEntry = await trackerService.updateEntry(entry.id, updates)
      onSave(updatedEntry)
      onClose()
    } catch (error) {
      console.error('Error updating entry:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update entry'
      onError?.(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    if (entry) {
      // Reset form to original values
      setFormData({
        entryType: entry.entry_type,
        startTime: new Date(entry.start_time).toISOString().slice(0, 16),
        endTime: entry.end_time
          ? new Date(entry.end_time).toISOString().slice(0, 16)
          : '',
        quantity: entry.quantity?.toString() || '',
        feedingType: entry.feeding_type || 'bottle',
        diaperType: entry.diaper_type || 'wet',
        notes: entry.notes || '',
      })
    }
    onClose()
  }

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

  if (!entry) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={`Edit ${entry.entry_type} Activity`}
      size='lg'
    >
      <div className='space-y-4'>
        {/* Activity Type Display */}
        <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
          <span className='text-2xl'>
            {getActivityIcon(formData.entryType)}
          </span>
          <div>
            <p className='font-medium text-gray-900 capitalize'>
              {formData.entryType} Activity
            </p>
            <p className='text-sm text-gray-500'>
              Created: {new Date(entry.created_at).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Entry Type Selection */}
        <div>
          <label className='text-sm font-medium text-gray-700 block mb-2'>
            Activity Type
          </label>
          <div className='grid grid-cols-2 gap-2'>
            {(['feeding', 'sleep', 'diaper', 'pumping'] as EntryType[]).map(
              (type) => (
                <button
                  key={type}
                  onClick={() => setFormData({ ...formData, entryType: type })}
                  className={`p-3 rounded-xl border-2 transition-all capitalize ${
                    formData.entryType === type
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600'
                  }`}
                  disabled={isLoading}
                >
                  {getActivityIcon(type)} {type}
                </button>
              )
            )}
          </div>
        </div>

        {/* Start Time */}
        <Input
          label='Start Time'
          type='datetime-local'
          value={formData.startTime}
          onChange={(val) => setFormData({ ...formData, startTime: val })}
          disabled={isLoading}
          required
        />

        {/* End Time (for sleep and feeding) */}
        {(formData.entryType === 'sleep' ||
          formData.entryType === 'feeding') && (
          <Input
            label='End Time (optional)'
            type='datetime-local'
            value={formData.endTime}
            onChange={(val) => setFormData({ ...formData, endTime: val })}
            disabled={isLoading}
          />
        )}

        {/* Feeding-specific fields */}
        {formData.entryType === 'feeding' && (
          <>
            <div>
              <label className='text-sm font-medium text-gray-700 block mb-2'>
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
                    onClick={() =>
                      setFormData({ ...formData, feedingType: type })
                    }
                    className={`p-3 rounded-xl border-2 transition-all text-sm ${
                      formData.feedingType === type
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 text-gray-600'
                    }`}
                    disabled={isLoading}
                  >
                    {getFeedingTypeLabel(type)}
                  </button>
                ))}
              </div>
            </div>

            {formData.feedingType === 'bottle' && (
              <Input
                label='Amount (oz)'
                type='number'
                step='0.5'
                value={formData.quantity}
                onChange={(val) => setFormData({ ...formData, quantity: val })}
                placeholder='e.g., 4'
                disabled={isLoading}
              />
            )}
          </>
        )}

        {/* Pumping-specific fields */}
        {formData.entryType === 'pumping' && (
          <Input
            label='Amount (oz)'
            type='number'
            step='0.5'
            value={formData.quantity}
            onChange={(val) => setFormData({ ...formData, quantity: val })}
            placeholder='e.g., 4'
            disabled={isLoading}
          />
        )}

        {/* Diaper-specific fields */}
        {formData.entryType === 'diaper' && (
          <div>
            <label className='text-sm font-medium text-gray-700 block mb-2'>
              Diaper Type
            </label>
            <div className='grid grid-cols-3 gap-2'>
              {(['wet', 'dirty', 'both'] as DiaperType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setFormData({ ...formData, diaperType: type })}
                  className={`p-3 rounded-xl border-2 transition-all capitalize ${
                    formData.diaperType === type
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 text-gray-600'
                  }`}
                  disabled={isLoading}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        <Input
          label='Notes (optional)'
          type='textarea'
          value={formData.notes}
          onChange={(val) => setFormData({ ...formData, notes: val })}
          placeholder='Any additional details...'
          rows={3}
          disabled={isLoading}
        />

        {/* Action Buttons */}
        <div className='flex gap-3 pt-4'>
          <Button
            onClick={handleCancel}
            variant='outline'
            fullWidth
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            fullWidth
            disabled={isLoading || !formData.startTime}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
