import React from 'react'
import { Calendar } from 'lucide-react'
import type { DateGroup } from '../utils/activityUtils'

interface DateHeaderProps {
  dateGroup: DateGroup
}

export const DateHeader: React.FC<DateHeaderProps> = ({ dateGroup }) => {
  const { displayDate, entries, isToday, isYesterday } = dateGroup

  return (
    <div className='flex items-center justify-between border-b border-gray-200 px-1 py-3 dark:border-gray-700'>
      <div className='flex items-center gap-2'>
        <Calendar className='h-4 w-4 text-gray-500 dark:text-gray-400' />
        <h3
          className={`font-semibold ${
            isToday
              ? 'text-blue-600 dark:text-blue-400'
              : isYesterday
                ? 'text-gray-700 dark:text-gray-300'
                : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          {displayDate}
        </h3>
        {isToday && (
          <span className='rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'>
            Today
          </span>
        )}
      </div>

      <div className='text-sm text-gray-500 dark:text-gray-400'>
        {entries.length} {entries.length === 1 ? 'activity' : 'activities'}
      </div>
    </div>
  )
}
