import React, { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { UnifiedActionFooter } from './UnifiedActionFooter'
import { ActivityModal } from './ActivityModal'
import { GuidedTour } from './GuidedTour'
import { HeaderProvider } from '../contexts/HeaderContext'
import { ComponentErrorBoundary } from './ComponentErrorBoundary'
import { DemoProvider, useDemoContext } from '../contexts/DemoContext'
import { useTour } from '../contexts/TourContext'
import {
  useDemoEntries,
  useDemoUpdateEntry,
} from '../hooks/queries/useDemoQueries'
import { activityUtils } from '../utils/activityUtils'
import type { TrackerEntry } from '../types'

const DemoLayoutContent: React.FC = () => {
  const location = useLocation()
  const { isActive: isTourActive, endTour } = useTour()
  const { demoBabies } = useDemoContext()
  const [isManualEntryModalOpen, setIsManualEntryModalOpen] = useState(false)

  const activeBaby = demoBabies[0]
  const { data: entries = [] } = useDemoEntries(50, activeBaby?.id)
  const updateEntryMutation = useDemoUpdateEntry()

  const inProgressActivity =
    entries.find((entry) => activityUtils.isInProgress(entry)) || null

  const handleStopActivity = async (entry: TrackerEntry) => {
    try {
      const now = new Date().toISOString()
      await updateEntryMutation.mutateAsync({
        id: entry.id,
        updates: { end_time: now },
      })
    } catch (error) {
      console.error('Demo mode: Error stopping activity', error)
    }
  }

  // Handle tour state across route changes
  React.useEffect(() => {
    if (isTourActive && location.pathname === '/demo/settings') {
      endTour()
    }
  }, [location.pathname, isTourActive, endTour])

  return (
    <ComponentErrorBoundary componentName='DemoLayout'>
      <HeaderProvider>
        <div className='flex min-h-screen flex-col'>
          {/* Demo banner */}
          <div className='bg-amber-500 px-4 py-2 text-center text-sm font-medium text-white'>
            Demo Mode - This is a preview with sample data
          </div>

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
                setIsManualEntryModalOpen(false)
              }}
              onError={(error) => {
                console.error('Demo mode: Manual entry error:', error)
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

export const DemoLayout: React.FC = () => {
  return (
    <DemoProvider>
      <DemoLayoutContent />
    </DemoProvider>
  )
}
