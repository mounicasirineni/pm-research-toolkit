/*
  # Allow anon users to update research pieces

  ## Summary
  The app has no authentication. This migration adds an UPDATE policy
  so that anon (and authenticated) users can update existing rows,
  enabling the new edit functionality.

  ## Changes
  - Create UPDATE policy allowing both anon and authenticated roles
*/

CREATE POLICY "Anyone can update research pieces"
  ON research_pieces FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
