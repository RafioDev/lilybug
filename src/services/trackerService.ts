import { supabase } from '../lib/supabase'
import type { TrackerEntry, NewTrackerEntry } from '../types'

export const trackerService = {
  async getEntries(limit = 50, babyId?: string): Promise<TrackerEntry[]> {
    let query = supabase
      .from('tracker_entries')
      .select('*')
      .order('start_time', { ascending: false })
      .limit(limit)

    if (babyId) {
      query = query.eq('baby_id', babyId)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  },

  async createEntry(entry: NewTrackerEntry): Promise<TrackerEntry> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('tracker_entries')
      .insert({
        user_id: user.id,
        ...entry,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteEntry(id: string): Promise<void> {
    const { error } = await supabase
      .from('tracker_entries')
      .delete()
      .eq('id', id)

    if (error) throw error
  },
}
