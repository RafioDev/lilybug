import { useAsyncOperation } from './useAsyncOperation'
import { trackerService } from '../services/trackerService'
import type { UpdateTrackerEntry } from '../types'

export function useActivityOperations() {
  const updateActivity = useAsyncOperation((...args: unknown[]) =>
    trackerService.updateEntry(args[0] as string, args[1] as UpdateTrackerEntry)
  )

  return {
    updateActivity,
  }
}
