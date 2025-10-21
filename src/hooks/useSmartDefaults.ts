import { useMemo } from 'react'
import { useEntries } from './queries/useTrackerQueries'
import { smartDefaultsEngine } from '../services/smartDefaultsService'
import type { EntryType } from '../types'

interface UseSmartDefaultsOptions {
  entryType: EntryType
  babyId: string
  enabled?: boolean
}

/**
 * Hook to calculate smart defaults for entry forms
 *
 * @param options Configuration options
 * @returns Smart defaults object and loading state
 */
export const useSmartDefaults = ({
  entryType,
  babyId,
  enabled = true,
}: UseSmartDefaultsOptions) => {
  const { data: recentEntries = [], isLoading } = useEntries(20, babyId)

  const smartDefaults = useMemo(() => {
    if (!enabled || isLoading || recentEntries.length === 0) {
      return {}
    }

    const timeContext = smartDefaultsEngine.createTimeContext(recentEntries)
    return smartDefaultsEngine.calculateDefaults(
      entryType,
      recentEntries,
      timeContext
    )
  }, [entryType, recentEntries, enabled, isLoading])

  const hasDefaults = Object.keys(smartDefaults).length > 0

  return {
    smartDefaults,
    hasDefaults,
    isLoading,
  }
}
