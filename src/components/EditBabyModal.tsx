import React, { useState, useEffect } from 'react'
import { Modal } from './Modal'
import { Input } from './Input'
import { Button } from './Button'
import { babyService } from '../services/babyService'
import type { Baby } from '../types'

interface EditBabyModalProps {
  isOpen: boolean
  baby: Baby | null
  onClose: () => void
  onSave: () => void
  onError: (error: string) => void
}

export const EditBabyModal: React.FC<EditBabyModalProps> = ({
  isOpen,
  baby,
  onClose,
  onSave,
  onError,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    birthdate: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (baby) {
      setFormData({
        name: baby.name,
        birthdate: baby.birthdate,
      })
    } else {
      setFormData({
        name: '',
        birthdate: '',
      })
    }
  }, [baby])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!baby) return

    setIsSubmitting(true)
    try {
      await babyService.updateBaby(baby.id, {
        name: formData.name,
        birthdate: formData.birthdate,
      })
      onSave()
      onClose()
    } catch (error) {
      console.error('Error updating baby:', error)
      onError('Failed to update baby. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title='Edit Baby'>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
            Baby's Name
          </label>
          <Input
            type='text'
            value={formData.name}
            onChange={(value) => setFormData({ ...formData, name: value })}
            placeholder="Enter baby's name"
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
            Birth Date
          </label>
          <Input
            type='date'
            value={formData.birthdate}
            onChange={(value) => setFormData({ ...formData, birthdate: value })}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className='flex gap-3 pt-4'>
          <Button
            type='button'
            onClick={handleClose}
            variant='outline'
            fullWidth
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type='submit' fullWidth disabled={isSubmitting}>
            {isSubmitting ? 'Updating...' : 'Update Baby'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
