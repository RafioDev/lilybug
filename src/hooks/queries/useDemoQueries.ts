import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useDemoContext } from '../../contexts/DemoContext'
import type {
  TrackerEntry,
  NewTrackerEntry,
  UpdateTrackerEntry,
} from '../../types'

// Demo profile queries
export const useDemoProfile = () => {
  const { demoProfile } = useDemoContext()

  return useQuery({
    queryKey: ['profile', 'demo'],
    queryFn: async () => ({ profile: demoProfile }),
    staleTime: Infinity,
  })
}

// Demo baby queries
export const useDemoBabies = () => {
  const { demoBabies } = useDemoContext()

  return useQuery({
    queryKey: ['babies', 'demo'],
    queryFn: async () => demoBabies,
    staleTime: Infinity,
  })
}

export const useDemoActiveBaby = () => {
  const { demoBabies } = useDemoContext()

  return useQuery({
    queryKey: ['activeBaby', 'demo'],
    queryFn: async () => demoBabies[0],
    staleTime: Infinity,
  })
}

// Demo tracker queries
export const useDemoEntries = (limit?: number, babyId?: string) => {
  const { demoEntries } = useDemoContext()
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: ['entries', 'demo', limit, babyId],
    queryFn: async () => {
      // Get cached entries or use initial demo entries
      const cachedEntries =
        queryClient.getQueryData<TrackerEntry[]>(['entries', 'demo', 'all']) ||
        demoEntries

      let filtered = cachedEntries
      if (babyId) {
        filtered = filtered.filter((entry) => entry.baby_id === babyId)
      }
      if (limit) {
        filtered = filtered.slice(0, limit)
      }
      return filtered
    },
    staleTime: 0, // Always refetch to get latest state
  })
}

export const useDemoCreateEntry = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (entry: NewTrackerEntry) => {
      console.log('Demo mode: Create entry', entry)

      // Create a mock entry
      const mockEntry: TrackerEntry = {
        id: `demo-entry-${Date.now()}`,
        user_id: 'demo-user-id',
        baby_id: entry.baby_id,
        entry_type: entry.entry_type,
        start_time: entry.start_time || new Date().toISOString(),
        end_time: entry.end_time || null,
        quantity: entry.quantity || null,
        feeding_type: entry.feeding_type || null,
        diaper_type: entry.diaper_type || null,
        notes: entry.notes || null,
        created_at: new Date().toISOString(),
      }

      // Add to cache
      const currentEntries =
        queryClient.getQueryData<TrackerEntry[]>(['entries', 'demo', 'all']) ||
        []
      queryClient.setQueryData(
        ['entries', 'demo', 'all'],
        [mockEntry, ...currentEntries]
      )

      return mockEntry
    },
    onSuccess: () => {
      // Invalidate all entry queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['entries', 'demo'] })
    },
  })
}

export const useDemoUpdateEntry = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string
      updates: UpdateTrackerEntry
    }) => {
      console.log('Demo mode: Update entry', id, updates)

      // Get current entries from cache
      const currentEntries =
        queryClient.getQueryData<TrackerEntry[]>(['entries', 'demo', 'all']) ||
        []

      // Update the entry
      const updatedEntries = currentEntries.map((entry) =>
        entry.id === id ? { ...entry, ...updates } : entry
      )

      // Update cache
      queryClient.setQueryData(['entries', 'demo', 'all'], updatedEntries)

      return { id, ...updates }
    },
    onSuccess: () => {
      // Invalidate all entry queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['entries', 'demo'] })
    },
  })
}

export const useDemoDeleteEntry = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      console.log('Demo mode: Delete entry', id)

      // Get current entries from cache
      const currentEntries =
        queryClient.getQueryData<TrackerEntry[]>(['entries', 'demo', 'all']) ||
        []

      // Remove the entry
      const updatedEntries = currentEntries.filter((entry) => entry.id !== id)

      // Update cache
      queryClient.setQueryData(['entries', 'demo', 'all'], updatedEntries)

      return id
    },
    onSuccess: () => {
      // Invalidate all entry queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['entries', 'demo'] })
    },
  })
}
