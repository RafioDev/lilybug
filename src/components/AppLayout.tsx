import React, { useState, useEffect } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { migrateBabyData } from '../utils/migrateBabyData'

import { Sidebar } from './Sidebar'
import { MobileHeader } from './MobileHeader'
import { Header } from './Header'
import { UnifiedActionFooter } from './UnifiedActionFooter'
import { NewActivityModal } from './NewActivityModal'
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

  const userProfileForProps = {
    profile: profileData.profile,
    userEmail: profileData.userEmail,
    displayName: profileData.displayName,
    loading: false,
  }

  return (
    <ComponentErrorBoundary
      componentName='AppLayout'
      contextData={{ userId: user?.id }}
    >
      <HeaderProvider>
        <div className='min-h-screen lg:flex'>
          <ComponentErrorBoundary componentName='Sidebar'>
            <Sidebar userProfile={userProfileForProps} />
          </ComponentErrorBoundary>
          <div className='flex-1 lg:ml-64'>
            {/* Desktop: Create a scrollable container for sticky header */}
            <div className='hidden h-screen overflow-y-auto lg:block'>
              <ComponentErrorBoundary componentName='Header'>
                <Header />
              </ComponentErrorBoundary>
              <Outlet />
            </div>
            {/* Mobile: Create a scrollable container for sticky header */}
            <div className='h-screen overflow-y-auto lg:hidden'>
              <ComponentErrorBoundary componentName='MobileHeader'>
                <MobileHeader userProfile={userProfileForProps} />
              </ComponentErrorBoundary>
              <Outlet />
            </div>
          </div>

          <ComponentErrorBoundary componentName='UnifiedActionFooter'>
            <UnifiedActionFooter
              onManualEntry={() => setIsManualEntryModalOpen(true)}
            />
          </ComponentErrorBoundary>
        </div>

        {/* Global Manual Entry Modal */}
        {activeBaby && (
          <ComponentErrorBoundary componentName='NewActivityModal'>
            <NewActivityModal
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
