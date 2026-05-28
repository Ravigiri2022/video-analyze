-- Share tokens for public report links
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE DEFAULT NULL;

-- Public can read analysis rows when they have the matching share_token via the job
-- We expose this via an API route (no direct RLS bypass needed for anon reads on analyses)
-- The API route uses the service role key to look up by token
