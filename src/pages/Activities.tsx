import React, { useState, Suspense } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Clock, BarChart3, Activity } from 'lucide-react'
import { Layout } from '../components/Layout'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import {
  Tabs,
  AnimatedTabsList,
  AnimatedTabsTrigger,
  TabsContent,
} from '../components/ui/tabs'

import { AppErrorBoundary } from '../components/AppErrorBoundary'
import { PageErrorBoundary } from '../components/PageErrorBoundary'
import { SectionErrorBoundary } from '../components/SectionErrorBoundary'

import { useActiveBaby } from '../hooks/queries/useBabyQueries'
import {
  useEntries,
  useCreateEntry,
  useDeleteEntry,
  useUpdateEntry,
} from '../hooks/queries/useTrackerQueries'
import { useInProgressActivityManager } from '../components/InProgressActivityManager'
import { activityUtils } from '../utils/activityUtils'
import { dateUtils } from '../utils/dateUtils'
import { Modal } from '../components/Modal'
import { ActivityModal } from '../components/LazyModals'
import { GroupedActivitiesList } from '../components/GroupedActivitiesList'

import { ConfirmationModal } from '../components/ConfirmationModal'
import { useConfirmationModal } from '../hooks/useConfirmationModal'
import { reportError } from '../utils/errorHandler'
import type { TrackerEntry, EntryType, FeedingType, DiaperType } from '../types'

// Import insights functionality
import { AIInsights } from '../components/AIInsights'
import { trackerService } from '../services/trackerService'
import { aiPatternService } from '../services/aiPatternService'
import { aiAssistantService } from '../services/aiAssistantService'
import type { Baby } from '../types'
import type { PatternInsights } from '../services/aiPatternService'
import type { ContextualGuidance } from '../services/aiAssistantService'

// Voice functionality types and interfaces are now handled by UnifiedActionFooter

// Insights Tab Component
const InsightsTab: React.FC<{ activeBaby: Baby | null }> = ({ activeBaby }) => {
  const [aiInsights, setAiInsights] = useState<PatternInsights | null>(null)
  const [contextualGuidance, setContextualGuidance] = useState<
    ContextualGuidance[]
  >([])
  const [nextActivityPrediction, setNextActivityPrediction] = useState<{
    activity: 'feeding' | 'sleep' | 'diaper'
    estimatedTime: Date
    confidence: number
  } | null>(null)
  const [loading, setLoading] = useState(true)

  React.useEffect(() => {
    const loadInsightsData = async () => {
      if (!activeBaby) {
        setLoading(false)
        return
      }

      try {
        // Load tracker data for AI analysis
        const entries = await trackerService.getEntries(100, activeBaby.id)

        // Generate AI insights
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
      } finally {
        setLoading(false)
      }
    }

    loadInsightsData()
  }, [activeBaby])

  if (loading) {
    return (
      <div className='space-y-6'>
        <Card>
          <p className='text-center text-gray-500 dark:text-gray-400'>
            Loading insights...
          </p>
        </Card>
      </div>
    )
  }

  if (!activeBaby) {
    return (
      <div className='space-y-6'>
        <Card>
          <p className='text-center text-gray-500'>
            Please add a baby first to see insights.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* AI Insights Section */}
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
  )
}

// Activities Tab Component
const ActivitiesTab: React.FC<{
  activeBaby: Baby | null
  entries: TrackerEntry[]
  entriesLoading: boolean
  onEditEntry: (entry: TrackerEntry) => void
  onDeleteEntry: (entry: TrackerEntry) => void
  onStopActivity: (entry: TrackerEntry) => void
}> = ({
  activeBaby,
  entries,
  entriesLoading,
  onEditEntry,
  onDeleteEntry,
  onStopActivity,
}) => {
  return (
    <div className='space-y-3'>
      {/* Activities List - Maximized Height */}
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
            entries={entries} // Show all entries with lazy loading
            onEditEntry={onEditEntry}
            onDeleteEntry={onDeleteEntry}
            onStopActivity={onStopActivity}
            isLoading={entriesLoading}
            virtualScrolling={true} // Enable performance optimizations
            maxInitialGroups={5} // Show more days initially for better mobile experience
            className='max-h-[60vh] overflow-y-auto' // Scrollable activities list
          />
        </Card>
      </SectionErrorBoundary>
    </div>
  )
}

