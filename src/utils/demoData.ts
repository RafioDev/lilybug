import type { TrackerEntry, ParentWellness, Profile } from '../types'

export const generateDemoProfile = (): Profile => ({
  id: 'demo-profile',
  baby_name: 'Emma',
  baby_birthdate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days ago
  parent1_name: 'Alex',
  parent2_name: 'Jordan',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
})

export const generateDemoTrackerEntries = (): TrackerEntry[] => {
  const entries: TrackerEntry[] = []
  const now = new Date()

  // Generate entries for the last 7 days
  for (let day = 0; day < 7; day++) {
    const dayStart = new Date(now.getTime() - day * 24 * 60 * 60 * 1000)

    // Generate 6-8 feeding entries per day
    const feedingCount = 6 + Math.floor(Math.random() * 3)
    for (let i = 0; i < feedingCount; i++) {
      const feedingTime = new Date(
        dayStart.getTime() + (i * 3 + Math.random() * 2) * 60 * 60 * 1000
      )
      entries.push({
        id: `feeding-${day}-${i}`,
        user_id: 'demo-user',
        entry_type: 'feeding',
        start_time: feedingTime.toISOString(),
        end_time: null,
        quantity:
          Math.random() > 0.5 ? Math.floor(60 + Math.random() * 120) : null,
        feeding_type: (
          ['bottle', 'breast_left', 'breast_right', 'both'] as const
        )[Math.floor(Math.random() * 4)],
        diaper_type: null,
        notes: null,
        created_at: feedingTime.toISOString(),
      })
    }

    // Generate 3-5 sleep entries per day
    const sleepCount = 3 + Math.floor(Math.random() * 3)
    for (let i = 0; i < sleepCount; i++) {
      const sleepStart = new Date(
        dayStart.getTime() + (i * 4 + 1 + Math.random() * 2) * 60 * 60 * 1000
      )
      const sleepDuration = 30 + Math.random() * 180 // 30-210 minutes
      const sleepEnd = new Date(
        sleepStart.getTime() + sleepDuration * 60 * 1000
      )

      entries.push({
        id: `sleep-${day}-${i}`,
        user_id: 'demo-user',
        entry_type: 'sleep',
        start_time: sleepStart.toISOString(),
        end_time: sleepEnd.toISOString(),
        quantity: null,
        feeding_type: null,
        diaper_type: null,
        notes: null,
        created_at: sleepStart.toISOString(),
      })
    }

    // Generate 6-10 diaper entries per day
    const diaperCount = 6 + Math.floor(Math.random() * 5)
    for (let i = 0; i < diaperCount; i++) {
      const diaperTime = new Date(
        dayStart.getTime() + (i * 2.5 + Math.random() * 1.5) * 60 * 60 * 1000
      )
      entries.push({
        id: `diaper-${day}-${i}`,
        user_id: 'demo-user',
        entry_type: 'diaper',
        start_time: diaperTime.toISOString(),
        end_time: null,
        quantity: null,
        feeding_type: null,
        diaper_type: (['wet', 'dirty', 'both'] as const)[
          Math.floor(Math.random() * 3)
        ],
        notes: null,
        created_at: diaperTime.toISOString(),
      })
    }
  }

  return entries.sort(
    (a, b) =>
      new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
  )
}

export const generateDemoWellnessEntries = (): ParentWellness[] => {
  const entries: ParentWellness[] = []
  const now = new Date()

  // Generate wellness entries for the last 14 days
  for (let day = 0; day < 14; day++) {
    const date = new Date(now.getTime() - day * 24 * 60 * 60 * 1000)
    const dateString = date.toISOString().split('T')[0]

    // Parent 1 entry
    entries.push({
      id: `wellness-p1-${day}`,
      user_id: 'demo-user',
      date: dateString,
      parent_name: 'parent1',
      mood_score: Math.floor(2 + Math.random() * 3), // 2-4 range
      sleep_hours: 3 + Math.random() * 4, // 3-7 hours
      journal_entry:
        day % 3 === 0
          ? 'Feeling tired but grateful for these precious moments.'
          : null,
      created_at: date.toISOString(),
    })

    // Parent 2 entry (sometimes)
    if (Math.random() > 0.3) {
      entries.push({
        id: `wellness-p2-${day}`,
        user_id: 'demo-user',
        date: dateString,
        parent_name: 'parent2',
        mood_score: Math.floor(2 + Math.random() * 3), // 2-4 range
        sleep_hours: 4 + Math.random() * 3, // 4-7 hours
        journal_entry:
          day % 4 === 0
            ? 'Learning so much about our little one every day.'
            : null,
        created_at: date.toISOString(),
      })
    }
  }

  return entries
}
