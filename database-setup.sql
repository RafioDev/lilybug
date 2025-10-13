-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    parent1_name TEXT,
    parent2_name TEXT,
    active_baby_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    -- Legacy fields (will be removed after migration)
    baby_name TEXT,
    baby_birthdate DATE
);

-- Create babies table
CREATE TABLE IF NOT EXISTS public.babies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    birthdate DATE NOT NULL,
    is_active BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create tracker_entries table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.tracker_entries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    baby_id UUID REFERENCES public.babies(id) ON DELETE CASCADE,
    entry_type TEXT NOT NULL CHECK (entry_type IN ('feeding', 'sleep', 'diaper', 'pumping')),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    quantity INTEGER,
    feeding_type TEXT CHECK (feeding_type IN ('bottle', 'breast_left', 'breast_right', 'both')),
    diaper_type TEXT CHECK (diaper_type IN ('wet', 'dirty', 'both')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);



-- Create parent_wellness table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.parent_wellness (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    parent_name TEXT NOT NULL,
    mood_score INTEGER NOT NULL CHECK (mood_score >= 1 AND mood_score <= 10),
    sleep_hours DECIMAL(3,1),
    journal_entry TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.babies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracker_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_wellness ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for babies
DROP POLICY IF EXISTS "Users can view their own babies" ON public.babies;
CREATE POLICY "Users can view their own babies" ON public.babies
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own babies" ON public.babies;
CREATE POLICY "Users can insert their own babies" ON public.babies
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own babies" ON public.babies;
CREATE POLICY "Users can update their own babies" ON public.babies
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own babies" ON public.babies;
CREATE POLICY "Users can delete their own babies" ON public.babies
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for tracker_entries
DROP POLICY IF EXISTS "Users can view their own entries" ON public.tracker_entries;
CREATE POLICY "Users can view their own entries" ON public.tracker_entries
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own entries" ON public.tracker_entries;
CREATE POLICY "Users can insert their own entries" ON public.tracker_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own entries" ON public.tracker_entries;
CREATE POLICY "Users can update their own entries" ON public.tracker_entries
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own entries" ON public.tracker_entries;
CREATE POLICY "Users can delete their own entries" ON public.tracker_entries
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for parent_wellness
DROP POLICY IF EXISTS "Users can view their own wellness entries" ON public.parent_wellness;
CREATE POLICY "Users can view their own wellness entries" ON public.parent_wellness
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own wellness entries" ON public.parent_wellness;
CREATE POLICY "Users can insert their own wellness entries" ON public.parent_wellness
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own wellness entries" ON public.parent_wellness;
CREATE POLICY "Users can update their own wellness entries" ON public.parent_wellness
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own wellness entries" ON public.parent_wellness;
CREATE POLICY "Users can delete their own wellness entries" ON public.parent_wellness
    FOR DELETE USING (auth.uid() = user_id);



-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_babies_user_id ON public.babies(user_id);
CREATE INDEX IF NOT EXISTS idx_babies_is_active ON public.babies(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_tracker_entries_user_id ON public.tracker_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_tracker_entries_baby_id ON public.tracker_entries(baby_id);
CREATE INDEX IF NOT EXISTS idx_tracker_entries_start_time ON public.tracker_entries(start_time);
CREATE INDEX IF NOT EXISTS idx_parent_wellness_user_id ON public.parent_wellness(user_id);
CREATE INDEX IF NOT EXISTS idx_parent_wellness_date ON public.parent_wellness(date);

