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
      <form onSubmit={onSubmit} className='space-y-4'>
        <div className='space-y-4'>{children}</div>

        <div className='flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700'>
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
