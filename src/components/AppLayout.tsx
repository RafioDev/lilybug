import React, { useState, useEffect } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { profileService } from '../services/profileService'
import { migrateBabyData } from '../utils/migrateBabyData'
import { NavBar } from './NavBar'
import { Sidebar } from './Sidebar'
import { MobileHeader } from './MobileHeader'
import { FloatingAIAssistant } from './FloatingAIAssistant'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '../types'

export const AppLayout: React.FC = () => {
  const [user, setUser] = useState<User | null>(null)
  const [hasProfile, setHasProfile] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [userEmail, setUserEmail] = useState<string>('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        checkProfile()
      } else {
        setLoading(false)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        checkProfile()
      } else {
        setHasProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkProfile = async () => {
    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()

      if (currentUser) {
        setUserEmail(currentUser.email || '')
        const profileData = await profileService.getProfile()
        setProfile(profileData)
        setHasProfile(!!profileData)

        // Run baby data migration if needed
        if (profileData) {
          await migrateBabyData.runMigrationIfNeeded()
        }
      }
    } catch (error) {
      console.error('Error checking profile:', error)
      setHasProfile(false)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-pulse space-y-4'>
            <div className='w-16 h-16 bg-blue-200 rounded-full mx-auto'></div>
            <p className='text-gray-500'>Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to='/auth' replace />
  }

  if (hasProfile === false) {
    return <Navigate to='/onboarding' replace />
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

  const userProfileData = {
    profile,
    userEmail,
    displayName: getUserDisplayName(),
    loading: false, // AppLayout loading is handled separately
  }

  return (
    <div className='min-h-screen lg:flex'>
      <Sidebar userProfile={userProfileData} />
      <div className='flex-1 lg:ml-64'>
        <MobileHeader userProfile={userProfileData} />
        <Outlet />
      </div>
      <NavBar />
      <FloatingAIAssistant />
    </div>
  )
}
