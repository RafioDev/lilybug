import React, { useEffect } from 'react'
import { ModalForm } from './ModalForm'
import { BabyForm, type BabyFormData } from './BabyForm'
import { useForm } from '../hooks/useForm'
import { useCreateBaby, useUpdateBaby } from '../hooks/queries/useBabyQueries'
import type { Baby } from '../types'

/**
 * Props for the BabyModal component
 */
interface BabyModalProps {
  /** Whether the modal is open */
  isOpen: boolean
  /** Function called when modal should be closed */
  onClose: () => void
  /** Function called when baby is successfully saved */
  onSave: () => void
  /** Function called when an error occurs */
  onError: (error: string) => void
  /** Baby data for edit mode, null/undefined for add mode */
  baby?: Baby | null
  /** Whether this is the first baby being added (sets as active) */
  isFirstBaby?: boolean
}

/**
 * A unified modal component for adding and editing baby information
 *
 * Handles both create and update operations for baby data with:
 * - Automatic mode detection (add vs edit) based on baby prop
 * - Form validation with real-time error feedback
 * - Integration with baby operations (create/update)
 * - Loading states during submission
 * - Error handling and user feedback
 * - Form reset on modal close/open
 * - Pre-population of form data in edit mode
 *
 * The component consolidates the functionality of separate AddBabyModal
 * and EditBabyModal components into a single, reusable component.
 *
 * @param props - The component props
 * @returns A modal for baby creation or editing
 *
 * @example
 * ```tsx
 * // Add mode
 * <BabyModal
 *   isOpen={showAddModal}
 *   onClose={() => setShowAddModal(false)}
 *   onSave={handleBabyAdded}
 *   onError={handleError}
 *   isFirstBaby={babies.length === 0}
 * />
 *
 * // Edit mode
 * <BabyModal
 *   isOpen={showEditModal}
 *   onClose={() => setShowEditModal(false)}
 *   onSave={handleBabyUpdated}
 *   onError={handleError}
 *   baby={selectedBaby}
 * />
 * ```
 */
export const BabyModal: React.FC<BabyModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onError,
  baby,
  isFirstBaby = false,
}) => {
  const isEditMode = !!baby
  const createBabyMutation = useCreateBaby()
  const updateBabyMutation = useUpdateBaby()

  // Form validation
  const validateBaby = (values: BabyFormData) => {
    const errors: Record<string, string> = {}

    if (!values.name.trim()) {
      errors.name = 'Baby name is required'
    }

    if (!values.birthdate) {
      errors.birthdate = 'Birth date is required'
    } else {
      const birthDate = new Date(values.birthdate)
      const today = new Date()
      if (birthDate > today) {
        errors.birthdate = 'Birth date cannot be in the future'
      }
    }

    return errors
  }

  // Form submission handler
  const handleSubmit = async (values: BabyFormData) => {
    try {
      if (isEditMode && baby) {
        await updateBabyMutation.mutateAsync({
          id: baby.id,
          updates: {
            name: values.name,
            birthdate: values.birthdate,
          },
        })
      } else {
        await createBabyMutation.mutateAsync({
          name: values.name,
          birthdate: values.birthdate,
          is_active: isFirstBaby,
        })
      }

      onSave()
      onClose()
    } catch (error) {
      console.error(
        `Error ${isEditMode ? 'updating' : 'creating'} baby:`,
        error
      )
      onError(
        `Failed to ${isEditMode ? 'update' : 'add'} baby. Please try again.`
      )
    }
  }

  // Initialize form
  const form = useForm<BabyFormData>({
    initialValues: {
      name: '',
      birthdate: '',
      is_active: isFirstBaby,
    },
    validate: validateBaby,
    onSubmit: handleSubmit,
  })

  // Update form values when baby changes (for edit mode)
  useEffect(() => {
    if (isEditMode && baby) {
      form.setValues({
        name: baby.name,
        birthdate: baby.birthdate,
        is_active: baby.is_active,
      })
    } else {
      form.reset()
    }
  }, [baby, isEditMode]) // eslint-disable-line react-hooks/exhaustive-deps

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      form.reset()
    }
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  const isSubmitting =
    createBabyMutation.isPending || updateBabyMutation.isPending

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Baby' : 'Add Baby'}
      onSubmit={form.handleSubmit}
      isSubmitting={isSubmitting}
      submitText={isEditMode ? 'Update' : 'Save'}
      submitDisabled={Object.keys(form.errors).length > 0}
    >
      <BabyForm
        values={form.values}
        errors={form.errors}
        onChange={form.handleChange}
        disabled={isSubmitting}
      />
    </ModalForm>
  )
}
