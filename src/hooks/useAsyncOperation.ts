import { useState, useCallback } from 'react'

export interface UseAsyncOperationReturn<T> {
  data: T | null
  loading: boolean
  error: string | null
  execute: (...args: any[]) => Promise<T>
  reset: () => void
}

export function useAsyncOperation<T>(
  asyncFunction: (...args: any[]) => Promise<T>
): UseAsyncOperationReturn<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(
    async (...args: any[]): Promise<T> => {
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

  return {
    data,
    loading,
    error,
    execute,
    reset,
  }
}
