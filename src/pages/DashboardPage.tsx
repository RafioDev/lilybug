import React, { useState, useEffect } from 'react'
import { Layout } from '../components/Layout'
import { Card } from '../components/Card'
import { AIInsights } from '../components/AIInsights'
import { PageErrorBoundary } from '../components/PageErrorBoundary'
import { babyService } from '../services/babyService'
import { trackerService } from '../services/trackerService'
import { aiPatternService } from '../services/aiPatternService'
import { aiAssistantService } from '../services/aiAssistantService'
import type { Baby } from '../types'
import type { PatternInsights } from '../services/aiPatternService'
import type { ContextualGuidance } from '../services/aiAssistantService'

const DashboardContent: React.FC = () => {
  const [activeBaby, setActiveBaby] = useState<Baby | null>(null)
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

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const activeBabyData = await babyService.getActiveBaby()
      setActiveBaby(activeBabyData)

      // Load tracker data for AI analysis
      const entries = await trackerService.getEntries(100, activeBabyData?.id)

      // Generate AI insights
      const insights = aiPatternService.generateInsights(entries, [])
      setAiInsights(insights)

      if (activeBabyData) {
        const guidance = aiAssistantService.generateContextualGuidance(
          entries,
          activeBabyData
        )
        setContextualGuidance(guidance)

        const prediction = aiAssistantService.predictNextActivity(entries)
        setNextActivityPrediction(prediction)
      }
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout title='Insights'>
        <Card>
          <p className='text-center text-gray-500 dark:text-gray-400'>
            Loading...
          </p>
        </Card>
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
    <Layout title='Insights' onDataRefresh={loadData}>
      <div className='space-y-6'>
        {/* AI Insights Section */}
        {aiInsights && (
          <Card className='lg:p-8'>
            <AIInsights
              insights={aiInsights}
              contextualGuidance={contextualGuidance}
              nextActivityPrediction={nextActivityPrediction}
            />
          </Card>
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
