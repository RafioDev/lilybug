import React, { useState, useEffect } from 'react'
import {
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Edit3,
  Trash2,
  CheckCircle,
} from 'lucide-react'
import { IconButton, Button } from './Button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { activityUtils } from '../utils/activityUtils'
import type { DateGroup } from '../utils/activityUtils'
import type { TrackerEntry } from '../types'

interface ActivityGroupProps {
  dateGroup: DateGroup
  onEditEntry: (entry: TrackerEntry) => void
  onDeleteEntry: (entry: TrackerEntry) => void
  onStopActivity?: (entry: TrackerEntry) => void
  defaultExpanded?: boolean
  className?: string
}

export const ActivityGroup: React.FC<ActivityGroupProps> = ({
  dateGroup,
  onEditEntry,
  onDeleteEntry,
  onStopActivity,
  defaultExpanded = true,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const [, setCurrentTime] = useState(new Date())
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null)

  // Update current time every minute to refresh in-progress durations
  useEffect(() => {
    const hasInProgressActivities = dateGroup.entries.some((entry) =>
      activityUtils.isInProgress(entry)
    )

    if (!hasInProgressActivities) return

    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [dateGroup.entries])

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
              className='relative flex items-start justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-700'
            >
              <div className='flex min-w-0 flex-1 items-start gap-3'>
                <span className='mt-1 flex-shrink-0 text-2xl'>
                  {activityUtils.getActivityIcon(entry.entry_type)}
                </span>
                <div className='min-w-0 flex-1'>
                  <p className='text-sm leading-relaxed font-medium text-gray-900 dark:text-gray-100'>
                    {activityUtils.getEntryDetails(entry)}
                  </p>
                  <div className='mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400'>
                    <span>
                      {new Date(entry.start_time).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </span>
                    {/* Show duration for completed activities or elapsed time for in-progress (not for bottle feeding) */}
                    {(entry.entry_type === 'sleep' ||
                      (entry.entry_type === 'feeding' &&
                        entry.feeding_type !== 'bottle')) && (
                      <span className='font-medium text-blue-600 dark:text-blue-400'>
                        {entry.end_time
                          ? `• ${activityUtils.calculateEntryDuration(entry) || '0 min'}`
                          : `• ${activityUtils.calculateElapsedDuration(entry.start_time)} (ongoing)`}
                      </span>
                    )}
                  </div>
                  {entry.notes && (
                    <p className='mt-2 text-xs leading-relaxed text-gray-400 italic dark:text-gray-500'>
                      "{entry.notes}"
                    </p>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className='ml-3 flex flex-shrink-0 items-center gap-2'>
                {/* Done button for in-progress feeding and sleep activities */}
                {activityUtils.isInProgress(entry) && onStopActivity && (
                  <div onClick={(e) => e.stopPropagation()}>
                    <Button
                      onClick={() => onStopActivity(entry)}
                      variant='outline'
                      size='sm'
                      leftIcon={<CheckCircle size={16} />}
                      aria-label={`Complete ${entry.entry_type} activity`}
                      className='border-orange-500 px-3 py-2 text-orange-600 hover:border-orange-600 hover:bg-orange-50 hover:text-orange-700 dark:border-orange-400 dark:text-orange-400 dark:hover:border-orange-300 dark:hover:bg-orange-900/20 dark:hover:text-orange-300'
                    >
                      I'm Done
                    </Button>
                  </div>
                )}

                {/* Settings menu */}
                <div onClick={(e) => e.stopPropagation()}>
                  <Popover
                    open={openPopoverId === entry.id}
                    onOpenChange={(open) => {
                      if (open) {
                        setOpenPopoverId(entry.id)
                      } else {
                        setOpenPopoverId(null)
                      }
                    }}
                  >
                    <PopoverTrigger asChild>
                      <IconButton
                        onClick={() => {}} // Dummy handler to prevent errors
                        variant='outline'
                        size='sm'
                        icon={<MoreHorizontal />}
                        aria-label='Activity options'
                        className='border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-700 dark:border-gray-600 dark:text-gray-400 dark:hover:border-gray-500 dark:hover:text-gray-300'
                      />
                    </PopoverTrigger>
                    <PopoverContent className='w-32 p-0' align='end'>
                      <button
                        onClick={() => {
                          onEditEntry(entry)
                          setOpenPopoverId(null)
                        }}
                        className='flex w-full items-center gap-2 rounded-t-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                      >
                        <Edit3 size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          onDeleteEntry(entry)
                          setOpenPopoverId(null)
                        }}
                        className='flex w-full items-center gap-2 rounded-b-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20'
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
