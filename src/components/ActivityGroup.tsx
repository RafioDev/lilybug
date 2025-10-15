import React from 'react'
import { Edit3, Trash2 } from 'lucide-react'
import { DateHeader } from './DateHeader'
import { activityUtils } from '../utils/activityUtils'
import type { DateGroup, TrackerEntry } from '../utils/activityUtils'

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
            className='flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer'
            onClick={() => onViewDetails(entry)}
          >
            <div className='flex items-center gap-3'>
              <span className='text-2xl'>
                {activityUtils.getActivityIcon(entry.entry_type)}
              </span>
              <div>
                <p className='font-medium text-gray-900 text-sm'>
                  {activityUtils.getEntryDetails(entry)}
                </p>
                <p className='text-xs text-gray-500'>
                  {new Date(entry.start_time).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </p>
                {entry.notes && (
                  <p className='text-xs text-gray-400 mt-1 italic'>
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
                className='p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors'
                title='Edit entry'
              >
                <Edit3 className='w-4 h-4' />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteEntry(entry.id)
                }}
                className='p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors'
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
