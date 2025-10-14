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

export const AppLayout: React.FC = () => {
  const [user, setUser] = useState<User | null>(null)
  const [hasProfile, setHasProfile] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

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
      const profile = await profileService.getProfile()
      setHasProfile(!!profile)

      // Run baby data migration if needed
      if (profile) {
        await migrateBabyData.runMigrationIfNeeded()
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

  return (
    <div className='min-h-screen lg:flex'>
      <Sidebar />
      <div className='flex-1 lg:ml-64'>
        <MobileHeader />
        <Outlet />
      </div>
      <NavBar />
      <FloatingAIAssistant />
    </div>
  )
}
