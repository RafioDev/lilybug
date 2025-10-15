import React from 'react'
import { Clock } from 'lucide-react'
import { ActivityGroup } from './ActivityGroup'
import { activityUtils } from '../utils/activityUtils'
import type { TrackerEntry } from '../types'

interface GroupedActivitiesListProps {
  entries: TrackerEntry[]
  onEditEntry: (entry: TrackerEntry) => void
  onDeleteEntry: (id: string) => void
  onViewDetails: (entry: TrackerEntry) => void
  isLoading?: boolean
  className?: string
}

export const GroupedActivitiesList: React.FC<GroupedActivitiesListProps> = ({
  entries,
  onEditEntry,
  onDeleteEntry,
  onViewDetails,
  isLoading = false,
  className = '',
}) => {
  const dateGroups = activityUtils.groupActivitiesByDate(entries)

  if (entries.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <Clock className='w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4' />
        <p className='text-gray-500 dark:text-gray-400 mb-2'>
          No activities tracked yet
        </p>
        <p className='text-sm text-gray-400 dark:text-gray-500'>
          Use the voice assistant above to log activities
        </p>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className} ${isLoading ? 'opacity-70' : ''}`}>
      {dateGroups.map((dateGroup) => (
        <ActivityGroup
          key={dateGroup.date}
          dateGroup={dateGroup}
          onEditEntry={onEditEntry}
          onDeleteEntry={onDeleteEntry}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  )
}
