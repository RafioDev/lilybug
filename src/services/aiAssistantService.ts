import type { TrackerEntry, ParentWellness, Profile, Baby } from '../types'
import { aiPatternService } from './aiPatternService'

export interface PersonalizedTip {
  id: string
  title: string
  content: string
  category: 'sleep' | 'feeding' | 'wellness' | 'development' | 'general'
  priority: 'high' | 'medium' | 'low'
  isPersonalized: boolean
  basedOn: string[]
}

export interface ContextualGuidance {
  message: string
  type: 'insight' | 'encouragement' | 'alert' | 'milestone'
  timestamp: Date
}

export const aiAssistantService = {
  generatePersonalizedTips(
    baby: Baby,
    entries: TrackerEntry[],
    wellness: ParentWellness[]
  ): PersonalizedTip[] {
    const tips: PersonalizedTip[] = []
    const insights = aiPatternService.generateInsights(entries, wellness)

    // Calculate baby's age in days
    const babyAge = Math.floor(
      (Date.now() - new Date(baby.birthdate + 'T00:00:00').getTime()) /
        (1000 * 60 * 60 * 24)
    )

    // Sleep-based personalized tips
    if (insights.sleepPattern.trend === 'declining') {
      tips.push({
        id: 'sleep-decline-' + Date.now(),
        title: 'Sleep Pattern Changes Detected',
        content: `${baby.name}'s sleep has been shorter lately (avg ${insights.sleepPattern.averageSleepDuration} min). This could be a growth spurt or developmental leap. Try maintaining consistent routines and consider if any environmental factors have changed.`,
        category: 'sleep',
        priority: 'high',
        isPersonalized: true,
        basedOn: ['sleep_patterns', 'recent_trends'],
      })
    }

    if (insights.sleepPattern.averageSleepDuration > 120 && babyAge < 90) {
      tips.push({
        id: 'good-sleeper-' + Date.now(),
        title: 'Great Sleep Progress!',
        content: `${baby.name} is sleeping well with an average of ${
          Math.round((insights.sleepPattern.averageSleepDuration / 60) * 10) /
          10
        } hours per session. Keep up the good bedtime routine!`,
        category: 'sleep',
        priority: 'low',
        isPersonalized: true,
        basedOn: ['sleep_duration', 'baby_age'],
      })
    }

    // Feeding-based personalized tips
    if (
      insights.feedingPattern.trend === 'increasing' &&
      insights.feedingPattern.feedingFrequency > 10
    ) {
      tips.push({
        id: 'cluster-feeding-' + Date.now(),
        title: 'Cluster Feeding Period',
        content: `${
          baby.name
        } has been feeding more frequently (${insights.feedingPattern.feedingFrequency.toFixed(
          1
        )} times/day). This is normal during growth spurts, usually lasting 2-3 days. Stay hydrated and rest when possible.`,
        category: 'feeding',
        priority: 'medium',
        isPersonalized: true,
        basedOn: ['feeding_frequency', 'feeding_trends'],
      })
    }

    // Age-specific personalized tips
    if (babyAge >= 14 && babyAge <= 21) {
      const recentSleep = entries
        .filter((e) => e.entry_type === 'sleep')
        .slice(0, 10)

      if (recentSleep.length > 0) {
        tips.push({
          id: 'two-week-growth-' + Date.now(),
          title: '2-Week Growth Spurt Expected',
          content: `${baby.name} is approaching the 2-week growth spurt. You might notice increased feeding and fussiness. This typically lasts 2-3 days. Your milk supply will adjust naturally.`,
          category: 'development',
          priority: 'medium',
          isPersonalized: true,
          basedOn: ['baby_age', 'growth_spurt_timing'],
        })
      }
    }

    // Parent wellness-based tips
    const recentWellness = wellness.slice(0, 3)
    if (recentWellness.length > 0) {
      const avgMood =
        recentWellness.reduce((sum, w) => sum + w.mood_score, 0) /
        recentWellness.length

      if (avgMood < 3) {
        tips.push({
          id: 'wellness-support-' + Date.now(),
          title: 'Taking Care of Yourself',
          content: `Your recent mood scores suggest you might be having a tough time. Remember that asking for help is a sign of strength, not weakness. Consider reaching out to family, friends, or your healthcare provider.`,
          category: 'wellness',
          priority: 'high',
          isPersonalized: true,
          basedOn: ['parent_mood', 'wellness_tracking'],
        })
      }

      const lowSleepDays = recentWellness.filter(
        (w) => w.sleep_hours && w.sleep_hours < 4
      ).length
      if (lowSleepDays >= 2) {
        tips.push({
          id: 'parent-sleep-' + Date.now(),
          title: 'Prioritize Your Rest',
          content: `You've had limited sleep recently. Try to nap when ${baby.name} sleeps, even if just for 20 minutes. Consider asking someone to watch the baby while you rest.`,
          category: 'wellness',
          priority: 'high',
          isPersonalized: true,
          basedOn: ['parent_sleep', 'wellness_tracking'],
        })
      }
    }

    return tips
  },

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
