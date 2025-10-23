import React, { useState, useEffect } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { migrateBabyData } from '../utils/migrateBabyData'

import { Header } from './Header'
import { UnifiedActionFooter } from './UnifiedActionFooter'
import { ActivityModal } from './ActivityModal'
import { HeaderProvider } from '../contexts/HeaderContext'
import { ComponentErrorBoundary } from './ComponentErrorBoundary'
import { useUserProfile } from '../hooks/queries/useProfileQueries'
import { useActiveBaby } from '../hooks/queries/useBabyQueries'
import type { User } from '@supabase/supabase-js'

export const AppLayout: React.FC = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isManualEntryModalOpen, setIsManualEntryModalOpen] = useState(false)

  // Use React Query for profile data
  const { data: profileData, isLoading: profileLoading } = useUserProfile()
  const { data: activeBaby } = useActiveBaby()

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

  return (
    <ComponentErrorBoundary
      componentName='AppLayout'
      contextData={{ userId: user?.id }}
    >
      <HeaderProvider>
        <div className='flex min-h-screen flex-col'>
          {/* Unified Header for both desktop and mobile */}
          <ComponentErrorBoundary componentName='Header'>
            <Header />
          </ComponentErrorBoundary>

          {/* Main content area */}
          <div className='flex-1 overflow-y-auto'>
            <Outlet />
          </div>

          <ComponentErrorBoundary componentName='UnifiedActionFooter'>
            <UnifiedActionFooter
              onManualEntry={() => setIsManualEntryModalOpen(true)}
            />
          </ComponentErrorBoundary>
        </div>

        {/* Global Manual Entry Modal */}
        {activeBaby && (
          <ComponentErrorBoundary componentName='ActivityModal'>
            <ActivityModal
              isOpen={isManualEntryModalOpen}
              onClose={() => setIsManualEntryModalOpen(false)}
              onSave={() => {
                // Entry created successfully - modal will close automatically
              }}
              onError={(error) => {
                console.error('Manual entry error:', error)
                // Could add toast notification here in the future
              }}
              babyId={activeBaby.id}
            />
          </ComponentErrorBoundary>
        )}
      </HeaderProvider>
    </ComponentErrorBoundary>
  )
}
