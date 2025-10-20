import React, { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Modal } from './Modal'
import { Button } from './Button'
import { ComponentErrorBoundary } from './ComponentErrorBoundary'

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
    <ComponentErrorBoundary componentName='ConfirmationModal'>
      <Modal isOpen={isOpen} onClose={onClose} size='sm'>
        <div className='text-center'>
          {/* Icon */}
          <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30'>
            <AlertTriangle
              className={`h-6 w-6 ${iconColor}`}
              aria-hidden='true'
            />
          </div>

          {/* Title */}
          <h3
            className='mb-2 text-lg font-semibold text-gray-900 dark:text-white'
            id='confirmation-modal-title'
          >
            {title}
          </h3>

          {/* Message */}
          <p
            className='mb-6 text-sm text-gray-600 dark:text-gray-300'
            id='confirmation-modal-description'
          >
            {message}
          </p>

          {/* Action Buttons */}
          <div className='flex flex-col-reverse gap-3 sm:flex-row sm:justify-center'>
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
    </ComponentErrorBoundary>
  )
}
