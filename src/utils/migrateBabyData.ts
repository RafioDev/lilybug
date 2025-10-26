import { supabase } from '../lib/supabase'
import { babyService } from '../services/babyService'

export const migrateBabyData = {
  async checkIfMigrationNeeded(): Promise<boolean> {
    try {
      // Check if there are any babies in the new structure
      const babies = await babyService.getBabies()
      if (babies.length > 0) {
        return false // Already migrated
      }

      // Check if there's old profile data with baby info
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .not('baby_name', 'is', null)
        .limit(1)

      if (error) {
        console.error('Error checking for old profile data:', error)
        return false
      }

      return profiles && profiles.length > 0
    } catch (error) {
      console.error('Error checking migration status:', error)
      return false
    }
  },

  async migrateFromProfile(): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Not authenticated')
      }

      // Get the old profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError || !profile || !profile.baby_name) {
        return false
      }

      // Create the baby in the new structure
      const baby = await babyService.createBaby({
        name: profile.baby_name,
        birthdate: profile.baby_birthdate,
        is_active: true,
      })

      // Update existing tracker entries to include baby_id
      const { error: updateError } = await supabase
        .from('tracker_entries')
        .update({ baby_id: baby.id })
        .eq('user_id', user.id)
        .is('baby_id', null)

      if (updateError) {
        console.error('Error updating tracker entries:', updateError)
        // Don't fail the migration for this, as the baby was created successfully
      }

      // Clean up old profile data (remove baby fields)
      const { error: cleanupError } = await supabase
        .from('profiles')
        .update({
          baby_name: null,
          baby_birthdate: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (cleanupError) {
        console.error('Error cleaning up old profile data:', cleanupError)
        // Don't fail for this either
      }

      return true
    } catch (error) {
      console.error('Error during migration:', error)
      return false
    }
  },

  async runMigrationIfNeeded(): Promise<void> {
    try {
      const needsMigration = await this.checkIfMigrationNeeded()

      if (needsMigration) {
        await this.migrateFromProfile()
      }
    } catch (error) {
      console.error('Error running migration:', error)
    }
  },
}
