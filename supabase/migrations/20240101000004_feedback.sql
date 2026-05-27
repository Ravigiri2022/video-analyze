CREATE TABLE public.feedback (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  type        TEXT        NOT NULL DEFAULT 'general'
                          CHECK (type IN ('bug', 'feature', 'general')),
  message     TEXT        NOT NULL,
  email       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Anyone (including anon) can submit feedback
CREATE POLICY "feedback_insert" ON public.feedback
  FOR INSERT WITH CHECK (true);

-- Only service_role / admin can read
CREATE POLICY "feedback_owner_read" ON public.feedback
  FOR SELECT USING (auth.uid() = user_id);
