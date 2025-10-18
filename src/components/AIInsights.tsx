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
        return (
          <TrendingUp className='h-4 w-4 text-green-500 dark:text-green-400' />
        )
      case 'declining':
      case 'decreasing':
        return (
          <TrendingDown className='h-4 w-4 text-red-500 dark:text-red-400' />
        )
      default:
        return (
          <div className='h-4 w-4 rounded-full bg-gray-300 dark:bg-gray-600' />
        )
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
      <div className='mb-4 flex items-center gap-2'>
        <Brain className='h-5 w-5 text-purple-600 dark:text-purple-400' />
        <h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
          AI Insights
        </h2>
      </div>

      {/* Pattern Analysis */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        {/* Sleep Patterns */}
        <div className='rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800'>
          <div className='mb-3 flex items-center justify-between'>
            <h3 className='font-medium text-gray-900 dark:text-gray-100'>
              Sleep Patterns
            </h3>
            {getTrendIcon(insights.sleepPattern.trend)}
          </div>
          <div className='space-y-2 text-sm'>
            <div className='flex justify-between'>
              <span className='text-gray-600 dark:text-gray-400'>
                Average Duration:
              </span>
              <span className='font-medium text-gray-900 dark:text-gray-100'>
                {formatDuration(insights.sleepPattern.averageSleepDuration)}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-600 dark:text-gray-400'>
                Longest Sleep:
              </span>
              <span className='font-medium text-gray-900 dark:text-gray-100'>
                {formatDuration(insights.sleepPattern.longestSleep)}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-600 dark:text-gray-400'>
                Sleep Efficiency:
              </span>
              <span className='font-medium text-gray-900 dark:text-gray-100'>
                {insights.sleepPattern.sleepEfficiency}%
              </span>
            </div>
          </div>
        </div>

        {/* Feeding Patterns */}
        <div className='rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800'>
          <div className='mb-3 flex items-center justify-between'>
            <h3 className='font-medium text-gray-900 dark:text-gray-100'>
              Feeding Patterns
            </h3>
            {getTrendIcon(insights.feedingPattern.trend)}
          </div>
          <div className='space-y-2 text-sm'>
            <div className='flex justify-between'>
              <span className='text-gray-600 dark:text-gray-400'>
                Average Interval:
              </span>
              <span className='font-medium text-gray-900 dark:text-gray-100'>
                {insights.feedingPattern.averageInterval.toFixed(1)}h
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-600 dark:text-gray-400'>
                Daily Frequency:
              </span>
              <span className='font-medium text-gray-900 dark:text-gray-100'>
                {insights.feedingPattern.feedingFrequency.toFixed(1)}/day
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-600 dark:text-gray-400'>
                Preferred Type:
              </span>
              <span className='font-medium text-gray-900 capitalize dark:text-gray-100'>
                {insights.feedingPattern.mostCommonType.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Next Activity Prediction */}
      {nextActivityPrediction && (
        <div className='rounded-lg border border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 p-4 dark:border-purple-700 dark:from-purple-900/20 dark:to-blue-900/20'>
          <div className='mb-2 flex items-center gap-2'>
            <Clock className='h-4 w-4 text-purple-600 dark:text-purple-400' />
            <h3 className='font-medium text-gray-900 dark:text-gray-100'>
              Next Activity Prediction
            </h3>
          </div>
          <p className='text-sm text-gray-700 dark:text-gray-300'>
            Next {nextActivityPrediction.activity} predicted around{' '}
            <span className='font-medium text-gray-900 dark:text-gray-100'>
              {formatTime(nextActivityPrediction.estimatedTime)}
            </span>
            <span className='ml-2 text-xs text-gray-500 dark:text-gray-400'>
              ({Math.round(nextActivityPrediction.confidence * 100)}%
              confidence)
            </span>
          </p>
        </div>
      )}

      {/* Contextual Guidance */}
      {contextualGuidance.length > 0 && (
        <div className='rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800'>
          <h3 className='mb-3 font-medium text-gray-900 dark:text-gray-100'>
            Recent Insights
          </h3>
          <div className='space-y-3'>
            {contextualGuidance.slice(0, 3).map((guidance, index) => (
              <div
                key={index}
                className='flex items-start gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700'
              >
                <span className='text-lg'>
                  {getGuidanceIcon(guidance.type)}
                </span>
                <div className='flex-1'>
                  <p className='text-sm text-gray-700 dark:text-gray-300'>
                    {guidance.message}
                  </p>
                  <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
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
        <div className='rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20'>
          <div className='mb-2 flex items-center gap-2'>
            <AlertCircle className='h-4 w-4 text-red-600 dark:text-red-400' />
            <h3 className='font-medium text-red-900 dark:text-red-100'>
              Alerts
            </h3>
          </div>
          <div className='space-y-2'>
            {insights.alerts.map((alert, index) => (
              <p key={index} className='text-sm text-red-700 dark:text-red-300'>
                {alert}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {insights.recommendations.length > 0 && (
        <div className='rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20'>
          <div className='mb-2 flex items-center gap-2'>
            <Heart className='h-4 w-4 text-blue-600 dark:text-blue-400' />
            <h3 className='font-medium text-blue-900 dark:text-blue-100'>
              Recommendations
            </h3>
          </div>
          <div className='space-y-2'>
            {insights.recommendations.map((rec, index) => (
              <p
                key={index}
                className='text-sm text-blue-700 dark:text-blue-300'
              >
                {rec}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
