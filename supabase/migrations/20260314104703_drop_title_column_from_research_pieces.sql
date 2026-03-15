/*
  # Drop title column from research_pieces

  The title field is redundant with topic and is being removed.
  Topic will be used as the display title everywhere in the app.

  1. Changes
    - Drop the `title` column from `research_pieces` table
*/

ALTER TABLE research_pieces DROP COLUMN IF EXISTS title;
