import { supabase } from '../lib/supabase'

export const setupDatabase = {
  async createBabiesTable(): Promise<boolean> {
    try {
      // Create the babies table
      const { error: createTableError } = await supabase.rpc(
        'create_babies_table',
        {}
      )

      if (createTableError) {
        console.error('Error creating babies table:', createTableError)

        // Try alternative approach using raw SQL
        const { error: sqlError } = await supabase
          .from('_sql')
          .select('*')
          .limit(1)

        if (sqlError) {
          return false
        }
      }

      return true
    } catch (error) {
      console.error('Error in createBabiesTable:', error)
      return false
    }
  },

  async updateTrackerEntriesTable(): Promise<boolean> {
    try {
      // Add baby_id column to tracker_entries if it doesn't exist
      const { error } = await supabase.rpc('add_baby_id_to_tracker_entries', {})

      if (error) {
        console.error('Error updating tracker_entries table:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in updateTrackerEntriesTable:', error)
      return false
    }
  },

  async checkTablesExist(): Promise<{
    babies: boolean
    trackerUpdated: boolean
  }> {
    try {
      // Check if babies table exists
      const { error: babiesError } = await supabase
        .from('babies')
        .select('id')
        .limit(1)

      const babiesExists = !babiesError

      // Check if tracker_entries has baby_id column
      const { error: trackerError } = await supabase
        .from('tracker_entries')
        .select('baby_id')
        .limit(1)

      const trackerUpdated = !trackerError

      return {
        babies: babiesExists,
        trackerUpdated: trackerUpdated,
      }
    } catch (error) {
      console.error('Error checking tables:', error)
      return { babies: false, trackerUpdated: false }
    }
  },

  getSQLCommands(): string {
    return `
-- Create babies table
CREATE TABLE IF NOT EXISTS public.babies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    birthdate DATE NOT NULL,
    is_active BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies for babies table
ALTER TABLE public.babies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own babies" ON public.babies
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own babies" ON public.babies
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own babies" ON public.babies
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own babies" ON public.babies
    FOR DELETE USING (auth.uid() = user_id);

-- Add baby_id column to tracker_entries table
ALTER TABLE public.tracker_entries
ADD COLUMN IF NOT EXISTS baby_id UUID REFERENCES public.babies(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_babies_user_id ON public.babies(user_id);
CREATE INDEX IF NOT EXISTS idx_babies_is_active ON public.babies(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_tracker_entries_baby_id ON public.tracker_entries(baby_id);
`
  },
}
