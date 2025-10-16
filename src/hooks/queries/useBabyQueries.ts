import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { babyService } from '../../services/babyService'
import { queryKeys } from '../../lib/queryKeys'
import type { Baby } from '../../types'

export const useBabies = () => {
  return useQuery({
    queryKey: queryKeys.babies,
    queryFn: () => babyService.getBabies(),
    staleTime: 5 * 60 * 1000, // 5 minutes - babies don't change often
  })
}

export const useActiveBaby = () => {
  return useQuery({
    queryKey: queryKeys.activeBaby,
    queryFn: () => babyService.getActiveBaby(),
    staleTime: 5 * 60 * 1000, // 5 minutes - active baby doesn't change often
  })
}

export const useCreateBaby = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (
      baby: Omit<Baby, 'id' | 'user_id' | 'created_at' | 'updated_at'>
    ) => babyService.createBaby(baby),
    onSuccess: () => {
      // Invalidate babies and active baby queries
      queryClient.invalidateQueries({ queryKey: queryKeys.babies })
      queryClient.invalidateQueries({ queryKey: queryKeys.activeBaby })
    },
  })
}

export const useUpdateBaby = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Baby> }) =>
      babyService.updateBaby(id, updates),
    onSuccess: (updatedBaby) => {
      // Update the baby in the cache
      queryClient.setQueryData(queryKeys.baby(updatedBaby.id), updatedBaby)
      // Invalidate babies list
      queryClient.invalidateQueries({ queryKey: queryKeys.babies })
      // If this baby is active, invalidate active baby query
      if (updatedBaby.is_active) {
        queryClient.invalidateQueries({ queryKey: queryKeys.activeBaby })
      }
    },
  })
}

export const useSetActiveBaby = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => babyService.setActiveBaby(id),
    onSuccess: () => {
      // Invalidate both babies and active baby queries
      queryClient.invalidateQueries({ queryKey: queryKeys.babies })
      queryClient.invalidateQueries({ queryKey: queryKeys.activeBaby })
    },
  })
}

export const useDeleteBaby = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => babyService.deleteBaby(id),
    onSuccess: () => {
      // Invalidate babies and active baby queries
      queryClient.invalidateQueries({ queryKey: queryKeys.babies })
      queryClient.invalidateQueries({ queryKey: queryKeys.activeBaby })
    },
  })
}
