import React, { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Modal } from './Modal'
import { Button } from './Button'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isLoading?: boolean
  variant?: 'danger' | 'warning'
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isLoading = false,
  variant = 'danger',
}) => {
  // Focus management - focus Cancel button when modal opens
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure modal is fully rendered
      const timer = setTimeout(() => {
        const cancelButton = document.querySelector(
          '[data-cancel-button="true"]'
        ) as HTMLButtonElement
        if (cancelButton) {
          cancelButton.focus()
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Keyboard event handling
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      } else if (event.key === 'Enter') {
        event.preventDefault()
        onConfirm()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, onConfirm])

  const iconColor =
    variant === 'danger'
      ? 'text-red-500 dark:text-red-400'
      : 'text-amber-500 dark:text-amber-400'

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='sm'>
      <div className='text-center'>
        {/* Icon */}
        <div className='mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4'>
          <AlertTriangle
            className={`w-6 h-6 ${iconColor}`}
            aria-hidden='true'
          />
        </div>

        {/* Title */}
        <h3
          className='text-lg font-semibold text-gray-900 dark:text-white mb-2'
          id='confirmation-modal-title'
        >
          {title}
        </h3>

        {/* Message */}
        <p
          className='text-sm text-gray-600 dark:text-gray-300 mb-6'
          id='confirmation-modal-description'
        >
          {message}
        </p>

        {/* Action Buttons */}
        <div className='flex flex-col-reverse sm:flex-row sm:justify-center gap-3'>
          <Button
            variant='outline'
            onClick={onClose}
            disabled={isLoading}
            className='sm:w-auto'
            aria-describedby='confirmation-modal-description'
            data-cancel-button='true'
          >
            {cancelText}
          </Button>
          <Button
            variant='danger'
            onClick={onConfirm}
            loading={isLoading}
            disabled={isLoading}
            className='sm:w-auto'
            aria-describedby='confirmation-modal-description'
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
