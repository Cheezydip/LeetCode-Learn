-- ==========================================================
-- LeetCode-Learn Supabase Schema
-- Run this script in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/eueljujuptrwbpzldste/sql
-- ==========================================================

-- 1. Create problems table
CREATE TABLE IF NOT EXISTS public.problems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')) DEFAULT 'Medium',
    category TEXT DEFAULT 'General',
    leetcode_url TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create users table (with LeetCode Ingestion Telemetry & Verification)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    leetcode_handle TEXT UNIQUE NOT NULL,
    region TEXT CHECK (region IN ('global', 'china')) DEFAULT 'global',
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token TEXT,
    verification_token_expires_at TIMESTAMPTZ,
    avatar TEXT,
    real_name TEXT,
    about_me TEXT,
    contest_elo INT DEFAULT 1500,
    contest_rank INT,
    top_percentage NUMERIC,
    attended_contests INT DEFAULT 0,
    is_unrated BOOLEAN DEFAULT TRUE,
    profile_rank INT,
    total_solved INT DEFAULT 0,
    easy_solved INT DEFAULT 0,
    medium_solved INT DEFAULT 0,
    hard_solved INT DEFAULT 0,
    topic_metrics JSONB DEFAULT '{}'::jsonb,
    recent_submissions JSONB DEFAULT '[]'::jsonb,
    solved_slugs TEXT[] DEFAULT ARRAY[]::TEXT[],
    solved_problems JSONB DEFAULT '[]'::jsonb,
    last_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create user_solved_problems table (Tracks verified past & active solved problems)
CREATE TABLE IF NOT EXISTS public.user_solved_problems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    leetcode_handle TEXT NOT NULL,
    title_slug TEXT NOT NULL,
    title TEXT NOT NULL,
    difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    topic_slugs TEXT[] DEFAULT ARRAY[]::TEXT[],
    source TEXT DEFAULT 'import' CHECK (source IN ('import', 'cookie', 'recent_sync', 'manual')),
    solved_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(leetcode_handle, title_slug)
);

CREATE INDEX IF NOT EXISTS idx_user_solved_problems_handle ON public.user_solved_problems(leetcode_handle);
CREATE INDEX IF NOT EXISTS idx_user_solved_problems_slug ON public.user_solved_problems(title_slug);

-- 4. Create user_progress table
CREATE TABLE IF NOT EXISTS public.user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE UNIQUE,
    status TEXT CHECK (status IN ('To Do', 'Solving', 'Completed', 'Needs Revision')) DEFAULT 'Solving',
    notes TEXT,
    solution_code TEXT,
    confidence_rating INT CHECK (confidence_rating >= 1 AND confidence_rating <= 5) DEFAULT 3,
    last_practiced_at TIMESTAMPTZ DEFAULT now(),
    next_review_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Create in-cockpit problem attempt tracker (Struggle & Kryptonite detector)
CREATE TABLE IF NOT EXISTS public.user_problem_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    leetcode_handle TEXT NOT NULL,
    problem_title TEXT NOT NULL,
    problem_slug TEXT NOT NULL,
    difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    duration_seconds INT DEFAULT 0,
    attempt_count INT DEFAULT 1,
    verdict TEXT CHECK (verdict IN ('AC', 'WA', 'TLE', 'MLE', 'RE')),
    is_struggled BOOLEAN GENERATED ALWAYS AS (duration_seconds > 2400 OR attempt_count >= 3) STORED,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_solved_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_problem_attempts ENABLE ROW LEVEL SECURITY;

-- 7. Policies for public / authenticated access
CREATE POLICY "Allow public read access on problems"
    ON public.problems FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on problems"
    ON public.problems FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access on users"
    ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on users"
    ON public.users FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access on user_solved_problems"
    ON public.user_solved_problems FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on user_solved_problems"
    ON public.user_solved_problems FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access on user_progress"
    ON public.user_progress FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on user_progress"
    ON public.user_progress FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access on user_problem_attempts"
    ON public.user_problem_attempts FOR SELECT USING (true);
CREATE POLICY "Allow public insert on user_problem_attempts"
    ON public.user_problem_attempts FOR INSERT WITH CHECK (true);

-- 8. Seed sample problems
INSERT INTO public.problems (title, difficulty, category, leetcode_url, description)
VALUES 
    ('Two Sum', 'Easy', 'Arrays & Hashing', 'https://leetcode.com/problems/two-sum/', 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.'),
    ('Valid Anagram', 'Easy', 'Arrays & Hashing', 'https://leetcode.com/problems/valid-anagram/', 'Given two strings s and t, return true if t is an anagram of s, and false otherwise.'),
    ('Group Anagrams', 'Medium', 'Arrays & Hashing', 'https://leetcode.com/problems/group-anagrams/', 'Given an array of strings strs, group the anagrams together.'),
    ('Best Time to Buy and Sell Stock', 'Easy', 'Sliding Window', 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/', 'Find maximum profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.'),
    ('Longest Substring Without Repeating Characters', 'Medium', 'Sliding Window', 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', 'Given a string s, find the length of the longest substring without repeating characters.'),
    ('Trapping Rain Water', 'Hard', 'Two Pointers', 'https://leetcode.com/problems/trapping-rain-water/', 'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.')
ON CONFLICT DO NOTHING;
