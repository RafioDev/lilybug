import React from 'react'
import { Edit3, Trash2 } from 'lucide-react'
import { DateHeader } from './DateHeader'
import { activityUtils } from '../utils/activityUtils'
import type { DateGroup } from '../utils/activityUtils'
import type { TrackerEntry } from '../types'

interface ActivityGroupProps {
  dateGroup: DateGroup
  onEditEntry: (entry: TrackerEntry) => void
  onDeleteEntry: (id: string) => void
  onViewDetails: (entry: TrackerEntry) => void
}

export const ActivityGroup: React.FC<ActivityGroupProps> = ({
  dateGroup,
  onEditEntry,
  onDeleteEntry,
  onViewDetails,
}) => {
  return (
    <div className='space-y-3'>
      {/* Date Header */}
      <DateHeader dateGroup={dateGroup} />

      {/* Activities for this date */}
      <div className='space-y-2'>
        {dateGroup.entries.map((entry) => (
          <div
            key={entry.id}
            className='flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer'
            onClick={() => onViewDetails(entry)}
          >
            <div className='flex items-center gap-3'>
              <span className='text-2xl'>
                {activityUtils.getActivityIcon(entry.entry_type)}
              </span>
              <div>
                <p className='font-medium text-gray-900 dark:text-gray-100 text-sm'>
                  {activityUtils.getEntryDetails(entry)}
                </p>
                <p className='text-xs text-gray-500 dark:text-gray-400'>
                  {new Date(entry.start_time).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </p>
                {entry.notes && (
                  <p className='text-xs text-gray-400 dark:text-gray-500 mt-1 italic'>
                    "{entry.notes}"
                  </p>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className='flex items-center gap-1'>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEditEntry(entry)
                }}
                className='p-1 text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors'
                title='Edit entry'
              >
                <Edit3 className='w-4 h-4' />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteEntry(entry.id)
                }}
                className='p-1 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors'
                title='Delete entry'
              >
                <Trash2 className='w-4 h-4' />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
