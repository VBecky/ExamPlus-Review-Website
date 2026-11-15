/*
# Create reviews table for ExamPlus feedback platform

## Purpose
Stores student-submitted reviews/feedback for the ExamPlus educational app.
Public visitors can submit reviews and read approved ones. An admin moderates
(approve / reject / delete) submissions through a secure admin panel.

## New Tables
- `reviews`
  - `id` (uuid, PK) — unique review identifier
  - `name` (text, nullable) — optional student name; null means anonymous
  - `rating` (int, 1-5, NOT NULL) — star rating
  - `experience_category` (text, NOT NULL) — one of: Excellent, Very Good, Good, Average, Needs Improvement
  - `liked_features` (text[], nullable) — array of selected liked features
  - `review_text` (text, NOT NULL) — the student's written feedback
  - `status` (text, NOT NULL DEFAULT 'pending') — moderation status: pending, approved, rejected
  - `created_at` (timestamptz, DEFAULT now()) — submission timestamp

- `admins`
  - `id` (uuid, PK) — admin identifier
  - `user_id` (uuid, NOT NULL, UNIQUE) — references auth.users
  - `created_at` (timestamptz, DEFAULT now())

## Security
- RLS enabled on `reviews`.
  - Public (anon, authenticated) can SELECT only approved reviews.
  - Admins (authenticated + is_admin()) can SELECT all reviews for moderation.
  - Public (anon, authenticated) can INSERT new reviews (pending status only).
  - Admins (authenticated + is_admin()) can UPDATE and DELETE reviews.
- RLS enabled on `admins`.
  - A user can check if they are an admin (SELECT own row).

## Functions
- `is_admin()` — SECURITY DEFINER function that checks if current auth user is in admins table.
  Revoked from PUBLIC/anon, granted to authenticated.

## Important Notes
1. Public visitors submit reviews as `anon` role (no sign-in required for submitting feedback).
2. Reviews default to `pending` status — they only appear publicly after admin approval.
3. The admin panel requires Supabase auth sign-in AND a matching row in the `admins` table.
4. Admin moderation actions use the admin's authenticated session through RLS policies checking is_admin().
*/

-- Admins table (created first so is_admin() can reference it)
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON admins TO authenticated;

DROP POLICY IF EXISTS "admin_self_select" ON admins;
CREATE POLICY "admin_self_select"
ON admins FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- is_admin() function — SECURITY DEFINER so it can read admins table regardless of caller RLS
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admins WHERE admins.user_id = auth.uid()
  );
$$;

REVOKE EXECUTE ON FUNCTION is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  experience_category text NOT NULL,
  liked_features text[],
  review_text text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON reviews TO anon, authenticated;
GRANT UPDATE, DELETE ON reviews TO authenticated;

-- Public can read only approved reviews
DROP POLICY IF EXISTS "public_read_approved_reviews" ON reviews;
CREATE POLICY "public_read_approved_reviews"
ON reviews FOR SELECT
TO anon, authenticated
USING (status = 'approved');

-- Admins can see all reviews (including pending/rejected) for moderation
DROP POLICY IF EXISTS "admin_select_all_reviews" ON reviews;
CREATE POLICY "admin_select_all_reviews"
ON reviews FOR SELECT
TO authenticated
USING (is_admin());

-- Public can insert reviews (must be pending status)
DROP POLICY IF EXISTS "public_insert_reviews" ON reviews;
CREATE POLICY "public_insert_reviews"
ON reviews FOR INSERT
TO anon, authenticated
WITH CHECK (status = 'pending');

-- Admins can update reviews (approve/reject)
DROP POLICY IF EXISTS "admin_update_reviews" ON reviews;
CREATE POLICY "admin_update_reviews"
ON reviews FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (true);

-- Admins can delete reviews
DROP POLICY IF EXISTS "admin_delete_reviews" ON reviews;
CREATE POLICY "admin_delete_reviews"
ON reviews FOR DELETE
TO authenticated
USING (is_admin());

CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
