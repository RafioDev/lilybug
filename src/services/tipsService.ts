import { supabase } from '../lib/supabase';
import type { DailyTip } from '../types';

export const tipsService = {
  async getTipsForAge(babyAgeDays: number): Promise<DailyTip[]> {
    const { data, error } = await supabase
      .from('daily_tips')
      .select('*')
      .lte('age_min_days', babyAgeDays)
      .gte('age_max_days', babyAgeDays)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },
};
