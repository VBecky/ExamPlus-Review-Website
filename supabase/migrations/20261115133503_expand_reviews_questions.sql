/*
# Expand reviews table with new feedback questions

## Purpose
ExamPlus feedback form now collects richer data across 8 questions.
This migration adds columns for the new structured questions while keeping
existing columns (rating, experience_category, liked_features, review_text, name).

## Changes to `reviews` table
- `design_rating` (text, nullable) — Q2: design/interface impression
  Values: 'Excellent and professional', 'Clean and easy to use',
  'Good, but needs improvement', 'Confusing in some areas',
  'Needs a complete redesign'
- `useful_features` (text[], nullable) — Q3: most useful features (multi-select)
  Values: 'Practicing examination questions', 'Question navigation',
  'Question flagging', 'Continue where I left off', 'Offline exam access',
  'Daily goal setting', 'Progress tracking', 'Other'
- `flagging_usefulness` (text, nullable) — Q4: question flagging usefulness
  Values: 'Extremely useful', 'Very useful', 'Somewhat useful',
  'Not useful', "I haven't tried it yet"
- `continue_usefulness` (text, nullable) — Q5: continue-where-left-off usefulness
  Same values as flagging_usefulness.
- `desired_features` (text[], nullable) — Q6: features wanted in future updates (multi-select)
  Values: 'AI Tutor', 'Detailed answer explanations', 'Study Notes and Summaries',
  'More examination questions', 'Improved offline experience',
  'Better progress analytics', 'Other'

## Notes
- All new columns are nullable — old reviews and partial submissions still work.
- `experience_category` renamed conceptually to Q1 (overall experience), stays as-is.
- `liked_features` is kept for backward compat but Q3 (`useful_features`) supersedes it.
- `review_text` now holds Q7 (love/improve free text).
- `rating` holds Q8 (star rating).
- RLS policies unchanged — same public read/insert + admin moderation pattern.
*/
ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS design_rating text,
  ADD COLUMN IF NOT EXISTS useful_features text[],
  ADD COLUMN IF NOT EXISTS flagging_usefulness text,
  ADD COLUMN IF NOT EXISTS continue_usefulness text,
  ADD COLUMN IF NOT EXISTS desired_features text[];
