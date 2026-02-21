import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Clock, BarChart3, Activity } from 'lucide-react'
import { Layout } from '../components/Layout'
import { Card } from '../components/Card'
import {
  Tabs,
  AnimatedTabsList,
  AnimatedTabsTrigger,
  TabsContent,
} from '../components/ui/tabs'

import { SectionErrorBoundary } from '../components/SectionErrorBoundary'
import { useDemoContext } from '../contexts/DemoContext'
import {
  useDemoActiveBaby,
  useDemoEntries,
  useDemoUpdateEntry,
  useDemoDeleteEntry,
} from '../hooks/queries/useDemoQueries'
import { GroupedActivitiesList } from '../components/GroupedActivitiesList'
import { AIInsights } from '../components/AIInsights'
import { ActivityModal } from '../components/ActivityModal'
import { ConfirmationModal } from '../components/ConfirmationModal'
import { aiPatternService } from '../services/aiPatternService'
import { aiAssistantService } from '../services/aiAssistantService'
import type { TrackerEntry } from '../types'
import type { PatternInsights } from '../services/aiPatternService'
import type { ContextualGuidance } from '../services/aiAssistantService'

type TabType = 'activities' | 'insights'

export const DemoActivities: React.FC = () => {
  const { isDemo } = useDemoContext()
  const [searchParams, setSearchParams] = useSearchParams()

  const activeTab: TabType = (() => {
    const tabParam = searchParams.get('tab') as TabType
    return tabParam && ['activities', 'insights'].includes(tabParam)
      ? tabParam
      : 'activities'
  })()

  const { data: activeBaby } = useDemoActiveBaby()
  const { data: entries = [] } = useDemoEntries(100, activeBaby?.id)
  const updateEntryMutation = useDemoUpdateEntry()
  const deleteEntryMutation = useDemoDeleteEntry()

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<TrackerEntry | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [entryToDelete, setEntryToDelete] = useState<TrackerEntry | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [aiInsights, setAiInsights] = React.useState<PatternInsights | null>(
    null
  )
  const [contextualGuidance, setContextualGuidance] = React.useState<
    ContextualGuidance[]
  >([])
  const [nextActivityPrediction, setNextActivityPrediction] = React.useState<{
    activity: 'feeding' | 'sleep' | 'diaper'
    estimatedTime: Date
    confidence: number
  } | null>(null)

  // Calculate today's stats
  const todayStats = React.useMemo(() => {
    if (entries.length === 0) {
      return { feedings: 0, sleepHours: 0, diapers: 0 }
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayEntries = entries.filter(
      (entry) => new Date(entry.start_time) >= today
    )

    return {
      feedings: todayEntries.filter((e) => e.entry_type === 'feeding').length,
      sleepHours: todayEntries
        .filter((e) => e.entry_type === 'sleep' && e.end_time)
        .reduce((total, entry) => {
          const start = new Date(entry.start_time)
          const end = new Date(entry.end_time!)
          return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60)
        }, 0),
      diapers: todayEntries.filter((e) => e.entry_type === 'diaper').length,
    }
  }, [entries])

  // Load insights
  React.useEffect(() => {
    if (!activeBaby || entries.length === 0) return

    try {
      const insights = aiPatternService.generateInsights(entries, [])
      setAiInsights(insights)

      const guidance = aiAssistantService.generateContextualGuidance(
        entries,
        activeBaby
      )
      setContextualGuidance(guidance)

      const prediction = aiAssistantService.predictNextActivity(entries)
      setNextActivityPrediction(prediction)
    } catch (error) {
      console.error('Error loading insights:', error)
    }
  }, [activeBaby, entries])

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value })
  }

  const handleEditEntry = (entry: TrackerEntry) => {
    setSelectedEntry(entry)
    setIsEditModalOpen(true)
  }

  const handleDeleteEntry = (entry: TrackerEntry) => {
    setEntryToDelete(entry)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!entryToDelete) return

    setIsDeleting(true)
    try {
      await deleteEntryMutation.mutateAsync(entryToDelete.id)
      setIsDeleteModalOpen(false)
      setEntryToDelete(null)
    } catch (error) {
      console.error('Demo mode: Error deleting entry', error)
    } finally {
      setIsDeleting(false)
    }
  }

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

  const handleEditSave = () => {
    setIsEditModalOpen(false)
    setSelectedEntry(null)
  }

  const handleEditError = (error: string) => {
    console.error('Demo mode: Edit error:', error)
  }

  if (!isDemo) {
    return <div>Not in demo mode</div>
  }

  return (
    <Layout>
      <div className='mx-auto max-w-4xl space-y-3 pb-20'>
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className='w-full'
        >
          <AnimatedTabsList variant='underline' className='w-full'>
            <AnimatedTabsTrigger
              variant='underline'
              value='activities'
              className='flex items-center gap-2'
            >
              <Activity className='h-4 w-4' />
              Activities
            </AnimatedTabsTrigger>
            <AnimatedTabsTrigger
              variant='underline'
              value='insights'
              className='flex items-center gap-2'
            >
              <BarChart3 className='h-4 w-4' />
              Insights
            </AnimatedTabsTrigger>
          </AnimatedTabsList>

          <TabsContent value='activities'>
            <div className='space-y-3'>
              <SectionErrorBoundary
                sectionName='Activities List'
                contextData={{ babyId: activeBaby?.id }}
              >
                <Card className='p-3'>
                  <div className='mb-3 flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <Clock className='h-4 w-4 text-gray-600 dark:text-gray-400' />
                      <h3 className='text-sm font-semibold text-gray-800 dark:text-gray-200'>
                        Recent Activities
                      </h3>
                    </div>
                  </div>

                  <GroupedActivitiesList
                    entries={entries}
                    onEditEntry={handleEditEntry}
                    onDeleteEntry={handleDeleteEntry}
                    onStopActivity={handleStopActivity}
                    isLoading={false}
                    virtualScrolling={true}
                    maxInitialGroups={5}
                    className='max-h-[60vh] overflow-y-auto'
                  />
                </Card>
              </SectionErrorBoundary>
            </div>
          </TabsContent>

          <TabsContent value='insights'>
            <div className='space-y-6'>
              <SectionErrorBoundary
                sectionName="Today's Stats"
                contextData={{ babyId: activeBaby?.id }}
              >
                <Card className='p-2'>
                  <div className='grid grid-cols-3 gap-2'>
                    <div className='group min-h-[44px] rounded-lg p-2 text-center'>
                      <div className='text-lg font-bold text-blue-600 sm:text-xl'>
                        {todayStats.feedings}
                      </div>
                      <div className='text-xs font-medium text-gray-600 dark:text-gray-300'>
                        Feedings
                      </div>
                    </div>

                    <div className='group min-h-[44px] rounded-lg p-2 text-center'>
                      <div className='text-lg font-bold text-cyan-600 sm:text-xl'>
                        {`${todayStats.sleepHours.toFixed(1)}h`}
                      </div>
                      <div className='text-xs font-medium text-gray-600 dark:text-gray-300'>
                        Sleep
                      </div>
                    </div>

                    <div className='group min-h-[44px] rounded-lg p-2 text-center'>
                      <div className='text-lg font-bold text-emerald-600 sm:text-xl'>
                        {todayStats.diapers}
                      </div>
                      <div className='text-xs font-medium text-gray-600 dark:text-gray-300'>
                        Diapers
                      </div>
                    </div>
                  </div>
                </Card>
              </SectionErrorBoundary>

              {aiInsights && (
                <SectionErrorBoundary
                  sectionName='AI Insights'
                  contextData={{ babyId: activeBaby?.id }}
                >
                  <Card className='lg:p-8'>
                    <AIInsights
                      insights={aiInsights}
                      contextualGuidance={contextualGuidance}
                      nextActivityPrediction={nextActivityPrediction}
                    />
                  </Card>
                </SectionErrorBoundary>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Activity Modal */}
      {activeBaby && (
        <ActivityModal
          isOpen={isEditModalOpen}
          entry={selectedEntry}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedEntry(null)
          }}
          onSave={handleEditSave}
          onError={handleEditError}
          babyId={activeBaby.id}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setEntryToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        title='Delete Activity'
        message={`Are you sure you want to delete this ${entryToDelete?.entry_type}? This is demo mode, so it will only be removed from the current session.`}
        confirmText='Delete'
        cancelText='Cancel'
        isLoading={isDeleting}
        variant='danger'
      />
    </Layout>
  )
}
