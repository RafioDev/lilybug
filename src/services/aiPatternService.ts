import type { TrackerEntry, ParentWellness } from '../types'

export interface SleepPattern {
  averageSleepDuration: number
  longestSleep: number
  shortestSleep: number
  totalSleepTime: number
  sleepEfficiency: number
  predictedNextSleep?: Date
  trend: 'improving' | 'declining' | 'stable'
}

export interface FeedingPattern {
  averageInterval: number
  averageQuantity: number
  mostCommonType: string
  feedingFrequency: number
  predictedNextFeeding?: Date
  trend: 'increasing' | 'decreasing' | 'stable'
}

export interface PatternInsights {
  sleepPattern: SleepPattern
  feedingPattern: FeedingPattern
  recommendations: string[]
  alerts: string[]
}

export const aiPatternService = {
  analyzeSleepPatterns(entries: TrackerEntry[]): SleepPattern {
    const sleepEntries = entries.filter(
      (e) => e.entry_type === 'sleep' && e.end_time
    )

    if (sleepEntries.length === 0) {
      return {
        averageSleepDuration: 0,
        longestSleep: 0,
        shortestSleep: 0,
        totalSleepTime: 0,
        sleepEfficiency: 0,
        trend: 'stable',
      }
    }

    const durations = sleepEntries.map((entry) => {
      const start = new Date(entry.start_time)
      const end = new Date(entry.end_time!)
      return (end.getTime() - start.getTime()) / (1000 * 60) // minutes
    })

    const totalSleep = durations.reduce((sum, duration) => sum + duration, 0)
    const averageDuration = totalSleep / durations.length
    const longestSleep = Math.max(...durations)
    const shortestSleep = Math.min(...durations)

    // Calculate trend by comparing recent vs older entries
    const recentEntries = sleepEntries.slice(
      0,
      Math.floor(sleepEntries.length / 2)
    )
    const olderEntries = sleepEntries.slice(Math.floor(sleepEntries.length / 2))

    let trend: 'improving' | 'declining' | 'stable' = 'stable'
    if (recentEntries.length > 0 && olderEntries.length > 0) {
      const recentAvg =
        recentEntries.reduce((sum, entry) => {
          const start = new Date(entry.start_time)
          const end = new Date(entry.end_time!)
          return sum + (end.getTime() - start.getTime()) / (1000 * 60)
        }, 0) / recentEntries.length

      const olderAvg =
        olderEntries.reduce((sum, entry) => {
          const start = new Date(entry.start_time)
          const end = new Date(entry.end_time!)
          return sum + (end.getTime() - start.getTime()) / (1000 * 60)
        }, 0) / olderEntries.length

      if (recentAvg > olderAvg * 1.1) trend = 'improving'
      else if (recentAvg < olderAvg * 0.9) trend = 'declining'
    }

    // Predict next sleep based on average interval
    let predictedNextSleep: Date | undefined
    if (sleepEntries.length >= 2) {
      const lastSleep = new Date(sleepEntries[0].end_time!)
      const intervals = []
      for (let i = 0; i < sleepEntries.length - 1; i++) {
        const current = new Date(sleepEntries[i].start_time)
        const next = new Date(sleepEntries[i + 1].start_time)
        intervals.push((current.getTime() - next.getTime()) / (1000 * 60 * 60)) // hours
      }
      const avgInterval =
        intervals.reduce((sum, interval) => sum + interval, 0) /
        intervals.length
      predictedNextSleep = new Date(
        lastSleep.getTime() + avgInterval * 60 * 60 * 1000
      )
    }

    return {
      averageSleepDuration: Math.round(averageDuration),
      longestSleep: Math.round(longestSleep),
      shortestSleep: Math.round(shortestSleep),
      totalSleepTime: Math.round(totalSleep),
      sleepEfficiency: Math.round((totalSleep / (24 * 60)) * 100), // % of day spent sleeping
      predictedNextSleep,
      trend,
    }
  },

  analyzeFeedingPatterns(entries: TrackerEntry[]): FeedingPattern {
    const feedingEntries = entries.filter((e) => e.entry_type === 'feeding')

    if (feedingEntries.length === 0) {
      return {
        averageInterval: 0,
        averageQuantity: 0,
        mostCommonType: 'bottle',
        feedingFrequency: 0,
        trend: 'stable',
      }
    }

    // Calculate intervals between feedings
    const intervals = []
    for (let i = 0; i < feedingEntries.length - 1; i++) {
      const current = new Date(feedingEntries[i].start_time)
      const next = new Date(feedingEntries[i + 1].start_time)
      intervals.push((current.getTime() - next.getTime()) / (1000 * 60 * 60)) // hours
    }

    const averageInterval =
      intervals.length > 0
        ? intervals.reduce((sum, interval) => sum + interval, 0) /
          intervals.length
        : 0

    // Calculate average quantity
    const quantityEntries = feedingEntries.filter((e) => e.quantity)
    const averageQuantity =
      quantityEntries.length > 0
        ? quantityEntries.reduce(
            (sum, entry) => sum + (entry.quantity || 0),
            0
          ) / quantityEntries.length
        : 0

    // Find most common feeding type
    const typeCounts = feedingEntries.reduce(
      (counts, entry) => {
        const type = entry.feeding_type || 'bottle'
        counts[type] = (counts[type] || 0) + 1
        return counts
      },
      {} as Record<string, number>
    )

    const mostCommonType =
      Object.entries(typeCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ||
      'bottle'

    // Calculate feeding frequency (feedings per day)
    const daySpan =
      feedingEntries.length > 1
        ? (new Date(feedingEntries[0].start_time).getTime() -
            new Date(
              feedingEntries[feedingEntries.length - 1].start_time
            ).getTime()) /
          (1000 * 60 * 60 * 24)
        : 1
    const feedingFrequency = feedingEntries.length / Math.max(daySpan, 1)

    // Calculate trend
    const recentEntries = feedingEntries.slice(
      0,
      Math.floor(feedingEntries.length / 2)
    )
    const olderEntries = feedingEntries.slice(
      Math.floor(feedingEntries.length / 2)
    )

    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable'
    if (recentEntries.length > 0 && olderEntries.length > 0) {
      const recentFreq = recentEntries.length
      const olderFreq = olderEntries.length

      if (recentFreq > olderFreq * 1.2) trend = 'increasing'
      else if (recentFreq < olderFreq * 0.8) trend = 'decreasing'
    }

    // Predict next feeding
    let predictedNextFeeding: Date | undefined
    if (feedingEntries.length >= 1) {
      const lastFeeding = new Date(feedingEntries[0].start_time)
      predictedNextFeeding = new Date(
        lastFeeding.getTime() + averageInterval * 60 * 60 * 1000
      )
    }

    return {
      averageInterval: Math.round(averageInterval * 10) / 10,
      averageQuantity: Math.round(averageQuantity * 10) / 10,
      mostCommonType,
      feedingFrequency: Math.round(feedingFrequency * 10) / 10,
      predictedNextFeeding,
      trend,
    }
  },

  generateInsights(
    entries: TrackerEntry[],
    wellness: ParentWellness[]
  ): PatternInsights {
    const sleepPattern = this.analyzeSleepPatterns(entries)
    const feedingPattern = this.analyzeFeedingPatterns(entries)

    const recommendations: string[] = []
    const alerts: string[] = []

    // Sleep recommendations
    if (sleepPattern.averageSleepDuration < 60) {
      recommendations.push(
        'Consider implementing a consistent bedtime routine to help extend sleep periods'
      )
    }
    if (sleepPattern.trend === 'declining') {
      alerts.push(
        'Sleep patterns show a declining trend - monitor for potential sleep regression'
      )
    }
    if (sleepPattern.sleepEfficiency < 30) {
      recommendations.push(
        'Baby may benefit from more structured nap times during the day'
      )
    }

    // Feeding recommendations
    if (feedingPattern.averageInterval < 1.5) {
      recommendations.push(
        'Frequent feeding may indicate a growth spurt or cluster feeding period'
      )
    }
    if (feedingPattern.trend === 'increasing') {
      recommendations.push(
        'Increased feeding frequency is normal during growth spurts'
      )
    }

    // Parent wellness insights
    const recentWellness = wellness.slice(0, 7) // Last 7 entries
    if (recentWellness.length > 0) {
      const avgMood =
        recentWellness.reduce((sum, w) => sum + w.mood_score, 0) /
        recentWellness.length
      if (avgMood < 3) {
        alerts.push(
          'Your mood scores have been low recently - consider reaching out for support'
        )
      }

      const avgSleep =
        recentWellness
          .filter((w) => w.sleep_hours)
          .reduce((sum, w) => sum + (w.sleep_hours || 0), 0) /
        recentWellness.filter((w) => w.sleep_hours).length

      if (avgSleep < 4) {
        recommendations.push(
          'Try to rest when baby sleeps - your sleep is important for recovery'
        )
      }
    }

    return {
      sleepPattern,
      feedingPattern,
      recommendations,
      alerts,
    }
  },
}
