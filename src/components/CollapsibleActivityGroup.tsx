import React, { useState } from 'react'
import { ChevronDown, ChevronRight, Edit3, Trash2 } from 'lucide-react'
import { IconButton } from './Button'
import { activityUtils } from '../utils/activityUtils'
import type { DateGroup } from '../utils/activityUtils'
import type { TrackerEntry } from '../types'

interface CollapsibleActivityGroupProps {
  dateGroup: DateGroup
  onEditEntry: (entry: TrackerEntry) => void
  onDeleteEntry: (entry: TrackerEntry) => void
  onViewDetails: (entry: TrackerEntry) => void
  defaultExpanded?: boolean
  className?: string
}

export const CollapsibleActivityGroup: React.FC<
  CollapsibleActivityGroupProps
> = ({
  dateGroup,
  onEditEntry,
  onDeleteEntry,
  onViewDetails,
  defaultExpanded = true,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  const totalEntries = dateGroup.entries.length

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Collapsible Header - Simplified Design */}
      <button
        onClick={toggleExpanded}
        className='flex w-full items-center justify-between border-b border-gray-200 px-1 py-3 text-left transition-colors duration-150 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50'
      >
        <div className='flex items-center gap-2'>
          {/* Expand/Collapse Icon */}
          {isExpanded ? (
            <ChevronDown
              size={16}
              className='text-gray-500 dark:text-gray-400'
            />
          ) : (
            <ChevronRight
              size={16}
              className='text-gray-500 dark:text-gray-400'
            />
          )}

          <h3
            className={`font-semibold ${
              dateGroup.isToday
                ? 'text-blue-600 dark:text-blue-400'
                : dateGroup.isYesterday
                  ? 'text-gray-700 dark:text-gray-300'
                  : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {dateGroup.displayDate}
          </h3>
          {dateGroup.isToday && (
            <span className='rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'>
              Today
            </span>
          )}
        </div>

        <div className='text-sm text-gray-500 dark:text-gray-400'>
          {totalEntries} {totalEntries === 1 ? 'activity' : 'activities'}
        </div>
      </button>

      {/* Collapsible Content */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'} `}
      >
        <div className='space-y-2'>
          {dateGroup.entries.map((entry) => (
            <div
              key={entry.id}
              className='flex cursor-pointer items-center justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600'
              onClick={() => onViewDetails(entry)}
            >
              <div className='flex items-center gap-3'>
                <span className='text-2xl'>
                  {activityUtils.getActivityIcon(entry.entry_type)}
                </span>
                <div>
                  <p className='text-sm font-medium text-gray-900 dark:text-gray-100'>
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
                    <p className='mt-1 text-xs text-gray-400 italic dark:text-gray-500'>
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
                    className='border-gray-300 text-gray-600 hover:border-blue-300 hover:text-blue-600 dark:border-gray-600 dark:text-gray-400 dark:hover:border-blue-500 dark:hover:text-blue-400'
                  />
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <IconButton
                    onClick={() => onDeleteEntry(entry)}
                    variant='outline'
                    size='sm'
                    icon={<Trash2 />}
                    aria-label={`Delete ${entry.entry_type} entry`}
                    className='border-gray-300 text-gray-600 hover:border-red-300 hover:text-red-600 dark:border-gray-600 dark:text-gray-400 dark:hover:border-red-500 dark:hover:text-red-400'
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
