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
        return <Heart className='w-4 h-4 text-pink-500' />
      case 'alert':
        return <AlertCircle className='w-4 h-4 text-red-500' />
      case 'encouragement':
        return <TrendingUp className='w-4 h-4 text-green-500' />
      default:
        return <Lightbulb className='w-4 h-4 text-blue-500' />
    }
  }

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'milestone':
        return 'bg-pink-50 border-pink-200'
      case 'alert':
        return 'bg-red-50 border-red-200'
      case 'encouragement':
        return 'bg-green-50 border-green-200'
      default:
        return 'bg-blue-50 border-blue-200'
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
            <p className='text-sm text-gray-700 leading-relaxed'>
              {latestGuidance.message}
            </p>
            <p className='text-xs text-gray-500 mt-2'>
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
