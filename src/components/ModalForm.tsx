import React from 'react'
import { Modal } from './Modal'
import { Button } from './Button'

/**
 * Props for the ModalForm component
 */
interface ModalFormProps {
  /** Whether the modal is open */
  isOpen: boolean
  /** Function called when modal should be closed */
  onClose: () => void
  /** Title displayed in the modal header */
  title: string
  /** Form content to render inside the modal */
  children: React.ReactNode
  /** Function called when form is submitted */
  onSubmit: (e: React.FormEvent) => void
  /** Whether the form is currently being submitted */
  isSubmitting?: boolean
  /** Text for the submit button */
  submitText?: string
  /** Text for the cancel button */
  cancelText?: string
  /** Whether the submit button should be disabled */
  submitDisabled?: boolean
  /** Size of the modal */
  size?: 'sm' | 'md' | 'lg' | 'full'
}

/**
 * A reusable modal component that wraps form content with standard form actions
 *
 * Provides a consistent modal form pattern with:
 * - Standard form layout and styling
 * - Cancel and submit buttons
 * - Loading state handling during submission
 * - Prevention of closing during submission
 * - Customizable button text and modal size
 *
 * @param props - The component props
 * @returns A modal with form functionality
 *
 * @example
 * ```tsx
 * <ModalForm
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   title="Add Item"
 *   onSubmit={handleSubmit}
 *   isSubmitting={loading}
 *   submitText="Add Item"
 * >
 *   <Input label="Name" value={name} onChange={setName} />
 * </ModalForm>
 * ```
 */
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
      {/* Enhanced form container with consistent dark mode styling */}
      <form onSubmit={onSubmit} className='space-y-6'>
        {/* Form content area with improved spacing and visual hierarchy */}
        <div className='space-y-5 text-gray-900 dark:text-gray-100'>
          {children}
        </div>

        {/* Enhanced form actions with better dark mode styling and spacing */}
        <div className='flex gap-3 pt-6 mt-6 border-t border-gray-200 dark:border-gray-600'>
          <Button
            type='button'
            onClick={handleClose}
            variant='outline'
            fullWidth
            disabled={isSubmitting}
            className='text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-gray-400 dark:hover:border-gray-400'
          >
            {cancelText}
          </Button>
          <Button
            type='submit'
            variant='primary'
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
