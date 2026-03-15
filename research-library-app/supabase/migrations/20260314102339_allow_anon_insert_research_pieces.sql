/*
  # Allow anon users to insert research pieces

  ## Summary
  The app has no authentication, so all requests come from the anon role.
  The existing INSERT policy only allowed authenticated users, which caused
  RLS violations on every insert. This migration drops that policy and
  replaces it with one that also permits anon inserts.

  ## Changes
  - Drop existing authenticated-only INSERT policy
  - Create new INSERT policy allowing both anon and authenticated roles
*/

DROP POLICY IF EXISTS "Authenticated users can insert research pieces" ON research_pieces;

CREATE POLICY "Anyone can insert research pieces"
  ON research_pieces FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
