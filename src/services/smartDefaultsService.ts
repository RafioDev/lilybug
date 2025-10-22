import type { TrackerEntry, EntryType, FeedingType, DiaperType } from '../types'

export interface SmartDefaults {
  entryType?: EntryType
  feedingType?: FeedingType
  diaperType?: DiaperType
  quantity?: number
  startTime?: string
  endTime?: string
  notes?: string
}

export interface TimeContext {
  hour: number
  dayOfWeek: number
  timeSinceLastEntry: number
  isNightTime: boolean
}

export interface EntryTypeSuggestion {
  entryType: EntryType
  confidence: number
  reason: string
}

export class SmartDefaultsEngine {
  private static readonly NIGHT_HOURS = { start: 22, end: 6 }
  // Future use: feeding intervals by age
  // private static readonly FEEDING_INTERVALS = {
  //   newborn: 2, // hours
  //   infant: 3,
  //   toddler: 4,
  // }

  /**
   * Calculate smart defaults for a given entry type based on recent entries and time context
   */
  calculateDefaults(
    entryType: EntryType,
    recentEntries: TrackerEntry[],
    timeContext: TimeContext
  ): SmartDefaults {
    const defaults: SmartDefaults = {
      entryType,
      startTime: new Date().toISOString().slice(0, 16), // Current time in datetime-local format
    }

    // Get entries of the same type for pattern analysis
    const sameTypeEntries = recentEntries.filter(
      (entry) => entry.entry_type === entryType
    )

    switch (entryType) {
      case 'feeding':
        return this.calculateFeedingDefaults(
          defaults,
          sameTypeEntries,
          timeContext
        )
      case 'diaper':
        return this.calculateDiaperDefaults(
          defaults,
          sameTypeEntries,
          timeContext
        )
      case 'sleep':
        return this.calculateSleepDefaults(
          defaults,
          sameTypeEntries,
          timeContext
        )
      case 'pumping':
        return this.calculatePumpingDefaults(
          defaults,
          sameTypeEntries,
          timeContext
        )
      default:
        return defaults
    }
  }

  /**
   * Calculate feeding-specific defaults
   */
  private calculateFeedingDefaults(
    defaults: SmartDefaults,
    feedingEntries: TrackerEntry[],
    timeContext: TimeContext
  ): SmartDefaults {
    // Determine most common feeding type
    const feedingTypes = feedingEntries
      .filter((entry) => entry.feeding_type)
      .map((entry) => entry.feeding_type!)

    if (feedingTypes.length > 0) {
      defaults.feedingType = this.getMostCommon(feedingTypes)
    } else {
      // Default based on time of day
      defaults.feedingType = timeContext.isNightTime ? 'bottle' : 'breast_left'
    }

    // Calculate average quantity for bottle feeding
    if (defaults.feedingType === 'bottle') {
      const bottleFeedings = feedingEntries.filter(
        (entry) => entry.feeding_type === 'bottle' && entry.quantity
      )

      if (bottleFeedings.length > 0) {
        const avgQuantity =
          bottleFeedings.reduce(
            (sum, entry) => sum + (entry.quantity || 0),
            0
          ) / bottleFeedings.length
        defaults.quantity = Math.round(avgQuantity * 2) / 2 // Round to nearest 0.5
      } else {
        // Default quantity based on time patterns
        defaults.quantity = timeContext.isNightTime ? 3 : 4
      }
    }

    // Don't auto-set end time for feeding - let user track in-progress activities

    return defaults
  }

  /**
   * Calculate diaper-specific defaults
   */
  private calculateDiaperDefaults(
    defaults: SmartDefaults,
    diaperEntries: TrackerEntry[],
    timeContext: TimeContext
  ): SmartDefaults {
    // Analyze recent diaper patterns
    const diaperTypes = diaperEntries
      .filter((entry) => entry.diaper_type)
      .map((entry) => entry.diaper_type!)

    if (diaperTypes.length > 0) {
      defaults.diaperType = this.getMostCommon(diaperTypes)
    } else {
      // Default based on time of day
      defaults.diaperType = timeContext.isNightTime ? 'wet' : 'both'
    }

    return defaults
  }

  /**
   * Calculate sleep-specific defaults
   */
  private calculateSleepDefaults(
    defaults: SmartDefaults,
    _sleepEntries: TrackerEntry[],
    _timeContext: TimeContext
  ): SmartDefaults {
    // Don't auto-set end time for sleep - let user track in-progress activities

    return defaults
  }

