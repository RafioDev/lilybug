import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { profileService } from '../services/profileService'
import type { Profile } from '../types'

export const useUserProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [userEmail, setUserEmail] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUserData()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadUserData()
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadUserData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setUserEmail(user.email || '')
        const profileData = await profileService.getProfile()
        setProfile(profileData)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getUserDisplayName = (): string => {
    if (profile?.parent1_name) {
      return profile.parent1_name
    }
    if (userEmail) {
      // Extract name from email (before @)
      return userEmail.split('@')[0]
    }
    return 'User'
  }

  return {
    profile,
    userEmail,
    displayName: getUserDisplayName(),
    loading,
  }
}
