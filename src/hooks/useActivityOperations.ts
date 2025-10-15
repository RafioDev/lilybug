import { useAsyncOperation } from './useAsyncOperation'
import { trackerService } from '../services/trackerService'
import type { UpdateTrackerEntry } from '../types'

export function useActivityOperations() {
  const updateActivity = useAsyncOperation(
    (id: string, updates: UpdateTrackerEntry) =>
      trackerService.updateEntry(id, updates)
  )

  return {
    updateActivity,
  }
}
