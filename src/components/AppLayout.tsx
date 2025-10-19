import React, { useState, useEffect } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { migrateBabyData } from '../utils/migrateBabyData'
import { NavBar } from './NavBar'
import { Sidebar } from './Sidebar'
import { MobileHeader } from './MobileHeader'
import { BabyHeader } from './BabyHeader'
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
      <div className='flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'>
        <div className='text-center'>
          <div className='animate-pulse space-y-4'>
            <div className='mx-auto h-16 w-16 rounded-full bg-blue-200 dark:bg-blue-800'></div>
            <p className='text-gray-500 dark:text-gray-400'>Loading...</p>
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
        {/* Desktop Baby Header - positioned at top of main content area */}
        <div className='hidden lg:block'>
          <BabyHeader variant='desktop' className='mx-4 mt-4 lg:mx-8' />
        </div>
        <Outlet />
      </div>
      <NavBar />
      <FloatingAIAssistant />
    </div>
  )
}
