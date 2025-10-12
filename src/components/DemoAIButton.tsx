import React, { useState } from 'react'
import { Brain, Loader } from 'lucide-react'
import { Button } from './Button'
import { AIInsights } from './AIInsights'
import { Modal } from './Modal'
import { aiPatternService } from '../services/aiPatternService'
import { aiAssistantService } from '../services/aiAssistantService'
import {
  generateDemoProfile,
  generateDemoTrackerEntries,
  generateDemoWellnessEntries,
} from '../utils/demoData'

export const DemoAIButton: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [demoData, setDemoData] = useState<{
    insights: any
    personalizedTips: any[]
    contextualGuidance: any[]
    nextActivityPrediction: any
  } | null>(null)

  const generateDemoInsights = async () => {
    setIsLoading(true)

    try {
      // Generate demo data
      const profile = generateDemoProfile()
      const trackerEntries = generateDemoTrackerEntries()
      const wellnessEntries = generateDemoWellnessEntries()

      // Generate AI insights
      const insights = aiPatternService.generateInsights(
        trackerEntries,
        wellnessEntries
      )

      // Generate personalized tips
      const personalizedTips = aiAssistantService.generatePersonalizedTips(
        profile,
        trackerEntries,
        wellnessEntries,
        [] // No static tips for demo
      )

      // Generate contextual guidance
      const contextualGuidance = aiAssistantService.generateContextualGuidance(
        trackerEntries,
        profile
      )

      // Generate next activity prediction
      const nextActivityPrediction =
        aiAssistantService.predictNextActivity(trackerEntries)

      setDemoData({
        insights,
        personalizedTips,
        contextualGuidance,
        nextActivityPrediction,
      })

      setIsModalOpen(true)
    } catch (error) {
      console.error('Error generating demo insights:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button
        onClick={generateDemoInsights}
        disabled={isLoading}
        className='flex items-center gap-2 bg-purple-600 hover:bg-purple-700'
      >
        {isLoading ? (
          <Loader className='w-4 h-4 animate-spin' />
        ) : (
          <Brain className='w-4 h-4' />
        )}
        {isLoading ? 'Generating...' : 'Demo AI Insights'}
      </Button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title='AI Insights Demo'
        size='lg'
      >
        {demoData && (
          <div className='max-h-96 overflow-y-auto'>
            <AIInsights
              insights={demoData.insights}
              personalizedTips={demoData.personalizedTips}
              contextualGuidance={demoData.contextualGuidance}
              nextActivityPrediction={demoData.nextActivityPrediction}
            />
          </div>
        )}
      </Modal>
    </>
  )
}
