/*
  # Create research_pieces table

  ## Summary
  Creates the core table for the PM Research Library app.

  ## New Tables
  - `research_pieces`
    - `id` (uuid, primary key, auto-generated)
    - `created_at` (timestamptz, defaults to now)
    - `type` (text) - One of: Domain Primer, Company Deep Dive, Product Teardown, Competitive Landscape
    - `topic` (text) - The topic/domain this research belongs to
    - `title` (text) - Title of the research piece
    - `date` (text) - Date string for the research
    - `synthesis` (text) - Short synthesis shown by default
    - `full_research` (text) - Full markdown research content, shown on expand

  ## Security
  - RLS enabled
  - Anon and authenticated users can read all records (public study tool)
  - Authenticated users can insert, update, delete
*/

CREATE TABLE IF NOT EXISTS research_pieces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  type text NOT NULL,
  topic text NOT NULL,
  title text NOT NULL,
  date text NOT NULL DEFAULT '',
  synthesis text NOT NULL DEFAULT '',
  full_research text NOT NULL DEFAULT ''
);

ALTER TABLE research_pieces ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'research_pieces' AND policyname = 'Anyone can read research pieces'
  ) THEN
    CREATE POLICY "Anyone can read research pieces"
      ON research_pieces FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'research_pieces' AND policyname = 'Authenticated users can insert research pieces'
  ) THEN
    CREATE POLICY "Authenticated users can insert research pieces"
      ON research_pieces FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'research_pieces' AND policyname = 'Authenticated users can update research pieces'
  ) THEN
    CREATE POLICY "Authenticated users can update research pieces"
      ON research_pieces FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'research_pieces' AND policyname = 'Authenticated users can delete research pieces'
  ) THEN
    CREATE POLICY "Authenticated users can delete research pieces"
      ON research_pieces FOR DELETE
      TO authenticated
      USING (true);
  END IF;
END $$;
