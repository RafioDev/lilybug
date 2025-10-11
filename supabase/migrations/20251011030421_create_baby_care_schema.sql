/*
  # Baby Care App - Initial Schema

  ## Overview
  Creates the foundational database structure for a baby care tracking app
  supporting tracker logs, daily tips, parent wellness data, and user profiles.

  ## 1. New Tables
  
  ### `profiles`
  - `id` (uuid, primary key) - Links to auth.users
  - `baby_name` (text) - Baby's name
  - `baby_birthdate` (date) - Birth date for age calculations
  - `parent1_name` (text) - First parent's name
  - `parent2_name` (text, nullable) - Second parent's name (optional)
  - `created_at` (timestamptz) - Profile creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `tracker_entries`
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key) - Owner of the entry
  - `entry_type` (text) - Type: 'feeding', 'sleep', 'diaper', 'pumping'
  - `start_time` (timestamptz) - When activity started
  - `end_time` (timestamptz, nullable) - When activity ended (for sleep/feeding duration)
  - `quantity` (decimal, nullable) - Amount in oz/ml for feeding
  - `feeding_type` (text, nullable) - 'bottle', 'breast_left', 'breast_right', 'both'
  - `diaper_type` (text, nullable) - 'wet', 'dirty', 'both'
  - `notes` (text, nullable) - Optional notes
  - `created_at` (timestamptz) - Entry creation time

  ### `daily_tips`
  - `id` (uuid, primary key)
  - `age_min_days` (integer) - Minimum baby age in days
  - `age_max_days` (integer) - Maximum baby age in days
  - `title` (text) - Tip title
  - `content` (text) - Tip content
  - `icon` (text, nullable) - Icon identifier or emoji
  - `category` (text) - Tip category
  - `created_at` (timestamptz)

  ### `parent_wellness`
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key)
  - `date` (date) - Date of entry
  - `parent_name` (text) - Which parent (parent1 or parent2)
  - `mood_score` (integer) - Mood rating 1-5
  - `sleep_hours` (decimal, nullable) - Hours of sleep
  - `journal_entry` (text, nullable) - Optional journal text
  - `created_at` (timestamptz)

  ## 2. Security
  - Enable RLS on all tables
  - Users can only access their own data
  - Daily tips are readable by all authenticated users
  - All policies verify authentication and ownership

  ## 3. Indexes
  - Index on tracker_entries for efficient timeline queries
  - Index on parent_wellness for date-based lookups
  - Index on daily_tips for age-based filtering
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  baby_name text NOT NULL DEFAULT '',
  baby_birthdate date NOT NULL DEFAULT CURRENT_DATE,
  parent1_name text NOT NULL DEFAULT 'Parent 1',
  parent2_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tracker_entries table
CREATE TABLE IF NOT EXISTS tracker_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_type text NOT NULL CHECK (entry_type IN ('feeding', 'sleep', 'diaper', 'pumping')),
  start_time timestamptz NOT NULL DEFAULT now(),
  end_time timestamptz,
  quantity decimal(5,2),
  feeding_type text CHECK (feeding_type IN ('bottle', 'breast_left', 'breast_right', 'both')),
  diaper_type text CHECK (diaper_type IN ('wet', 'dirty', 'both')),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create daily_tips table
CREATE TABLE IF NOT EXISTS daily_tips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  age_min_days integer NOT NULL DEFAULT 0,
  age_max_days integer NOT NULL DEFAULT 365,
  title text NOT NULL,
  content text NOT NULL,
  icon text,
  category text NOT NULL DEFAULT 'general',
  created_at timestamptz DEFAULT now()
);

-- Create parent_wellness table
CREATE TABLE IF NOT EXISTS parent_wellness (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  parent_name text NOT NULL,
  mood_score integer NOT NULL CHECK (mood_score BETWEEN 1 AND 5),
  sleep_hours decimal(4,2),
  journal_entry text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date, parent_name)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tracker_entries_user_time 
  ON tracker_entries(user_id, start_time DESC);

CREATE INDEX IF NOT EXISTS idx_parent_wellness_user_date 
  ON parent_wellness(user_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_daily_tips_age 
  ON daily_tips(age_min_days, age_max_days);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracker_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_wellness ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Tracker entries policies
CREATE POLICY "Users can view own tracker entries"
  ON tracker_entries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tracker entries"
  ON tracker_entries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tracker entries"
  ON tracker_entries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tracker entries"
  ON tracker_entries FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Daily tips policies (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view daily tips"
  ON daily_tips FOR SELECT
  TO authenticated
  USING (true);

-- Parent wellness policies
CREATE POLICY "Users can view own wellness data"
  ON parent_wellness FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wellness data"
  ON parent_wellness FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wellness data"
  ON parent_wellness FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own wellness data"
  ON parent_wellness FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert sample daily tips
INSERT INTO daily_tips (age_min_days, age_max_days, title, content, icon, category) VALUES
  (0, 7, 'Welcome to Parenthood', 'Your newborn needs 8-12 feedings per day. This is completely normal! Feed on demand and watch for hunger cues like rooting or hand-to-mouth movements.', '🍼', 'feeding'),
  (0, 14, 'Sleep When Baby Sleeps', 'Newborns sleep 14-17 hours a day but in short bursts. Try to rest when your baby rests. Your recovery matters too.', '😴', 'sleep'),
  (0, 30, 'Diaper Tracking Matters', 'In the first month, expect 6-8 wet diapers and several dirty ones daily. This helps ensure baby is feeding well.', '👶', 'health'),
  (7, 30, 'Tummy Time Starts Now', 'Begin with 3-5 minutes of supervised tummy time, 2-3 times daily. This builds neck and shoulder strength.', '💪', 'development'),
  (14, 60, 'You''re Doing Great', 'Week 2-8 can be the hardest. You''re learning, baby is learning. Be patient with yourself. Ask for help when you need it.', '❤️', 'support'),
  (30, 90, 'Growth Spurt Alert', 'Around 6 weeks, many babies have a growth spurt. More frequent feeding is normal and temporary.', '📈', 'development'),
  (60, 120, 'Social Smiles Emerge', 'Watch for those first real smiles! Your baby is starting to recognize and respond to you.', '😊', 'development'),
  (90, 180, 'Longer Sleep Stretches', 'Many babies start sleeping longer at night around 3-4 months. Establish a calm bedtime routine.', '🌙', 'sleep'),
  (180, 365, 'Solid Foods Soon', 'Around 6 months, signs of readiness for solids include sitting with support and showing interest in food.', '🥄', 'feeding')
ON CONFLICT DO NOTHING;