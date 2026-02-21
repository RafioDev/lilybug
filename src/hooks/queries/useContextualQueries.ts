import { useDemoContext } from '../../contexts/DemoContext'
import { useUserProfile } from './useProfileQueries'
import { useBabies, useActiveBaby } from './useBabyQueries'
import {
  useEntries,
  useCreateEntry,
  useUpdateEntry,
  useDeleteEntry,
} from './useTrackerQueries'
import {
  useDemoProfile,
  useDemoBabies,
  useDemoActiveBaby,
  useDemoEntries,
  useDemoCreateEntry,
  useDemoUpdateEntry,
  useDemoDeleteEntry,
} from './useDemoQueries'

/**
 * Hook that returns the appropriate queries based on whether we're in demo mode
 * This allows components to work seamlessly in both real and demo environments
 */

export const useContextualProfile = () => {
  // Try to get demo context, but don't throw if not available
  let isDemo = false
  try {
    const demoContext = useDemoContext()
    isDemo = demoContext.isDemo
  } catch {
    // Not in demo context
  }

  const realProfile = useUserProfile()
  const demoProfile = useDemoProfile()

  return isDemo ? demoProfile : realProfile
}

export const useContextualBabies = () => {
  let isDemo = false
  try {
    const demoContext = useDemoContext()
    isDemo = demoContext.isDemo
  } catch {
    // Not in demo context
  }

  const realBabies = useBabies()
  const demoBabies = useDemoBabies()

  return isDemo ? demoBabies : realBabies
}

export const useContextualActiveBaby = () => {
  let isDemo = false
  try {
    const demoContext = useDemoContext()
    isDemo = demoContext.isDemo
  } catch {
    // Not in demo context
  }

  const realActiveBaby = useActiveBaby()
  const demoActiveBaby = useDemoActiveBaby()

  return isDemo ? demoActiveBaby : realActiveBaby
}

export const useContextualEntries = (limit?: number, babyId?: string) => {
  let isDemo = false
  try {
    const demoContext = useDemoContext()
    isDemo = demoContext.isDemo
  } catch {
    // Not in demo context
  }

  const realEntries = useEntries(limit, babyId)
  const demoEntries = useDemoEntries(limit, babyId)

  return isDemo ? demoEntries : realEntries
}

export const useContextualCreateEntry = () => {
  let isDemo = false
  try {
    const demoContext = useDemoContext()
    isDemo = demoContext.isDemo
  } catch {
    // Not in demo context
  }

  const realCreate = useCreateEntry()
  const demoCreate = useDemoCreateEntry()

  return isDemo ? demoCreate : realCreate
}

export const useContextualUpdateEntry = () => {
  let isDemo = false
  try {
    const demoContext = useDemoContext()
    isDemo = demoContext.isDemo
  } catch {
    // Not in demo context
  }

  const realUpdate = useUpdateEntry()
  const demoUpdate = useDemoUpdateEntry()

  return isDemo ? demoUpdate : realUpdate
}

export const useContextualDeleteEntry = () => {
  let isDemo = false
  try {
    const demoContext = useDemoContext()
    isDemo = demoContext.isDemo
  } catch {
    // Not in demo context
  }

  const realDelete = useDeleteEntry()
  const demoDelete = useDemoDeleteEntry()

  return isDemo ? demoDelete : realDelete
}
