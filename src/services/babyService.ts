import { supabase } from '../lib/supabase'
import type { Baby } from '../types'

export const babyService = {
  async getBabies(): Promise<Baby[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('babies')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data || []
  },

  async getActiveBaby(): Promise<Baby | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('babies')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle()

    if (error) throw error
    return data
  },

  async createBaby(
    baby: Omit<Baby, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ): Promise<Baby> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // If this is the first baby, make it active
    const existingBabies = await this.getBabies()
    const isFirstBaby = existingBabies.length === 0

    const { data, error } = await supabase
      .from('babies')
      .insert({
        user_id: user.id,
        ...baby,
        is_active: isFirstBaby || baby.is_active,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateBaby(id: string, updates: Partial<Baby>): Promise<Baby> {
    const { data, error } = await supabase
      .from('babies')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async setActiveBaby(id: string): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // First, set all babies to inactive
    await supabase
      .from('babies')
      .update({ is_active: false })
      .eq('user_id', user.id)

    // Then set the selected baby to active
    const { error } = await supabase
      .from('babies')
      .update({ is_active: true })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error
  },

  async deleteBaby(id: string): Promise<void> {
    const { error } = await supabase.from('babies').delete().eq('id', id)

    if (error) throw error
  },
}
