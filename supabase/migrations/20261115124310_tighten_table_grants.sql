/*
# Tighten grants on reviews and admins tables

## Purpose
Fix overly broad default grants on the `reviews` and `admins` tables.
Postgres grants ALL privileges to PUBLIC by default on new tables; we need to
revoke those and keep only the explicit grants that match our RLS policies.

## Changes
- REVOKE all privileges from anon and authenticated on both tables, then
  re-grant only the minimum needed:
  - `reviews`: anon/authenticated get SELECT + INSERT; authenticated also gets
    UPDATE + DELETE (admin moderation via is_admin() RLS check).
  - `admins`: authenticated gets SELECT only (self-check for admin status).
- is_admin() SECURITY DEFINER warning: this is intentional. The function only
  returns a boolean (is the caller an admin?), leaks no data, and is needed so
  authenticated users can be checked without direct table access. It is revoked
  from anon and granted only to authenticated.
*/
REVOKE ALL ON reviews FROM anon, authenticated;
GRANT SELECT, INSERT ON reviews TO anon, authenticated;
GRANT UPDATE, DELETE ON reviews TO authenticated;

REVOKE ALL ON admins FROM anon, authenticated;
GRANT SELECT ON admins TO authenticated;
