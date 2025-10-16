import { useCallback } from 'react'
import { babyService } from '../services/babyService'
import { useAsyncOperation } from './useAsyncOperation'
import type { Baby } from '../types'

/**
 * Form data structure for baby operations
 */
export interface BabyFormData {
  /** Baby's name */
  name: string
  /** Baby's birth date in YYYY-MM-DD format */
  birthdate: string
  /** Whether this baby should be set as active (optional) */
  is_active?: boolean
}

/**
 * Return type for the useBabyOperations hook
 */
export interface UseBabyOperationsReturn {
  /** Create a new baby */
  createBaby: {
    execute: (babyData: BabyFormData) => Promise<Baby>
    loading: boolean
    error: string | null
  }

  /** Update an existing baby */
  updateBaby: {
    execute: (id: string, updates: Partial<BabyFormData>) => Promise<Baby>
    loading: boolean
    error: string | null
  }

  /** Delete a baby */
  deleteBaby: {
    execute: (id: string) => Promise<void>
    loading: boolean
    error: string | null
  }

  /** Set a baby as the active one */
  setActiveBaby: {
    execute: (id: string) => Promise<void>
    loading: boolean
    error: string | null
  }

  /** Load all babies for the current user */
  loadBabies: {
    execute: () => Promise<Baby[]>
    data: Baby[] | null
    loading: boolean
    error: string | null
  }

  /** Load the currently active baby */
  loadActiveBaby: {
    execute: () => Promise<Baby | null>
    data: Baby | null
    loading: boolean
    error: string | null
  }
}

/**
 * Custom hook that provides all baby-related CRUD operations
 *
 * Encapsulates all baby management functionality including:
 * - Creating new babies
 * - Updating existing baby information
 * - Deleting babies
 * - Setting active baby
 * - Loading babies and active baby data
 *
 * Each operation includes loading states and error handling through
 * the useAsyncOperation hook.
 *
 * @returns Object containing all baby operations with their states
 *
 * @example
 * ```tsx
 * const { createBaby, loadBabies } = useBabyOperations()
 *
 * // Create a new baby
 * const handleCreate = async () => {
 *   try {
 *     await createBaby.execute({
 *       name: 'Baby Name',
 *       birthdate: '2024-01-01'
 *     })
 *   } catch (error) {
 *     // Handle error
 *   }
 * }
 *
 * // Load all babies
 * useEffect(() => {
 *   loadBabies.execute()
 * }, [])
 * ```
 */
export function useBabyOperations(): UseBabyOperationsReturn {
  // Create baby operation
  const createBabyOperation = useAsyncOperation(
    useCallback(async (...args: unknown[]) => {
      const babyData = args[0] as BabyFormData
      return await babyService.createBaby({
        ...babyData,
        is_active: babyData.is_active ?? false,
      })
    }, [])
  )

  // Update baby operation
  const updateBabyOperation = useAsyncOperation(
    useCallback(async (...args: unknown[]) => {
      return await babyService.updateBaby(
        args[0] as string,
        args[1] as Partial<BabyFormData>
      )
    }, [])
  )

  // Delete baby operation
  const deleteBabyOperation = useAsyncOperation(
    useCallback(async (...args: unknown[]) => {
      return await babyService.deleteBaby(args[0] as string)
    }, [])
  )

  // Set active baby operation
  const setActiveBabyOperation = useAsyncOperation(
    useCallback(async (...args: unknown[]) => {
      return await babyService.setActiveBaby(args[0] as string)
    }, [])
  )

  // Load babies operation
  const loadBabiesOperation = useAsyncOperation(
    useCallback(async () => {
      return await babyService.getBabies()
    }, [])
  )

  // Load active baby operation
  const loadActiveBabyOperation = useAsyncOperation(
    useCallback(async () => {
      return await babyService.getActiveBaby()
    }, [])
  )

  return {
    createBaby: {
      execute: createBabyOperation.execute,
      loading: createBabyOperation.loading,
      error: createBabyOperation.error,
    },
    updateBaby: {
      execute: updateBabyOperation.execute,
      loading: updateBabyOperation.loading,
      error: updateBabyOperation.error,
    },
    deleteBaby: {
      execute: deleteBabyOperation.execute,
      loading: deleteBabyOperation.loading,
      error: deleteBabyOperation.error,
    },
    setActiveBaby: {
      execute: setActiveBabyOperation.execute,
      loading: setActiveBabyOperation.loading,
      error: setActiveBabyOperation.error,
    },
    loadBabies: {
      execute: loadBabiesOperation.execute,
      data: loadBabiesOperation.data,
      loading: loadBabiesOperation.loading,
      error: loadBabiesOperation.error,
    },
    loadActiveBaby: {
      execute: loadActiveBabyOperation.execute,
      data: loadActiveBabyOperation.data,
      loading: loadActiveBabyOperation.loading,
      error: loadActiveBabyOperation.error,
    },
  }
}
