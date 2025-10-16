import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { trackerService } from '../../services/trackerService'
import { queryKeys } from '../../lib/queryKeys'
import type { NewTrackerEntry, UpdateTrackerEntry } from '../../types'

export const useEntries = (limit = 50, babyId?: string) => {
  return useQuery({
    queryKey: babyId
      ? queryKeys.entriesForBaby(babyId, limit)
      : [...queryKeys.entries, { limit }],
    queryFn: () => trackerService.getEntries(limit, babyId),
    enabled: true,
    // Add longer stale time to reduce refetches
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export const useEntry = (id: string) => {
  return useQuery({
    queryKey: queryKeys.entry(id),
    queryFn: () => trackerService.getEntry(id),
    enabled: !!id,
  })
}

export const useCreateEntry = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (entry: NewTrackerEntry) => trackerService.createEntry(entry),
    onSuccess: (newEntry) => {
      // Invalidate entries queries
      queryClient.invalidateQueries({ queryKey: queryKeys.entries })

      // If the entry has a baby_id, also invalidate baby-specific queries
      if (newEntry.baby_id) {
        queryClient.invalidateQueries({
          queryKey: ['entries', 'baby', newEntry.baby_id],
        })
      }
    },
  })
}

export const useUpdateEntry = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string
      updates: UpdateTrackerEntry
    }) => trackerService.updateEntry(id, updates),
    onSuccess: (updatedEntry) => {
      // Update the entry in the cache
      queryClient.setQueryData(queryKeys.entry(updatedEntry.id), updatedEntry)

      // Invalidate entries queries
      queryClient.invalidateQueries({ queryKey: queryKeys.entries })

      // If the entry has a baby_id, also invalidate baby-specific queries
      if (updatedEntry.baby_id) {
        queryClient.invalidateQueries({
          queryKey: ['entries', 'baby', updatedEntry.baby_id],
        })
      }
    },
  })
}

export const useDeleteEntry = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => trackerService.deleteEntry(id),
    onSuccess: (_, deletedId) => {
      // Remove the entry from cache
      queryClient.removeQueries({ queryKey: queryKeys.entry(deletedId) })

      // Invalidate entries queries
      queryClient.invalidateQueries({ queryKey: queryKeys.entries })
    },
  })
}
