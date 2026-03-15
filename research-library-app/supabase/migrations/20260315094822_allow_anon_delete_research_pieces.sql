/*
  # Allow anonymous delete on research_pieces

  ## Change
  - Drops the existing DELETE policy restricted to authenticated users
  - Adds a new DELETE policy that allows both anon and authenticated roles

  ## Reason
  The app uses a hidden ?edit=true query parameter for access control (no auth).
  All write operations (insert, update, delete) need to work for anon users.
*/

DROP POLICY IF EXISTS "Authenticated users can delete research pieces" ON research_pieces;

CREATE POLICY "Anyone can delete research pieces"
  ON research_pieces
  FOR DELETE
  TO anon, authenticated
  USING (true);