type TabType = 'activities' | 'insights'

const ActivitiesContent: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  // Derive active tab from URL parameters instead of storing in state
  const activeTab: TabType = (() => {
    const tabParam = searchParams.get('tab') as TabType
    return tabParam && ['activities', 'insights'].includes(tabParam)
      ? tabParam
      : 'activities'
  })()

  // Voice interface state removed - now handled by UnifiedActionFooter system
  // Use React Query for data
  const { data: activeBaby, isLoading: babyLoading } = useActiveBaby()
  const { data: entries = [], isLoading: entriesLoading } = useEntries(
    100,
    activeBaby?.id
  )

  const createEntryMutation = useCreateEntry()
  const deleteEntryMutation = useDeleteEntry()
  const updateEntryMutation = useUpdateEntry()

  // In-progress activity management (for future use)
  useInProgressActivityManager(activeBaby?.id || '')

  const isLoading = babyLoading || entriesLoading

  // Confirmation modal for deletions
  const confirmationModal = useConfirmationModal()

  // Activities state
  const [isManualEntryModalOpen, setIsManualEntryModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<TrackerEntry | null>(null)

  const [formData, setFormData] = useState({
    entryType: 'feeding' as EntryType,
    startTime: dateUtils.getCurrentLocalDateTime(),
    endTime: '',
    quantity: '',
    feedingType: 'bottle' as FeedingType,
    diaperType: 'wet' as DiaperType,
    notes: '',
  })

  // Voice-related refs are now handled by UnifiedActionFooter

  // Stats are now calculated using useMemo above

  // Voice functionality is now handled by UnifiedActionFooter component

  // Voice functionality and speech recognition is now handled by UnifiedActionFooter

  // Activities functions
  const deleteEntry = async (id: string) => {
    try {
      await deleteEntryMutation.mutateAsync(id)
    } catch (error) {
      console.error('Error deleting entry:', error)
      reportError(error instanceof Error ? error : new Error(String(error)), {
        context: 'deleteEntry',
        entryId: id,
      })
    }
  }

  const handleDeleteEntry = (entry: TrackerEntry) => {
    const activityType = entry.entry_type

    confirmationModal.open({
      title: 'Delete Activity',
      message: `Are you sure you want to delete this ${activityType}? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
      onConfirm: async () => {
        await deleteEntry(entry.id)
      },
    })
  }

  const openEditModal = (entry: TrackerEntry) => {
    setSelectedEntry(entry)
    setIsEditModalOpen(true)
  }

  const handleEditSave = async () => {
    // React Query will automatically update the cache
    setIsEditModalOpen(false)
  }

  const handleEditError = (error: string) => {
    console.error('Edit error:', error)
    // You could add a toast notification here
  }

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

  const handleManualSubmit = async () => {
    if (!activeBaby) {
      console.error('No active baby selected')
      return
    }

    // Prepare entry object outside try block so it's accessible in catch
    const entry = {
      entry_type: formData.entryType,
      start_time: dateUtils.fromLocalDateTimeString(formData.startTime),
      end_time: formData.endTime
        ? dateUtils.fromLocalDateTimeString(formData.endTime)
        : null,
      quantity: formData.quantity ? parseFloat(formData.quantity) : null,
      feeding_type:
        formData.entryType === 'feeding' ? formData.feedingType : null,
      diaper_type: formData.entryType === 'diaper' ? formData.diaperType : null,
      notes: formData.notes || null,
      baby_id: activeBaby.id,
    }

    try {
      await createEntryMutation.mutateAsync(entry)
      setIsManualEntryModalOpen(false)
    } catch (error) {
      console.error('Error creating manual entry:', error)
      reportError(error instanceof Error ? error : new Error(String(error)), {
        context: 'createManualEntry',
        entryData: entry,
      })
    }
  }

  const getFeedingTypeLabel = (type: FeedingType) => {
    switch (type) {
      case 'breast_left':
        return 'Left Breast'
      case 'breast_right':
        return 'Right Breast'
      case 'bottle':
        return 'Bottle'
    }
  }

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value })
  }

  // Show loading state while data is being fetched
  if (isLoading) {
    return (
      <Layout>
        <div className='mx-auto max-w-4xl space-y-3 pb-20'>
          {/* Loading Activities */}
          <Card className='p-3'>
            <div className='mb-3 flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Clock className='h-4 w-4 text-gray-400 dark:text-gray-500' />
                <div className='h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
              </div>
            </div>
            <div className='space-y-2'>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className='flex items-center gap-2 rounded-lg bg-gray-50 p-2 dark:bg-gray-700'
                >
                  <div className='h-6 w-6 animate-pulse rounded bg-gray-200 dark:bg-gray-600'></div>
                  <div className='flex-1'>
                    <div className='mb-1 h-3 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-600'></div>
                    <div className='h-2 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-600'></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className='mx-auto max-w-4xl space-y-3 pb-20'>
        {/* ShadCN Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className='w-full'
        >
          <AnimatedTabsList
            variant='default'
            className='grid w-full grid-cols-2'
          >
            <AnimatedTabsTrigger
              variant='default'
              value='activities'
              className='flex items-center gap-2'
            >
              <Activity className='h-4 w-4' />
              Activities
            </AnimatedTabsTrigger>
            <AnimatedTabsTrigger
              variant='default'
              value='insights'
              className='flex items-center gap-2'
            >
              <BarChart3 className='h-4 w-4' />
              Insights
            </AnimatedTabsTrigger>
          </AnimatedTabsList>

          <TabsContent value='activities'>
            <ActivitiesTab
              activeBaby={activeBaby || null}
              entries={entries}
              entriesLoading={entriesLoading}
              onEditEntry={openEditModal}
              onDeleteEntry={handleDeleteEntry}
              onStopActivity={handleStopActivity}
            />
          </TabsContent>

          <TabsContent value='insights'>
            <InsightsTab activeBaby={activeBaby || null} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Manual Entry Modal */}
      <Modal
        isOpen={isManualEntryModalOpen}
        onClose={() => setIsManualEntryModalOpen(false)}
        title='Manual Entry'
      >
        <div className='space-y-4'>
          <div className='rounded-lg bg-blue-50 p-3 dark:bg-blue-900/30'>
            <p className='text-sm text-blue-800 dark:text-blue-200'>
              💡 <strong>Tip:</strong> For faster tracking, try using the voice
              assistant above! Just say "Log a bottle feeding of 4 ounces" or
              similar.
            </p>
          </div>

          {/* Smart Defaults Indicator */}
          <div className='rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/30'>
            <p className='text-sm text-emerald-800 dark:text-emerald-200'>
              ✨ <strong>Smart defaults applied!</strong> Values are pre-filled
              based on your recent patterns and time of day. Feel free to adjust
              as needed.
            </p>
          </div>

          {/* Entry Type Selection */}
          <div>
            <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
              Activity Type
            </label>
            <div className='grid grid-cols-2 gap-2'>
              {(['feeding', 'sleep', 'diaper', 'pumping'] as EntryType[]).map(
                (type) => (
                  <button
                    key={type}
                    onClick={() =>
                      setFormData({ ...formData, entryType: type })
                    }
                    className={`rounded-xl border-2 p-3 capitalize transition-all ${
                      formData.entryType === type
                        ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    {activityUtils.getActivityIcon(type)} {type}
                  </button>
                )
              )}
            </div>
          </div>

          <Input
            label='Start Time'
            type='datetime-local'
            value={formData.startTime}
            onChange={(val) => setFormData({ ...formData, startTime: val })}
          />

          {(formData.entryType === 'sleep' ||
            (formData.entryType === 'feeding' &&
              formData.feedingType !== 'bottle')) && (
            <Input
              label='End Time (optional)'
              type='datetime-local'
              value={formData.endTime}
              onChange={(val) => setFormData({ ...formData, endTime: val })}
            />
          )}

          {formData.entryType === 'feeding' && (
            <>
              <div>
                <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
                  Feeding Type
                </label>
                <div className='grid grid-cols-2 gap-2'>
                  {(
                    ['breast_left', 'breast_right', 'bottle'] as FeedingType[]
                  ).map((type) => (
                    <button
                      key={type}
                      onClick={() =>
                        setFormData({ ...formData, feedingType: type })
                      }
                      className={`rounded-xl border-2 p-3 text-sm transition-all ${
                        formData.feedingType === type
                          ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      {getFeedingTypeLabel(type)}
                    </button>
                  ))}
                </div>
              </div>

              {formData.feedingType === 'bottle' && (
                <Input
                  label='Amount (oz)'
                  type='number'
                  step='0.5'
                  value={formData.quantity}
                  onChange={(val) =>
                    setFormData({ ...formData, quantity: val })
                  }
                  placeholder='e.g., 4'
                />
              )}
            </>
          )}

          {formData.entryType === 'pumping' && (
            <Input
              label='Amount (oz)'
              type='number'
              step='0.5'
              value={formData.quantity}
              onChange={(val) => setFormData({ ...formData, quantity: val })}
              placeholder='e.g., 4'
            />
          )}

          {formData.entryType === 'diaper' && (
            <div>
              <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
                Diaper Type
              </label>
              <div className='grid grid-cols-3 gap-2'>
                {(['wet', 'dirty', 'both'] as DiaperType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() =>
                      setFormData({ ...formData, diaperType: type })
                    }
                    className={`rounded-xl border-2 p-3 capitalize transition-all ${
                      formData.diaperType === type
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Input
            label='Notes (optional)'
            type='textarea'
            value={formData.notes}
            onChange={(val) => setFormData({ ...formData, notes: val })}
            placeholder='Any additional details...'
            rows={2}
          />

          <div className='flex gap-3'>
            <Button
              onClick={() => setIsManualEntryModalOpen(false)}
              variant='outline'
              fullWidth
            >
              Cancel
            </Button>
            <Button onClick={handleManualSubmit} fullWidth>
              Save Entry
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Activity Modal */}
      <AppErrorBoundary level='component' name='Edit Activity Modal'>
        <Suspense fallback={<div>Loading modal...</div>}>
          <ActivityModal
            isOpen={isEditModalOpen}
            entry={selectedEntry}
            onClose={() => setIsEditModalOpen(false)}
            onSave={handleEditSave}
            onError={handleEditError}
          />
        </Suspense>
      </AppErrorBoundary>

      {/* Confirmation Modal */}
      {confirmationModal.config && (
        <ConfirmationModal
          isOpen={confirmationModal.isOpen}
          onClose={confirmationModal.close}
          onConfirm={confirmationModal.confirm}
          title={confirmationModal.config.title}
          message={confirmationModal.config.message}
          confirmText={confirmationModal.config.confirmText}
          cancelText={confirmationModal.config.cancelText}
          isLoading={confirmationModal.isLoading}
          variant={confirmationModal.config.variant}
        />
      )}
    </Layout>
  )
}

export const Activities: React.FC = () => {
  return (
    <PageErrorBoundary pageName='Activities' contextData={{}}>
      <ActivitiesContent />
    </PageErrorBoundary>
  )
}
