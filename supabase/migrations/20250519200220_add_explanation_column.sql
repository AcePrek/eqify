-- Add explanation column to eq_questions table
ALTER TABLE public.eq_questions ADD COLUMN IF NOT EXISTS explanation text;
