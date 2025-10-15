import { useState, useCallback, useMemo } from 'react'

/**
 * Configuration options for the useForm hook
 * @template T - The type of form values
 */
export interface UseFormOptions<T> {
  /** Initial values for the form fields */
  initialValues: T
  /** Optional validation function that returns field errors */
  validate?: (values: T) => Record<string, string>
  /** Function called when form is submitted with valid data */
  onSubmit: (values: T) => Promise<void>
}

/**
 * Return type for the useForm hook
 * @template T - The type of form values
 */
export interface UseFormReturn<T> {
  /** Current form field values */
  values: T
  /** Current validation errors by field name */
  errors: Record<string, string>
  /** Whether the form is currently being submitted */
  isSubmitting: boolean
  /** Handler to update a specific form field */
  handleChange: (field: keyof T, value: unknown) => void
  /** Handler for form submission */
  handleSubmit: (e: React.FormEvent) => Promise<void>
  /** Reset form to initial state */
  reset: () => void
  /** Set all form values at once */
  setValues: (values: T) => void
}

/**
 * Custom hook for managing form state, validation, and submission
 *
 * Provides a complete form management solution with:
 * - Form state management
 * - Real-time validation with error clearing
 * - Submission handling with loading states
 * - Form reset functionality
 *
 * @template T - The type of form values (must extend Record<string, unknown>)
 * @param options - Configuration options for the form
 * @returns Form state and handlers
 *
 * @example
 * ```tsx
 * const form = useForm({
 *   initialValues: { name: '', email: '' },
 *   validate: (values) => {
 *     const errors = {}
 *     if (!values.name) errors.name = 'Name is required'
 *     return errors
 *   },
 *   onSubmit: async (values) => {
 *     await submitForm(values)
 *   }
 * })
 * ```
 */
export function useForm<T extends Record<string, unknown>>({
  initialValues,
  validate,
  onSubmit,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = useCallback((field: keyof T, value: unknown) => {
    setValues((prev) => ({ ...prev, [field]: value }))
    // Clear error for this field when user starts typing
    setErrors((prev) => {
      if (prev[field as string]) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [field as string]: _, ...rest } = prev
        return rest
      }
      return prev
    })
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      // Run validation if provided
      if (validate) {
        const validationErrors = validate(values)
        setErrors(validationErrors)

        // Don't submit if there are validation errors
        if (Object.keys(validationErrors).length > 0) {
          return
        }
      }

      setIsSubmitting(true)
      try {
        await onSubmit(values)
      } finally {
        setIsSubmitting(false)
      }
    },
    [values, validate, onSubmit]
  )

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setIsSubmitting(false)
  }, [initialValues])

  const setValuesCallback = useCallback((newValues: T) => {
    setValues(newValues)
    setErrors({}) // Clear errors when setting new values
  }, [])

  return useMemo(
    () => ({
      values,
      errors,
      isSubmitting,
      handleChange,
      handleSubmit,
      reset,
      setValues: setValuesCallback,
    }),
    [
      values,
      errors,
      isSubmitting,
      handleChange,
      handleSubmit,
      reset,
      setValuesCallback,
    ]
  )
}
