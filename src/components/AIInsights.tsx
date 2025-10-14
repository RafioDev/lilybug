import React from 'react'
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Clock,
  Heart,
  AlertCircle,
} from 'lucide-react'
import type { PatternInsights } from '../services/aiPatternService'
import type { ContextualGuidance } from '../services/aiAssistantService'

interface AIInsightsProps {
  insights: PatternInsights
  contextualGuidance: ContextualGuidance[]
  nextActivityPrediction?: {
    activity: 'feeding' | 'sleep' | 'diaper'
    estimatedTime: Date
    confidence: number
  } | null
}

export const AIInsights: React.FC<AIInsightsProps> = ({
  insights,
  contextualGuidance,
  nextActivityPrediction,
}) => {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
      case 'increasing':
        return <TrendingUp className='w-4 h-4 text-green-500' />
      case 'declining':
      case 'decreasing':
        return <TrendingDown className='w-4 h-4 text-red-500' />
      default:
        return <div className='w-4 h-4 bg-gray-300 rounded-full' />
    }
  }

  const getGuidanceIcon = (type: string) => {
    switch (type) {
      case 'milestone':
        return '🎉'
      case 'alert':
        return '⚠️'
      case 'encouragement':
        return '💪'
      default:
        return '💡'
    }
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center gap-2 mb-4'>
        <Brain className='w-5 h-5 text-purple-600' />
        <h2 className='text-lg font-semibold text-gray-900'>AI Insights</h2>
      </div>

      {/* Pattern Analysis */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {/* Sleep Patterns */}
        <div className='bg-white rounded-lg border border-gray-200 p-4'>
          <div className='flex items-center justify-between mb-3'>
            <h3 className='font-medium text-gray-900'>Sleep Patterns</h3>
            {getTrendIcon(insights.sleepPattern.trend)}
          </div>
          <div className='space-y-2 text-sm'>
            <div className='flex justify-between'>
              <span className='text-gray-600'>Average Duration:</span>
              <span className='font-medium'>
                {formatDuration(insights.sleepPattern.averageSleepDuration)}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-600'>Longest Sleep:</span>
              <span className='font-medium'>
                {formatDuration(insights.sleepPattern.longestSleep)}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-600'>Sleep Efficiency:</span>
              <span className='font-medium'>
                {insights.sleepPattern.sleepEfficiency}%
              </span>
            </div>
          </div>
        </div>

        {/* Feeding Patterns */}
        <div className='bg-white rounded-lg border border-gray-200 p-4'>
          <div className='flex items-center justify-between mb-3'>
            <h3 className='font-medium text-gray-900'>Feeding Patterns</h3>
            {getTrendIcon(insights.feedingPattern.trend)}
          </div>
          <div className='space-y-2 text-sm'>
            <div className='flex justify-between'>
              <span className='text-gray-600'>Average Interval:</span>
              <span className='font-medium'>
                {insights.feedingPattern.averageInterval.toFixed(1)}h
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-600'>Daily Frequency:</span>
              <span className='font-medium'>
                {insights.feedingPattern.feedingFrequency.toFixed(1)}/day
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-600'>Preferred Type:</span>
              <span className='font-medium capitalize'>
                {insights.feedingPattern.mostCommonType.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Next Activity Prediction */}
      {nextActivityPrediction && (
        <div className='bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-4'>
          <div className='flex items-center gap-2 mb-2'>
            <Clock className='w-4 h-4 text-purple-600' />
            <h3 className='font-medium text-gray-900'>
              Next Activity Prediction
            </h3>
          </div>
          <p className='text-sm text-gray-700'>
            Next {nextActivityPrediction.activity} predicted around{' '}
            <span className='font-medium'>
              {formatTime(nextActivityPrediction.estimatedTime)}
            </span>
            <span className='text-xs text-gray-500 ml-2'>
              ({Math.round(nextActivityPrediction.confidence * 100)}%
              confidence)
            </span>
          </p>
        </div>
      )}

      {/* Contextual Guidance */}
      {contextualGuidance.length > 0 && (
        <div className='bg-white rounded-lg border border-gray-200 p-4'>
          <h3 className='font-medium text-gray-900 mb-3'>Recent Insights</h3>
          <div className='space-y-3'>
            {contextualGuidance.slice(0, 3).map((guidance, index) => (
              <div
                key={index}
                className='flex items-start gap-3 p-3 bg-gray-50 rounded-lg'
              >
                <span className='text-lg'>
                  {getGuidanceIcon(guidance.type)}
                </span>
                <div className='flex-1'>
                  <p className='text-sm text-gray-700'>{guidance.message}</p>
                  <p className='text-xs text-gray-500 mt-1'>
                    {guidance.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alerts */}
      {insights.alerts.length > 0 && (
        <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
          <div className='flex items-center gap-2 mb-2'>
            <AlertCircle className='w-4 h-4 text-red-600' />
            <h3 className='font-medium text-red-900'>Alerts</h3>
          </div>
          <div className='space-y-2'>
            {insights.alerts.map((alert, index) => (
              <p key={index} className='text-sm text-red-700'>
                {alert}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {insights.recommendations.length > 0 && (
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
          <div className='flex items-center gap-2 mb-2'>
            <Heart className='w-4 h-4 text-blue-600' />
            <h3 className='font-medium text-blue-900'>Recommendations</h3>
          </div>
          <div className='space-y-2'>
            {insights.recommendations.map((rec, index) => (
              <p key={index} className='text-sm text-blue-700'>
                {rec}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
