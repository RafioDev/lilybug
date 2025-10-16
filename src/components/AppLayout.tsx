import React, { useState, useEffect } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { migrateBabyData } from '../utils/migrateBabyData'
import { NavBar } from './NavBar'
import { Sidebar } from './Sidebar'
import { MobileHeader } from './MobileHeader'
import { FloatingAIAssistant } from './FloatingAIAssistant'
import { useUserProfile } from '../hooks/queries/useProfileQueries'
import type { User } from '@supabase/supabase-js'

export const AppLayout: React.FC = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Use React Query for profile data
  const { data: profileData, isLoading: profileLoading } = useUserProfile()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Run migration when profile is available
  useEffect(() => {
    if (profileData?.profile) {
      migrateBabyData.runMigrationIfNeeded().catch(console.error)
    }
  }, [profileData?.profile])

  if (loading || profileLoading) {
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

  if (!profileData?.profile) {
    return <Navigate to='/onboarding' replace />
  }

  const userProfileForProps = {
    profile: profileData.profile,
    userEmail: profileData.userEmail,
    displayName: profileData.displayName,
    loading: false,
  }

  return (
    <div className='min-h-screen lg:flex'>
      <Sidebar userProfile={userProfileForProps} />
      <div className='flex-1 lg:ml-64'>
        <MobileHeader userProfile={userProfileForProps} />
        <Outlet />
      </div>
      <NavBar />
      <FloatingAIAssistant />
    </div>
  )
}
