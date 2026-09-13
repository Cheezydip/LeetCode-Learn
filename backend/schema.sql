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

-- 2. Create user_progress table
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

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- 4. Policies for anon access (adjust as needed for authenticated users)
CREATE POLICY "Allow public read access on problems"
    ON public.problems FOR SELECT
    USING (true);

CREATE POLICY "Allow public insert/update on problems"
    ON public.problems FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow public read access on user_progress"
    ON public.user_progress FOR SELECT
    USING (true);

CREATE POLICY "Allow public insert/update on user_progress"
    ON public.user_progress FOR ALL
    USING (true)
    WITH CHECK (true);

-- 5. Seed sample problems to get started
INSERT INTO public.problems (title, difficulty, category, leetcode_url, description)
VALUES 
    ('Two Sum', 'Easy', 'Arrays & Hashing', 'https://leetcode.com/problems/two-sum/', 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.'),
    ('Valid Anagram', 'Easy', 'Arrays & Hashing', 'https://leetcode.com/problems/valid-anagram/', 'Given two strings s and t, return true if t is an anagram of s, and false otherwise.'),
    ('Group Anagrams', 'Medium', 'Arrays & Hashing', 'https://leetcode.com/problems/group-anagrams/', 'Given an array of strings strs, group the anagrams together.'),
    ('Best Time to Buy and Sell Stock', 'Easy', 'Sliding Window', 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/', 'Find maximum profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.'),
    ('Longest Substring Without Repeating Characters', 'Medium', 'Sliding Window', 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', 'Given a string s, find the length of the longest substring without repeating characters.'),
    ('Trapping Rain Water', 'Hard', 'Two Pointers', 'https://leetcode.com/problems/trapping-rain-water/', 'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.')
ON CONFLICT DO NOTHING;
