import React from 'react'
import { Lightbulb, TrendingUp, AlertCircle, Heart } from 'lucide-react'
import type { ContextualGuidance as ContextualGuidanceType } from '../services/aiAssistantService'

interface ContextualGuidanceProps {
  guidance: ContextualGuidanceType[]
  className?: string
}

export const ContextualGuidance: React.FC<ContextualGuidanceProps> = ({
  guidance,
  className = '',
}) => {
  if (guidance.length === 0) return null

  const getIcon = (type: string) => {
    switch (type) {
      case 'milestone':
        return <Heart className='w-4 h-4 text-pink-500 dark:text-pink-400' />
      case 'alert':
        return (
          <AlertCircle className='w-4 h-4 text-red-500 dark:text-red-400' />
        )
      case 'encouragement':
        return (
          <TrendingUp className='w-4 h-4 text-green-500 dark:text-green-400' />
        )
      default:
        return (
          <Lightbulb className='w-4 h-4 text-blue-500 dark:text-blue-400' />
        )
    }
  }

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'milestone':
        return 'bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800'
      case 'alert':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      case 'encouragement':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
    }
  }

  // Show only the most recent guidance
  const latestGuidance = guidance[0]

  return (
    <div className={`${className}`}>
      <div
        className={`p-4 rounded-lg border ${getBackgroundColor(
          latestGuidance.type
        )}`}
      >
        <div className='flex items-start gap-3'>
          {getIcon(latestGuidance.type)}
          <div className='flex-1'>
            <p className='text-sm text-gray-700 dark:text-gray-300 leading-relaxed'>
              {latestGuidance.message}
            </p>
            <p className='text-xs text-gray-500 dark:text-gray-400 mt-2'>
              {latestGuidance.timestamp.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
