import { useCallback } from 'react'
import { babyService } from '../services/babyService'
import { useAsyncOperation } from './useAsyncOperation'
import type { Baby } from '../types'

export interface BabyFormData {
  name: string
  birthdate: string
  is_active?: boolean
}

export interface UseBabyOperationsReturn {
  // Create operations
  createBaby: {
    execute: (babyData: BabyFormData) => Promise<Baby>
    loading: boolean
    error: string | null
  }

  // Update operations
  updateBaby: {
    execute: (id: string, updates: Partial<BabyFormData>) => Promise<Baby>
    loading: boolean
    error: string | null
  }

  // Delete operations
  deleteBaby: {
    execute: (id: string) => Promise<void>
    loading: boolean
    error: string | null
  }

  // Set active baby
  setActiveBaby: {
    execute: (id: string) => Promise<void>
    loading: boolean
    error: string | null
  }

  // Load operations
  loadBabies: {
    execute: () => Promise<Baby[]>
    data: Baby[] | null
    loading: boolean
    error: string | null
  }

  loadActiveBaby: {
    execute: () => Promise<Baby | null>
    data: Baby | null
    loading: boolean
    error: string | null
  }
}

export function useBabyOperations(): UseBabyOperationsReturn {
  // Create baby operation
  const createBabyOperation = useAsyncOperation(
    useCallback(async (babyData: BabyFormData) => {
      return await babyService.createBaby(babyData)
    }, [])
  )

  // Update baby operation
  const updateBabyOperation = useAsyncOperation(
    useCallback(async (id: string, updates: Partial<BabyFormData>) => {
      return await babyService.updateBaby(id, updates)
    }, [])
  )

  // Delete baby operation
  const deleteBabyOperation = useAsyncOperation(
    useCallback(async (id: string) => {
      return await babyService.deleteBaby(id)
    }, [])
  )

  // Set active baby operation
  const setActiveBabyOperation = useAsyncOperation(
    useCallback(async (id: string) => {
      return await babyService.setActiveBaby(id)
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
