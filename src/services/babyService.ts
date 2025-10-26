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

    // Get all babies for this user
    const { data: babies, error } = await supabase
      .from('babies')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (error) throw error
    if (!babies || babies.length === 0) return null

    // Find an active baby
    const activeBaby = babies.find((baby) => baby.is_active)
    if (activeBaby) return activeBaby

    // If no active baby, return the first one (don't modify database here to avoid loops)
    return babies[0]
  },

  async createBaby(
    baby: Omit<Baby, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ): Promise<Baby> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // If this baby should be active, deactivate all other babies first
    if (baby.is_active) {
      await supabase
        .from('babies')
        .update({ is_active: false })
        .eq('user_id', user.id)
    }

    // If this is the first baby and no active status specified, make it active
    const existingBabies = await this.getBabies()
    const isFirstBaby = existingBabies.length === 0
    const shouldBeActive = baby.is_active || isFirstBaby

    const { data, error } = await supabase
      .from('babies')
      .insert({
        user_id: user.id,
        ...baby,
        is_active: shouldBeActive,
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

  // Utility function to ensure there's always an active baby
  async ensureActiveBaby(): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    // Check if there's already an active baby
    const { data: activeBaby } = await supabase
      .from('babies')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle()

    // If there's already an active baby, we're done
    if (activeBaby) return

    // If no active baby, get the first baby and make it active
    const { data: firstBaby } = await supabase
      .from('babies')
      .select('id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (firstBaby) {
      await supabase
        .from('babies')
        .update({ is_active: true })
        .eq('id', firstBaby.id)
    }
  },
}
