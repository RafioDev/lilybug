import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { profileService } from '../../services/profileService'
import { queryKeys } from '../../lib/queryKeys'
import type { Profile } from '../../types'

export const useUserProfile = () => {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: async () => {
      // Get user from session first (cached by Supabase)
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const user = session?.user

      if (!user) {
        throw new Error('No authenticated user')
      }

      const profile = await profileService.getProfile()
      const userEmail = user.email || ''

      const displayName =
        profile?.parent1_name || (userEmail ? userEmail.split('@')[0] : 'User')
      return {
        profile,
        userEmail,
        displayName,
      }
    },
    enabled: true,
    retry: (failureCount, error) => {
      // Retry if it's an auth error (session not ready yet)
      if (error?.message === 'No authenticated user' && failureCount < 3) {
        return true
      }
      return false
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
    // Cache for longer since profile data doesn't change often
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export const useCreateOrUpdateProfile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (profile: Partial<Profile>) =>
      profileService.createOrUpdateProfile(profile),
    onSuccess: () => {
      // Invalidate and refetch profile data
      queryClient.invalidateQueries({ queryKey: queryKeys.profile })
    },
  })
}

export const useUpdateProfile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (updates: Partial<Profile>) =>
      profileService.updateProfile(updates),
    onSuccess: () => {
      // Invalidate and refetch profile data
      queryClient.invalidateQueries({ queryKey: queryKeys.profile })
    },
  })
}
