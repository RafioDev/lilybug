import type { TrackerEntry, EntryType, FeedingType, DiaperType } from '../types'
import { dateUtils } from './dateUtils'

export interface DateGroup {
  date: string // YYYY-MM-DD format
  displayDate: string // e.g., "Today", "Yesterday", "Oct 14, 2024"
  entries: TrackerEntry[]
  isToday: boolean
  isYesterday: boolean
}

export interface GroupedActivities {
  [date: string]: TrackerEntry[]
}

export interface ActivityDisplayData {
  duration?: string // e.g., "25 minutes", "2h 30m"
  quantity?: string // e.g., "4 oz", "120ml"
  details: string[] // Additional relevant information
  primaryText: string // Main display text
  secondaryText: string // Time/duration info
}

export const activityUtils = {
  /**
   * Get activity icon emoji
   */
  getActivityIcon(type: EntryType): string {
    switch (type) {
      case 'feeding':
        return '🍼'
      case 'sleep':
        return '😴'
      case 'diaper':
        return '👶'
      case 'pumping':
        return '🥛'
      default:
        return '📝'
    }
  },

  /**
   * Get feeding type label
   */
  getFeedingTypeLabel(type: FeedingType): string {
    switch (type) {
      case 'breast_left':
        return 'Breast Left'
      case 'breast_right':
        return 'Breast Right'
      case 'bottle':
        return 'Bottle'
      default:
        return 'Feeding'
    }
  },

  /**
   * Get diaper type label
   */
  getDiaperTypeLabel(type: DiaperType): string {
    switch (type) {
      case 'wet':
        return 'Wet'
      case 'dirty':
        return 'Dirty'
      case 'both':
        return 'Wet & Dirty'
      default:
        return 'Diaper'
    }
  },

  /**
   * Calculate duration for an entry
   */
  calculateEntryDuration(entry: TrackerEntry): string | null {
    return dateUtils.calculateAndFormatDuration(
      entry.start_time,
      entry.end_time
    )
  },

  /**
   * Format quantity for display
   */
  formatEntryQuantity(entry: TrackerEntry): string | null {
    if (!entry.quantity) return null
    return dateUtils.formatQuantity(entry.quantity, entry.entry_type)
  },

  /**
   * Get comprehensive activity display data
   */
  formatActivityDetails(entry: TrackerEntry): ActivityDisplayData {
    const duration = this.calculateEntryDuration(entry)
    const quantity = this.formatEntryQuantity(entry)
    const relativeTime = dateUtils.formatRelativeTime(entry.start_time)

    let primaryText = ''
    const secondaryText = relativeTime
    const details: string[] = []

    switch (entry.entry_type) {
      case 'feeding': {
        const feedingType = entry.feeding_type
          ? this.getFeedingTypeLabel(entry.feeding_type)
          : 'Feeding'

        primaryText = feedingType

        if (quantity) {
          primaryText += ` (${quantity})`
          details.push(`Amount: ${quantity}`)
        }

        if (!entry.end_time) {
          // In progress - show as ongoing
          primaryText += ' (in progress)'
          details.push('Status: In progress')
        } else if (duration) {
          // Completed - don't add duration to primary text, it will show in secondary
          details.push(`Duration: ${duration}`)
        }

        break
      }

      case 'sleep': {
        primaryText = 'Sleep'

        if (!entry.end_time) {
          // In progress - show as ongoing
          primaryText += ' (in progress)'
          details.push('Status: In progress')
        } else if (duration) {
          // Completed - don't add duration to primary text, it will show in secondary
          details.push(`Duration: ${duration}`)
        }

        break
      }

      case 'diaper': {
        const diaperType = entry.diaper_type
          ? this.getDiaperTypeLabel(entry.diaper_type)
          : 'Diaper'

        primaryText = `${diaperType} diaper change`
        details.push(`Type: ${diaperType}`)

        break
      }

      case 'pumping': {
        primaryText = 'Pumping'

        if (quantity) {
          primaryText += ` (${quantity})`
          details.push(`Amount: ${quantity}`)
        }

        if (duration) {
          primaryText += ` for ${duration}`
          details.push(`Duration: ${duration}`)
        }

        break
      }

      default: {
        primaryText = entry.entry_type
        break
      }
    }

    // Add notes to details if present
    if (entry.notes) {
      details.push(`Notes: ${entry.notes}`)
    }

    // Add start time to details
    details.push(`Started: ${new Date(entry.start_time).toLocaleString()}`)

    // Add end time to details if present
    if (entry.end_time) {
      details.push(`Ended: ${new Date(entry.end_time).toLocaleString()}`)
    }

    return {
      duration: duration ?? undefined,
      quantity: quantity ?? undefined,
      details,
      primaryText,
      secondaryText,
    }
  },

  /**
   * Get simple activity description (for backward compatibility)
   */
  getEntryDetails(entry: TrackerEntry): string {
    const { primaryText } = this.formatActivityDetails(entry)
    return primaryText
  },

  /**
   * Format entry time (for backward compatibility)
   */
  formatEntryTime(entry: TrackerEntry): string {
    return dateUtils.formatRelativeTime(entry.start_time)
  },

  /**
   * Check if entry has duration data
   */
  hasDuration(entry: TrackerEntry): boolean {
    return Boolean(entry.end_time)
  },

  /**
   * Check if entry has quantity data
   */
  hasQuantity(entry: TrackerEntry): boolean {
    return Boolean(entry.quantity)
  },

  /**
   * Get entry type color for UI
   */
  getEntryTypeColor(type: EntryType): string {
    switch (type) {
      case 'feeding':
        return 'blue'
      case 'sleep':
        return 'cyan'
      case 'diaper':
        return 'emerald'
      case 'pumping':
        return 'pink'
      default:
        return 'gray'
    }
  },

  /**
   * Get date string in YYYY-MM-DD format from timestamp
   */
  getDateString(timestamp: string): string {
    const date = new Date(timestamp)
    // Use local time instead of UTC to avoid timezone issues
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  },

  /**
   * Check if a date string represents today
   */
  isToday(dateString: string): boolean {
    const today = new Date().toISOString().split('T')[0]
    return dateString === today
  },

  /**
   * Check if a date string represents yesterday
   */
  isYesterday(dateString: string): boolean {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayString = yesterday.toISOString().split('T')[0]
    return dateString === yesterdayString
  },

  /**
   * Format date string for display
   */
  formatDateForDisplay(dateString: string): string {
    if (this.isYesterday(dateString)) {
      return 'Yesterday'
    }

    // Format as "Oct 14, 2024" for all dates including today
    // Today will be indicated by the badge in the UI
    const date = new Date(dateString + 'T00:00:00')
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  },

  /**
   * Group activities by date
   */
  groupActivitiesByDate(entries: TrackerEntry[]): DateGroup[] {
    // First, group entries by date string
    const grouped: GroupedActivities = {}

    entries.forEach((entry) => {
      const dateString = this.getDateString(entry.start_time)
      if (!grouped[dateString]) {
        grouped[dateString] = []
      }
      grouped[dateString].push(entry)
    })

    // Convert to DateGroup array and sort
    const dateGroups: DateGroup[] = Object.entries(grouped)
      .map(([dateString, entries]) => ({
        date: dateString,
        displayDate: this.formatDateForDisplay(dateString),
        entries: entries.sort(
          (a, b) =>
            new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
        ), // Sort entries within each day (newest first)
        isToday: this.isToday(dateString),
        isYesterday: this.isYesterday(dateString),
      }))
      .sort((a, b) => b.date.localeCompare(a.date)) // Sort groups by date (newest first)

    return dateGroups
  },

  /**
   * Get total count of entries across all groups
   */
  getTotalEntryCount(dateGroups: DateGroup[]): number {
    return dateGroups.reduce((total, group) => total + group.entries.length, 0)
  },

  /**
   * Get entries for a specific date
   */
  getEntriesForDate(
    entries: TrackerEntry[],
    dateString: string
  ): TrackerEntry[] {
    return entries.filter(
      (entry) => this.getDateString(entry.start_time) === dateString
    )
  },

  /**
   * Check if an entry is in progress
   */
  isInProgress(entry: TrackerEntry): boolean {
    return (
      (entry.entry_type === 'feeding' || entry.entry_type === 'sleep') &&
      !entry.end_time
    )
  },

  /**
   * Calculate real-time elapsed duration for in-progress activities
   */
  calculateElapsedDuration(startTime: string): string {
    const start = new Date(startTime)
    const now = new Date()
    const diffMs = now.getTime() - start.getTime()

    const minutes = Math.floor(diffMs / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}min`
    }
    return `${minutes} min`
  },

  /**
   * Format duration in human-readable format
   */
  formatDuration(durationMs: number): string {
    const minutes = Math.floor(durationMs / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}min`
    }
    return `${minutes} min`
  },
}
