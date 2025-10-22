import React, { useMemo, useCallback, useState, useEffect } from 'react'
import { Clock } from 'lucide-react'
import { ActivityGroup } from './ActivityGroup'
import { CollapsibleActivityGroup } from './CollapsibleActivityGroup'
import { ComponentErrorBoundary } from './ComponentErrorBoundary'
import { activityUtils } from '../utils/activityUtils'
import type { TrackerEntry } from '../types'

interface GroupedActivitiesListProps {
  entries: TrackerEntry[]
  onEditEntry: (entry: TrackerEntry) => void
  onDeleteEntry: (entry: TrackerEntry) => void
  onViewDetails: (entry: TrackerEntry) => void
  onStopActivity?: (entry: TrackerEntry) => void
  isLoading?: boolean
  className?: string
  compactMode?: boolean
  virtualScrolling?: boolean
  maxInitialGroups?: number
}

// Memoized components for performance
const MemoizedActivityGroup = React.memo(ActivityGroup)
const MemoizedCollapsibleActivityGroup = React.memo(CollapsibleActivityGroup)

export const GroupedActivitiesList: React.FC<GroupedActivitiesListProps> = ({
  entries,
  onEditEntry,
  onDeleteEntry,
  onViewDetails,
  onStopActivity,
  isLoading = false,
  className = '',
  compactMode = false,
  virtualScrolling = false,
  maxInitialGroups = 5,
}) => {
  const [visibleGroups, setVisibleGroups] = useState(maxInitialGroups)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Memoize date groups calculation
  const dateGroups = useMemo(() => {
    return activityUtils.groupActivitiesByDate(entries)
  }, [entries])

  // Calculate effective visible groups without useEffect
  const effectiveVisibleGroups = useMemo(() => {
    if (dateGroups.length === 0) return maxInitialGroups
    return Math.min(visibleGroups, dateGroups.length)
  }, [visibleGroups, dateGroups.length, maxInitialGroups])

  // Memoize visible groups for lazy loading
  const displayedGroups = useMemo(() => {
    return dateGroups.slice(0, effectiveVisibleGroups)
  }, [dateGroups, effectiveVisibleGroups])

  const hasMoreGroups = dateGroups.length > effectiveVisibleGroups

  // Memoized handlers to prevent unnecessary re-renders
  const handleEditEntry = useCallback(
    (entry: TrackerEntry) => {
      onEditEntry(entry)
    },
    [onEditEntry]
  )

  const handleDeleteEntry = useCallback(
    (entry: TrackerEntry) => {
      onDeleteEntry(entry)
    },
    [onDeleteEntry]
  )

  const handleViewDetails = useCallback(
    (entry: TrackerEntry) => {
      onViewDetails(entry)
    },
    [onViewDetails]
  )

  const handleStopActivity = useCallback(
    (entry: TrackerEntry) => {
      onStopActivity?.(entry)
    },
    [onStopActivity]
  )

  // Load more groups function
  const loadMoreGroups = useCallback(() => {
    if (isLoadingMore || !hasMoreGroups) return

    setIsLoadingMore(true)

    // Simulate async loading for smooth UX
    setTimeout(() => {
      setVisibleGroups((prev) => Math.min(prev + 3, dateGroups.length))
      setIsLoadingMore(false)
    }, 100)
  }, [isLoadingMore, hasMoreGroups, dateGroups.length])

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!virtualScrolling || !hasMoreGroups) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreGroups()
        }
      },
      { threshold: 0.1 }
    )

    const sentinel = document.getElementById('load-more-sentinel')
    if (sentinel) {
      observer.observe(sentinel)
    }

    return () => {
      if (sentinel) {
        observer.unobserve(sentinel)
      }
    }
  }, [virtualScrolling, hasMoreGroups, loadMoreGroups])

  if (entries.length === 0) {
    return (
      <div className={`py-8 text-center ${className}`}>
        <Clock className='mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-600' />
        <p className='mb-2 text-gray-500 dark:text-gray-400'>
          No activities tracked yet
        </p>
        <p className='text-sm text-gray-400 dark:text-gray-500'>
          Use the floating action button to log activities
        </p>
      </div>
    )
  }

  return (
    <ComponentErrorBoundary componentName='GroupedActivitiesList'>
      <div
        className={`space-y-3 ${className} ${isLoading ? 'opacity-70' : ''}`}
      >
        {displayedGroups.map((dateGroup, index) => (
          <ComponentErrorBoundary
            key={dateGroup.date}
            componentName={
              compactMode ? 'CollapsibleActivityGroup' : 'ActivityGroup'
            }
          >
            {compactMode ? (
              <MemoizedCollapsibleActivityGroup
                dateGroup={dateGroup}
                onEditEntry={handleEditEntry}
                onDeleteEntry={handleDeleteEntry}
                onViewDetails={handleViewDetails}
                onStopActivity={handleStopActivity}
                defaultExpanded={index < 2} // Keep first 2 groups expanded by default
              />
            ) : (
              <MemoizedActivityGroup
                dateGroup={dateGroup}
                onEditEntry={handleEditEntry}
                onDeleteEntry={handleDeleteEntry}
                onViewDetails={handleViewDetails}
                onStopActivity={handleStopActivity}
              />
            )}
          </ComponentErrorBoundary>
        ))}

        {/* Load More Button or Infinite Scroll Sentinel */}
        {hasMoreGroups && (
          <div className='py-4'>
            {virtualScrolling ? (
              <div
                id='load-more-sentinel'
                className='flex h-4 items-center justify-center'
              >
                {isLoadingMore && (
                  <div className='flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400'>
                    <div className='h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500' />
                    Loading more...
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={loadMoreGroups}
                disabled={isLoadingMore}
                className={`w-full rounded-lg bg-gray-100 px-4 py-3 text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700`}
              >
                {isLoadingMore ? (
                  <div className='flex items-center justify-center gap-2'>
                    <div className='h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500' />
                    Loading...
                  </div>
                ) : (
                  `Load ${Math.min(3, dateGroups.length - visibleGroups)} more days`
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </ComponentErrorBoundary>
  )
}
