import type { TrackerEntry, Baby } from '../types'
import { aiPatternService } from './aiPatternService'

export interface ContextualGuidance {
  message: string
  type: 'insight' | 'encouragement' | 'alert' | 'milestone'
  timestamp: Date
}

export const aiAssistantService = {
  generateContextualGuidance(
    entries: TrackerEntry[],
    baby: Baby
  ): ContextualGuidance[] {
    const guidance: ContextualGuidance[] = []
    const now = new Date()

    // Recent activity analysis
    const recentEntries = entries.filter((entry) => {
      const entryTime = new Date(entry.start_time)
      const hoursDiff = (now.getTime() - entryTime.getTime()) / (1000 * 60 * 60)
      return hoursDiff <= 24
    })

    // Sleep insights
    const recentSleep = recentEntries.filter((e) => e.entry_type === 'sleep')
    if (recentSleep.length === 0) {
      const lastSleep = entries.find((e) => e.entry_type === 'sleep')
      if (lastSleep) {
        const hoursSinceLastSleep =
          (now.getTime() - new Date(lastSleep.start_time).getTime()) /
          (1000 * 60 * 60)
        if (hoursSinceLastSleep > 4) {
          guidance.push({
            message: `${baby.name} hasn't had a recorded sleep in ${Math.round(
              hoursSinceLastSleep
            )} hours. Consider checking if they're showing sleepy cues.`,
            type: 'insight',
            timestamp: now,
          })
        }
      }
    }

    // Feeding insights
    const recentFeedings = recentEntries.filter(
      (e) => e.entry_type === 'feeding'
    )
    if (recentFeedings.length >= 6) {
      guidance.push({
        message: `${baby.name} has fed ${recentFeedings.length} times today. This could indicate a growth spurt - completely normal!`,
        type: 'insight',
        timestamp: now,
      })
    }

    // Milestone encouragement based on age
    const babyAge = Math.floor(
      (Date.now() - new Date(baby.birthdate + 'T00:00:00').getTime()) /
        (1000 * 60 * 60 * 24)
    )

    if (babyAge === 7) {
      guidance.push({
        message: `🎉 ${baby.name} is one week old today! You're doing an amazing job navigating this first week together.`,
        type: 'milestone',
        timestamp: now,
      })
    }

    if (babyAge === 30) {
      guidance.push({
        message: `🎉 Happy one month to ${baby.name}! You've both learned so much in these first 30 days.`,
        type: 'milestone',
        timestamp: now,
      })
    }

    // Encouragement based on tracking consistency
    const trackingDays = new Set(
      entries.map((entry) => new Date(entry.start_time).toDateString())
    ).size

    if (trackingDays >= 7) {
      guidance.push({
        message: `You've been consistently tracking for ${trackingDays} days! This data is helping you understand ${baby.name}'s patterns better.`,
        type: 'encouragement',
        timestamp: now,
      })
    }

    return guidance.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    )
  },

  predictNextActivity(entries: TrackerEntry[]): {
    activity: 'feeding' | 'sleep' | 'diaper'
    estimatedTime: Date
    confidence: number
  } | null {
    const insights = aiPatternService.generateInsights(entries, [])

    const predictions = []

    // Predict next feeding
    if (insights.feedingPattern.predictedNextFeeding) {
      predictions.push({
        activity: 'feeding' as const,
        estimatedTime: insights.feedingPattern.predictedNextFeeding,
        confidence: Math.min(
          0.8,
          entries.filter((e) => e.entry_type === 'feeding').length / 10
        ),
      })
    }

    // Predict next sleep
    if (insights.sleepPattern.predictedNextSleep) {
      predictions.push({
        activity: 'sleep' as const,
        estimatedTime: insights.sleepPattern.predictedNextSleep,
        confidence: Math.min(
          0.7,
          entries.filter((e) => e.entry_type === 'sleep').length / 15
        ),
      })
    }

    // Return the prediction with highest confidence that's in the future
    const futurePredictions = predictions.filter(
      (p) => p.estimatedTime > new Date()
    )
    if (futurePredictions.length === 0) return null

    return futurePredictions.sort((a, b) => b.confidence - a.confidence)[0]
  },
}