  /**
   * Calculate pumping-specific defaults
   */
  private calculatePumpingDefaults(
    defaults: SmartDefaults,
    pumpingEntries: TrackerEntry[],
    timeContext: TimeContext
  ): SmartDefaults {
    // Calculate average pumping quantity
    const quantities = pumpingEntries
      .filter((entry) => entry.quantity)
      .map((entry) => entry.quantity!)

    if (quantities.length > 0) {
      const avgQuantity =
        quantities.reduce((sum, qty) => sum + qty, 0) / quantities.length
      defaults.quantity = Math.round(avgQuantity * 2) / 2 // Round to nearest 0.5
    } else {
      // Default quantity based on time patterns
      defaults.quantity = timeContext.isNightTime ? 2 : 3
    }

    return defaults
  }

  /**
   * Get time-based suggestions for entry types
   */
  getTimeBasedSuggestions(hour: number): EntryTypeSuggestion[] {
    const suggestions: EntryTypeSuggestion[] = []

    // Morning suggestions (6-10 AM)
    if (hour >= 6 && hour < 10) {
      suggestions.push(
        {
          entryType: 'feeding',
          confidence: 0.8,
          reason: 'Morning feeding time',
        },
        {
          entryType: 'diaper',
          confidence: 0.7,
          reason: 'Morning diaper change',
        }
      )
    }
    // Midday suggestions (10 AM - 2 PM)
    else if (hour >= 10 && hour < 14) {
      suggestions.push(
        { entryType: 'sleep', confidence: 0.6, reason: 'Nap time' },
        { entryType: 'feeding', confidence: 0.7, reason: 'Midday feeding' }
      )
    }
    // Afternoon suggestions (2-6 PM)
    else if (hour >= 14 && hour < 18) {
      suggestions.push(
        { entryType: 'feeding', confidence: 0.7, reason: 'Afternoon feeding' },
        {
          entryType: 'diaper',
          confidence: 0.6,
          reason: 'Afternoon diaper change',
        }
      )
    }
    // Evening suggestions (6-10 PM)
    else if (hour >= 18 && hour < 22) {
      suggestions.push(
        { entryType: 'feeding', confidence: 0.8, reason: 'Evening feeding' },
        { entryType: 'sleep', confidence: 0.7, reason: 'Bedtime preparation' }
      )
    }
    // Night suggestions (10 PM - 6 AM)
    else {
      suggestions.push(
        { entryType: 'feeding', confidence: 0.9, reason: 'Night feeding' },
        { entryType: 'diaper', confidence: 0.8, reason: 'Night diaper change' }
      )
    }

    return suggestions.sort((a, b) => b.confidence - a.confidence)
  }

  /**
   * Update patterns based on new entry (for future learning)
   */
  updatePatterns(newEntry: TrackerEntry): void {
    // This method can be extended in the future to store learned patterns
    // For now, it's a placeholder for pattern learning functionality
    console.log('Pattern updated with new entry:', newEntry.entry_type)
  }

  /**
   * Create time context from current time and recent entries
   */
  createTimeContext(recentEntries: TrackerEntry[]): TimeContext {
    const now = new Date()
    const hour = now.getHours()
    const dayOfWeek = now.getDay()
    const isNightTime =
      hour >= SmartDefaultsEngine.NIGHT_HOURS.start ||
      hour < SmartDefaultsEngine.NIGHT_HOURS.end

    // Calculate time since last entry
    let timeSinceLastEntry = 0
    if (recentEntries.length > 0) {
      const lastEntry = recentEntries[0] // Assuming entries are sorted by time desc
      const lastEntryTime = new Date(lastEntry.start_time)
      timeSinceLastEntry =
        (now.getTime() - lastEntryTime.getTime()) / (1000 * 60 * 60) // hours
    }

    return {
      hour,
      dayOfWeek,
      timeSinceLastEntry,
      isNightTime,
    }
  }

  /**
   * Utility method to find the most common item in an array
   */
  private getMostCommon<T>(items: T[]): T {
    const counts = items.reduce(
      (acc, item) => {
        acc[item as string] = (acc[item as string] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    return Object.entries(counts).reduce((a, b) =>
      counts[a[0]] > counts[b[0]] ? a : b
    )[0] as T
  }
}

// Export a singleton instance
export const smartDefaultsEngine = new SmartDefaultsEngine()
