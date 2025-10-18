import { supabase } from '../lib/supabase'
import type { ParentWellness, NewWellnessEntry } from '../types'

export const wellnessService = {
  async getWellnessForDate(date: string): Promise<ParentWellness[]> {
    const { data, error } = await supabase
      .from('parent_wellness')
      .select('*')
      .eq('date', date)

    if (error) throw error
    return data || []
  },

  async createOrUpdateWellness(
    entry: NewWellnessEntry
  ): Promise<ParentWellness> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('parent_wellness')
      .upsert(
        {
          user_id: user.id,
          ...entry,
        },
        {
          onConflict: 'user_id,date,parent_name',
        }
      )
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getRecentWellness(days = 7): Promise<ParentWellness[]> {
    const { data, error } = await supabase
      .from('parent_wellness')
      .select('*')
      .order('date', { ascending: false })
      .limit(days * 2)

    if (error) throw error
    return data || []
  },
}
