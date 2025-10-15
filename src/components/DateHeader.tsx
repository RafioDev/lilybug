import React from 'react'
import { Calendar } from 'lucide-react'
import type { DateGroup } from '../utils/activityUtils'

interface DateHeaderProps {
  dateGroup: DateGroup
}

export const DateHeader: React.FC<DateHeaderProps> = ({ dateGroup }) => {
  const { displayDate, entries, isToday, isYesterday } = dateGroup

  return (
    <div className='flex items-center justify-between py-3 px-1 border-b border-gray-200'>
      <div className='flex items-center gap-2'>
        <Calendar className='w-4 h-4 text-gray-500' />
        <h3
          className={`font-semibold ${
            isToday
              ? 'text-blue-600'
              : isYesterday
              ? 'text-gray-700'
              : 'text-gray-600'
          }`}
        >
          {displayDate}
        </h3>
        {isToday && (
          <span className='px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full'>
            Today
          </span>
        )}
      </div>

      <div className='text-sm text-gray-500'>
        {entries.length} {entries.length === 1 ? 'activity' : 'activities'}
      </div>
    </div>
  )
}
