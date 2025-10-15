export interface Profile {
  id: string
  parent1_name: string
  parent2_name?: string | null
  active_baby_id?: string | null
  created_at: string
  updated_at: string
}

export interface Baby {
  id: string
  user_id: string
  name: string
  birthdate: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export type EntryType = 'feeding' | 'sleep' | 'diaper' | 'pumping'
export type FeedingType = 'bottle' | 'breast_left' | 'breast_right' | 'both'
export type DiaperType = 'wet' | 'dirty' | 'both'

export interface TrackerEntry {
  id: string
  user_id: string
  baby_id: string
  entry_type: EntryType
  start_time: string
  end_time?: string | null
  quantity?: number | null
  feeding_type?: FeedingType | null
  diaper_type?: DiaperType | null
  notes?: string | null
  created_at: string
}

export interface ParentWellness {
  id: string
  user_id: string
  date: string
  parent_name: string
  mood_score: number
  sleep_hours?: number | null
  journal_entry?: string | null
  created_at: string
}

export interface NewTrackerEntry {
  baby_id: string
  entry_type: EntryType
  start_time?: string
  end_time?: string | null
  quantity?: number | null
  feeding_type?: FeedingType | null
  diaper_type?: DiaperType | null
  notes?: string | null
}

export interface UpdateTrackerEntry {
  entry_type?: EntryType
  start_time?: string
  end_time?: string | null
  quantity?: number | null
  feeding_type?: FeedingType | null
  diaper_type?: DiaperType | null
  notes?: string | null
}

export interface NewWellnessEntry {
  date: string
  parent_name: string
  mood_score: number
  sleep_hours?: number | null
  journal_entry?: string | null
}
