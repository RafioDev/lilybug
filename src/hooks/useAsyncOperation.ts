import { useState, useCallback, useMemo } from 'react'

export interface UseAsyncOperationReturn<T> {
  data: T | null
  loading: boolean
  error: string | null
  execute: (...args: unknown[]) => Promise<T>
  reset: () => void
}

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
