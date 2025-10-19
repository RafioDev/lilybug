import React from 'react'
import { Baby as BabyIcon } from 'lucide-react'
import { dateUtils } from '../utils/dateUtils'
import { useActiveBaby } from '../hooks/queries/useBabyQueries'

interface BabyHeaderProps {
  className?: string
  variant?: 'desktop' | 'mobile'
}

export const BabyHeader: React.FC<BabyHeaderProps> = ({
  className = '',
  variant = 'desktop',
}) => {
  // Use React Query hook instead of manual async operation
  const { data: activeBaby, isLoading } = useActiveBaby()

  if (isLoading) {
    return (
      <div className={`${className}`}>
        <div className='flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800/50'>
          <div className='h-4 w-4 animate-pulse rounded bg-gray-200 dark:bg-gray-600'></div>
          <div className='h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-600'></div>
        </div>
      </div>
    )
  }

  if (!activeBaby) {
    return (
      <div
        className={`flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800/50 ${className}`}
      >
        <BabyIcon className='h-4 w-4 text-gray-400 dark:text-gray-500' />
        <span className='text-sm text-gray-500 dark:text-gray-400'>
          No baby selected
        </span>
      </div>
    )
  }

  const baseClasses =
    'flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 dark:bg-blue-900/30'
  const variantClasses =
    variant === 'mobile'
      ? 'sticky top-0 z-20 border-b border-blue-100 dark:border-blue-800/50'
      : 'sticky top-0 z-30'

  return (
    <div className={`${baseClasses} ${variantClasses} ${className}`}>
      <BabyIcon className='h-4 w-4 text-blue-600 dark:text-blue-400' />
      <div className='flex items-center gap-2'>
        <span className='font-medium text-blue-900 dark:text-blue-100'>
          {activeBaby.name}
        </span>
        <span className='text-xs text-blue-600 dark:text-blue-400'>
          {dateUtils.calculateAge(activeBaby.birthdate)}
        </span>
      </div>
    </div>
  )
}
