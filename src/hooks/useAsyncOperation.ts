import { useState, useCallback, useMemo } from 'react'

/**
 * Return type for the useAsyncOperation hook
 * @template T - The type of data returned by the async operation
 */
export interface UseAsyncOperationReturn<T> {
  /** The data returned from the last successful operation */
  data: T | null
  /** Whether an operation is currently in progress */
  loading: boolean
  /** Error message from the last failed operation */
  error: string | null
  /** Execute the async operation with the provided arguments */
  execute: (...args: unknown[]) => Promise<T>
  /** Reset the state to initial values */
  reset: () => void
}

/**
 * Custom hook for managing async operations with loading and error states
 *
 * Provides a standardized way to handle async operations with:
 * - Loading state management
 * - Error handling and display
 * - Data storage from successful operations
 * - State reset functionality
 *
 * @template T - The type of data returned by the async operation
 * @param asyncFunction - The async function to wrap
 * @returns Object containing operation state and execute function
 *
 * @example
 * ```tsx
 * const { data, loading, error, execute } = useAsyncOperation(
 *   async (id: string) => await fetchUser(id)
 * )
 *
 * // Later in component
 * const handleClick = () => execute('user-123')
 * ```
 */
export function useAsyncOperation<T>(
  asyncFunction: (...args: unknown[]) => Promise<T>
): UseAsyncOperationReturn<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(
    async (...args: unknown[]): Promise<T> => {
      setLoading(true)
      setError(null)

      try {
        const result = await asyncFunction(...args)
        setData(result)
        return result
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An error occurred'
        setError(errorMessage)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [asyncFunction]
  )

  const reset = useCallback(() => {
    setData(null)
    setLoading(false)
    setError(null)
  }, [])

  return useMemo(
    () => ({
      data,
      loading,
      error,
      execute,
      reset,
    }),
    [data, loading, error, execute, reset]
  )
}
