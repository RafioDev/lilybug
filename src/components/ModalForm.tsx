import React from 'react'
import { Modal } from './Modal'
import { Button } from './Button'

interface ModalFormProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  onSubmit: (e: React.FormEvent) => void
  isSubmitting?: boolean
  submitText?: string
  cancelText?: string
  submitDisabled?: boolean
  size?: 'sm' | 'md' | 'lg' | 'full'
}

export const ModalForm: React.FC<ModalFormProps> = ({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  isSubmitting = false,
  submitText = 'Submit',
  cancelText = 'Cancel',
  submitDisabled = false,
  size = 'md',
}) => {
  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} size={size}>
      <form onSubmit={onSubmit} className='space-y-4'>
        {children}

        <div className='flex gap-3 pt-4'>
          <Button
            type='button'
            onClick={handleClose}
            variant='outline'
            fullWidth
            disabled={isSubmitting}
          >
            {cancelText}
          </Button>
          <Button
            type='submit'
            fullWidth
            disabled={isSubmitting || submitDisabled}
          >
            {isSubmitting
              ? `${submitText.replace(/e?$/, 'ing')}...`
              : submitText}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
