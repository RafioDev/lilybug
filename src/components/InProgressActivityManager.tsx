import { useState, useEffect, useCallback, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { trackerService } from '../services/trackerService'
import { queryKeys } from '../lib/queryKeys'
import type { InProgressActivity } from '../types'

// Hook for managing in-progress activities
export const useInProgressActivityManager = (babyId: string) => {
  const [inProgressActivities, setInProgressActivities] = useState<
    InProgressActivity[]
  >([])
  const queryClient = useQueryClient()

  // Query to get all entries for the baby to identify in-progress activities
  const { data: entries = [], isLoading } = useQuery({
    queryKey: queryKeys.entriesForBaby(babyId, 100),
    queryFn: () => trackerService.getEntries(100, babyId),
    refetchInterval: 30000, // Refetch every 30 seconds to stay updated
    enabled: !!babyId, // Only run query if babyId is provided
  })

  // Mutation to stop an in-progress activity
  const stopActivityMutation = useMutation({
    mutationFn: async (activityId: string) => {
      const now = new Date().toISOString()
      return trackerService.updateEntry(activityId, { end_time: now })
    },
    onSuccess: () => {
      // Update the query cache
      queryClient.invalidateQueries({
        queryKey: queryKeys.entriesForBaby(babyId, 100),
      })
    },
    onError: (error) => {
      console.error('Failed to stop activity:', error)
    },
  })

  // Function to calculate elapsed duration
  const calculateElapsedDuration = useCallback((startTime: string): string => {
    const start = new Date(startTime)
    const now = new Date()
    const diffMs = now.getTime() - start.getTime()

    const minutes = Math.floor(diffMs / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}min`
    }
    return `${minutes} min`
  }, [])

  // Memoize in-progress activities calculation to prevent infinite re-renders
  const inProgressActivitiesFromEntries = useMemo(() => {
    if (!babyId || !entries.length) return []

    return entries
      .filter(
        (entry) =>
          (entry.entry_type === 'sleep' ||
            (entry.entry_type === 'feeding' &&
              entry.feeding_type !== 'bottle')) &&
          !entry.end_time &&
          entry.baby_id === babyId
      )
      .map((entry) => ({
        id: entry.id,
        entry_type: entry.entry_type as 'feeding' | 'sleep',
        start_time: entry.start_time,
        baby_id: entry.baby_id,
        elapsed_duration: calculateElapsedDuration(entry.start_time),
      }))
  }, [entries, babyId, calculateElapsedDuration])

  // Update in-progress activities when entries change
  useEffect(() => {
    setInProgressActivities(inProgressActivitiesFromEntries)
  }, [inProgressActivitiesFromEntries])

  // Update durations every minute for in-progress activities
  useEffect(() => {
    if (inProgressActivities.length === 0) return

    const interval = setInterval(() => {
      setInProgressActivities((prev) =>
        prev.map((activity) => ({
          ...activity,
          elapsed_duration: calculateElapsedDuration(activity.start_time),
        }))
      )
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [inProgressActivities.length, calculateElapsedDuration])

  // Function to stop an activity
  const stopActivity = useCallback(
    (activityId: string) => {
      stopActivityMutation.mutate(activityId)
    },
    [stopActivityMutation]
  )

  // Function to check if a new activity would conflict with existing in-progress activities
  const hasConflictingActivity = useCallback(
    (entryType: 'feeding' | 'sleep'): boolean => {
      return inProgressActivities.some(
        (activity) => activity.entry_type === entryType
      )
    },
    [inProgressActivities]
  )

  // Function to get in-progress activity of a specific type
  const getInProgressActivity = useCallback(
    (entryType: 'feeding' | 'sleep'): InProgressActivity | undefined => {
      return inProgressActivities.find(
        (activity) => activity.entry_type === entryType
      )
    },
    [inProgressActivities]
  )

  return {
    inProgressActivities,
    stopActivity,
    hasConflictingActivity,
    getInProgressActivity,
    isLoading,
    isStoppingActivity: stopActivityMutation.isPending,
  }
}
