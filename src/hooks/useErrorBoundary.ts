import { useCallback, useState } from 'react'

/**
 * Hook to manually trigger error boundary from functional components
 * Useful for handling async errors that don't automatically trigger error boundaries
 */
export const useErrorBoundary = () => {
  const [, setError] = useState<Error | null>(null)

  const captureError = useCallback(
    (error: Error | string) => {
      const errorObj = error instanceof Error ? error : new Error(error)

      // Log the error
      console.error('Error captured by useErrorBoundary:', errorObj)

      // Trigger error boundary by throwing in render
      setError(() => {
        throw errorObj
      })
    },
    [setError]
  )

  return captureError
}

/**
 * Hook for handling async operations with automatic error boundary integration
 */
export const useAsyncError = <T extends unknown[], R>() => {
  const captureError = useErrorBoundary()

  const handleAsyncError = useCallback(
    (asyncFn: (...args: T) => Promise<R>) => {
      return async (...args: T): Promise<R | undefined> => {
        try {
          return await asyncFn(...args)
        } catch (error) {
          captureError(
            error instanceof Error ? error : new Error(String(error))
          )
          return undefined
        }
      }
    },
    [captureError]
  )

  return handleAsyncError
}
