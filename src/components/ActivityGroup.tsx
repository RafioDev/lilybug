import React from 'react'
import { Edit3, Trash2 } from 'lucide-react'
import { DateHeader } from './DateHeader'
import { IconButton } from './Button'
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
            <div className='flex items-center gap-2'>
              <div onClick={(e) => e.stopPropagation()}>
                <IconButton
                  onClick={() => onEditEntry(entry)}
                  variant='outline'
                  size='sm'
                  icon={<Edit3 />}
                  aria-label={`Edit ${entry.entry_type} entry`}
                  className='text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-500'
                />
              </div>
              <div onClick={(e) => e.stopPropagation()}>
                <IconButton
                  onClick={() => onDeleteEntry(entry.id)}
                  variant='outline'
                  size='sm'
                  icon={<Trash2 />}
                  aria-label={`Delete ${entry.entry_type} entry`}
                  className='text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-500'
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
