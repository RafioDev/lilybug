import { useState, useCallback } from 'react'

export interface UseFormOptions<T> {
  initialValues: T
  validate?: (values: T) => Record<string, string>
  onSubmit: (values: T) => Promise<void>
}

export interface UseFormReturn<T> {
  values: T
  errors: Record<string, string>
  isSubmitting: boolean
  handleChange: (field: keyof T, value: unknown) => void
  handleSubmit: (e: React.FormEvent) => Promise<void>
  reset: () => void
  setValues: (values: T) => void
}

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

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    reset,
    setValues: setValuesCallback,
  }
}
