import React, { useState, useEffect } from 'react'
import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { migrateBabyData } from '../utils/migrateBabyData'
import { clearAuthStorage } from '../utils/authUtils'

import { Header } from './Header'
import { UnifiedActionFooter } from './UnifiedActionFooter'
import { ActivityModal } from './ActivityModal'
import { GuidedTour } from './GuidedTour'
import { AppLoadingScreen } from './AppLoadingScreen'
import { HeaderProvider } from '../contexts/HeaderContext'
import { ComponentErrorBoundary } from './ComponentErrorBoundary'
import { useTour } from '../contexts/TourContext'
import { useUserProfile } from '../hooks/queries/useProfileQueries'
import { useActiveBaby } from '../hooks/queries/useBabyQueries'
import { useEntries, useUpdateEntry } from '../hooks/queries/useTrackerQueries'
import { activityUtils } from '../utils/activityUtils'
import { reportError } from '../utils/errorHandler'
import type { User } from '@supabase/supabase-js'
import type { TrackerEntry } from '../types'

export const AppLayout: React.FC = () => {
  const location = useLocation()
  const { isActive: isTourActive, endTour } = useTour()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isManualEntryModalOpen, setIsManualEntryModalOpen] = useState(false)

  // Use React Query for profile data
  const {
    data: profileData,
    isLoading: profileLoading,
    error: profileError,
    isSuccess: profileSuccess,
  } = useUserProfile()
  const { data: activeBaby } = useActiveBaby()
  const { data: entries = [] } = useEntries(50, activeBaby?.id) // Get recent entries to check for in-progress activities
  const updateEntryMutation = useUpdateEntry()

  // Find any in-progress activity
  const inProgressActivity =
    entries.find((entry) => activityUtils.isInProgress(entry)) || null

  // Handle stopping an activity
  const handleStopActivity = async (entry: TrackerEntry) => {
    try {
      const now = new Date().toISOString()
      await updateEntryMutation.mutateAsync({
        id: entry.id,
        updates: { end_time: now },
      })
    } catch (error) {
      console.error('Error stopping activity:', error)
      reportError(error instanceof Error ? error : new Error(String(error)), {
        context: 'stopActivity',
        entryId: entry.id,
      })
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Handle different auth events
      if (event === 'SIGNED_OUT') {
        setUser(null)
        // Clear any cached data on sign out
        clearAuthStorage()
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setUser(session?.user ?? null)
      }
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

  // Handle tour state across route changes
  useEffect(() => {
    // If tour is active and user navigates to settings page, end the tour
    // This prevents tour from showing on wrong pages, but allows it on main activities page
    if (isTourActive && location.pathname === '/settings') {
      endTour()
    }
  }, [location.pathname, isTourActive, endTour])

  if (loading || profileLoading) {
    const loadingMessage = loading
      ? 'Authenticating...'
      : 'Loading your profile...'
    return <AppLoadingScreen message={loadingMessage} />
  }

  if (!user) {
    return <Navigate to='/auth' replace />
  }

  if (!profileData?.profile) {
    if (profileError) {
      console.error('Profile loading error:', profileError)
      // If there's an error, stay in loading to avoid redirect loop
      return <AppLoadingScreen message='Checking your profile...' />
    }

    // Only redirect to onboarding if we successfully loaded data but profile is null
    if (profileSuccess && profileData && !profileData.profile) {
      return <Navigate to='/onboarding' replace />
    }

    // Still loading or no data yet
    return <AppLoadingScreen message='Loading your profile...' />
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
              onStopActivity={handleStopActivity}
              inProgressActivity={inProgressActivity}
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

        {/* Guided Tour Component */}
        <ComponentErrorBoundary componentName='GuidedTour'>
          <GuidedTour />
        </ComponentErrorBoundary>
      </HeaderProvider>
    </ComponentErrorBoundary>
  )
}
