import React, { useState } from 'react'
import { Modal } from './Modal'
import { Input } from './Input'
import { Button } from './Button'
import { babyService } from '../services/babyService'

interface AddBabyModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  onError: (error: string) => void
  isFirstBaby?: boolean
}

export const AddBabyModal: React.FC<AddBabyModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onError,
  isFirstBaby = false,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    birthdate: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsSubmitting(true)
    try {
      await babyService.createBaby({
        name: formData.name,
        birthdate: formData.birthdate,
        is_active: isFirstBaby, // First baby is active by default
      })

      // Reset form
      setFormData({ name: '', birthdate: '' })
      onSave()
      onClose()
    } catch (error) {
      console.error('Error creating baby:', error)
      onError('Failed to add baby. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      // Reset form when closing
      setFormData({ name: '', birthdate: '' })
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title='Add Baby'>
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
            {isSubmitting ? 'Adding...' : 'Add Baby'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
