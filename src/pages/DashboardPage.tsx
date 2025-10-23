import React, { useState, useEffect, useMemo } from 'react'
import { Layout } from '../components/Layout'
import { Card } from '../components/Card'
import { AIInsights } from '../components/AIInsights'
import { PageErrorBoundary } from '../components/PageErrorBoundary'
import { SectionErrorBoundary } from '../components/SectionErrorBoundary'
import { useActiveBaby } from '../hooks/queries/useBabyQueries'
import { useEntries } from '../hooks/queries/useTrackerQueries'
import { aiPatternService } from '../services/aiPatternService'
import { aiAssistantService } from '../services/aiAssistantService'

import type { PatternInsights } from '../services/aiPatternService'
import type { ContextualGuidance } from '../services/aiAssistantService'

const DashboardContent: React.FC = () => {
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

  // Use React Query for data
  const { data: activeBaby, isLoading: babyLoading } = useActiveBaby()
  const { data: entries = [], isLoading: entriesLoading } = useEntries(
    100,
    activeBaby?.id
  )

  // Calculate today's stats using useMemo for better performance
  const todayStats = useMemo(() => {
    if (entries.length === 0) {
      return {
        feedings: 0,
        sleepHours: 0,
        diapers: 0,
      }
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

  useEffect(() => {
    const loadInsightsData = async () => {
      if (!activeBaby || entries.length === 0) {
        setLoading(false)
        return
      }

      try {
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
  }, [activeBaby, entries])

  const isLoading = babyLoading || entriesLoading || loading

  if (isLoading) {
    return (
      <Layout title='Insights'>
        <div className='space-y-6'>
          {/* Loading Stats */}
          <Card className='p-2'>
            <div className='grid grid-cols-3 gap-2'>
              <div className='rounded-lg p-2 text-center'>
                <div className='mx-auto mb-1 h-5 w-6 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
                <div className='text-xs text-gray-400 dark:text-gray-500'>
                  Loading...
                </div>
              </div>
              <div className='rounded-lg p-2 text-center'>
                <div className='mx-auto mb-1 h-5 w-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
                <div className='text-xs text-gray-400 dark:text-gray-500'>
                  Loading...
                </div>
              </div>
              <div className='rounded-lg p-2 text-center'>
                <div className='mx-auto mb-1 h-5 w-6 animate-pulse rounded bg-gray-200 dark:bg-gray-700'></div>
                <div className='text-xs text-gray-400 dark:text-gray-500'>
                  Loading...
                </div>
              </div>
            </div>
          </Card>
          <Card>
            <p className='text-center text-gray-500 dark:text-gray-400'>
              Loading insights...
            </p>
          </Card>
        </div>
      </Layout>
    )
  }

  if (!activeBaby) {
    return (
      <Layout title='Insights'>
        <Card>
          <p className='text-center text-gray-500'>
            Please add a baby first to see insights.
          </p>
        </Card>
      </Layout>
    )
  }

  return (
    <Layout title='Insights'>
      <div className='space-y-6'>
        {/* Today's Summary Stats */}
        <SectionErrorBoundary
          sectionName="Today's Stats"
          contextData={{ babyId: activeBaby.id }}
        >
          <Card className='p-2'>
            <div className='grid grid-cols-3 gap-2'>
              {/* Feeding Stats */}
              <button
                className='group min-h-[44px] rounded-lg p-2 text-center transition-all duration-200 hover:bg-blue-50 active:scale-95 dark:hover:bg-blue-900/20'
                onClick={() => {
                  // Future: Could open detailed feeding stats modal
                  console.log('Feeding stats tapped')
                }}
                aria-label={`${todayStats.feedings} feedings today. Tap for details.`}
              >
                <div className='text-lg font-bold text-blue-600 group-hover:text-blue-700 sm:text-xl'>
                  {todayStats.feedings}
                </div>
                <div className='text-xs font-medium text-gray-600 dark:text-gray-300'>
                  Feedings
                </div>
              </button>

              {/* Sleep Stats */}
              <button
                className='group min-h-[44px] rounded-lg p-2 text-center transition-all duration-200 hover:bg-cyan-50 active:scale-95 dark:hover:bg-cyan-900/20'
                onClick={() => {
                  // Future: Could open detailed sleep stats modal
                  console.log('Sleep stats tapped')
                }}
                aria-label={`${todayStats.sleepHours.toFixed(1)} hours of sleep today. Tap for details.`}
              >
                <div className='text-lg font-bold text-cyan-600 group-hover:text-cyan-700 sm:text-xl'>
                  {`${todayStats.sleepHours.toFixed(1)}h`}
                </div>
                <div className='text-xs font-medium text-gray-600 dark:text-gray-300'>
                  Sleep
                </div>
              </button>

              {/* Diaper Stats */}
              <button
                className='group min-h-[44px] rounded-lg p-2 text-center transition-all duration-200 hover:bg-emerald-50 active:scale-95 dark:hover:bg-emerald-900/20'
                onClick={() => {
                  // Future: Could open detailed diaper stats modal
                  console.log('Diaper stats tapped')
                }}
                aria-label={`${todayStats.diapers} diaper changes today. Tap for details.`}
              >
                <div className='text-lg font-bold text-emerald-600 group-hover:text-emerald-700 sm:text-xl'>
                  {todayStats.diapers}
                </div>
                <div className='text-xs font-medium text-gray-600 dark:text-gray-300'>
                  Diapers
                </div>
              </button>
            </div>
          </Card>
        </SectionErrorBoundary>

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
    </Layout>
  )
}

export const DashboardPage: React.FC = () => {
  return (
    <PageErrorBoundary pageName='Dashboard' contextData={{}}>
      <DashboardContent />
    </PageErrorBoundary>
  )
}
