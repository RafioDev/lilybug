import { supabase } from '../lib/supabase'
import type {
  TrackerEntry,
  NewTrackerEntry,
  UpdateTrackerEntry,
} from '../types'

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

  async getEntry(id: string): Promise<TrackerEntry> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('tracker_entries')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) throw error
    if (!data) throw new Error('Entry not found')
    return data
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

  async updateEntry(
    id: string,
    updates: UpdateTrackerEntry
  ): Promise<TrackerEntry> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Validate that we have something to update
    if (Object.keys(updates).length === 0) {
      throw new Error('No updates provided')
    }

    // First verify the entry belongs to the current user and get current entry type
    const { data: existingEntry, error: fetchError } = await supabase
      .from('tracker_entries')
      .select('user_id, entry_type')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError
    if (!existingEntry) throw new Error('Entry not found')
    if (existingEntry.user_id !== user.id) throw new Error('Unauthorized')

    // Validate updates based on entry type
    const entryType = updates.entry_type || existingEntry.entry_type

    // Clean up type-specific fields that don't apply
    const cleanedUpdates = { ...updates }
    if (entryType !== 'feeding') {
      delete cleanedUpdates.feeding_type
    }
    if (entryType !== 'diaper') {
      delete cleanedUpdates.diaper_type
    }
    if (entryType !== 'feeding' && entryType !== 'pumping') {
      delete cleanedUpdates.quantity
    }

    // Update the entry
    const { data, error } = await supabase
      .from('tracker_entries')
      .update(cleanedUpdates)
      .eq('id', id)
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
