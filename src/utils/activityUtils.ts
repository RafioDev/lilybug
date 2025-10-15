import type { TrackerEntry, EntryType, FeedingType, DiaperType } from '../types'
import { dateUtils } from './dateUtils'

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
      case 'both':
        return 'Both Breasts'
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

        if (duration) {
          primaryText += ` for ${duration}`
          details.push(`Duration: ${duration}`)
        }

        break
      }

      case 'sleep': {
        primaryText = 'Sleep'

        if (duration) {
          primaryText += ` for ${duration}`
          details.push(`Duration: ${duration}`)
        } else if (entry.end_time) {
          primaryText += ' (completed)'
        } else {
          primaryText += ' (in progress)'
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
      duration,
      quantity,
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
}
