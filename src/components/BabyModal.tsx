import React, { useEffect } from 'react'
import { ModalForm } from './ModalForm'
import { BabyForm, type BabyFormData } from './BabyForm'
import { useForm } from '../hooks/useForm'
import { useBabyOperations } from '../hooks/useBabyOperations'
import type { Baby } from '../types'

interface BabyModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  onError: (error: string) => void
  baby?: Baby | null // If provided, edit mode; if null/undefined, add mode
  isFirstBaby?: boolean // Only used in add mode
}

export const BabyModal: React.FC<BabyModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onError,
  baby,
  isFirstBaby = false,
}) => {
  const isEditMode = !!baby
  const { createBaby, updateBaby } = useBabyOperations()

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
        await updateBaby.execute(baby.id, {
          name: values.name,
          birthdate: values.birthdate,
        })
      } else {
        await createBaby.execute({
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
  const form = useForm({
    initialValues: {
      name: '',
      birthdate: '',
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

  const isSubmitting = createBaby.loading || updateBaby.loading

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Baby' : 'Add Baby'}
      onSubmit={form.handleSubmit}
      isSubmitting={isSubmitting}
      submitText={isEditMode ? 'Update Baby' : 'Add Baby'}
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
