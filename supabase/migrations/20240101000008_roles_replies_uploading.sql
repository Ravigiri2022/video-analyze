-- Add uploading status to job_status enum (for race-condition-safe uploads)
ALTER TYPE job_status ADD VALUE IF NOT EXISTS 'uploading';

-- Add role column to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'free'
  CHECK (role IN ('free', 'upgraded', 'super', 'admin'));

-- Feedback replies
CREATE TABLE IF NOT EXISTS public.feedback_replies (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  feedback_id UUID        NOT NULL REFERENCES public.feedback(id) ON DELETE CASCADE,
  admin_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message     TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.feedback_replies ENABLE ROW LEVEL SECURITY;

-- Users can read replies to their own feedback
CREATE POLICY "replies_owner_read" ON public.feedback_replies
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.feedback f WHERE f.id = feedback_id AND f.user_id = auth.uid())
  );

-- Admins can do everything with replies
CREATE POLICY "replies_admin_all" ON public.feedback_replies
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Admins can read all feedback
CREATE POLICY "feedback_admin_read" ON public.feedback
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Users can read their own feedback
CREATE POLICY "feedback_user_read" ON public.feedback
  FOR SELECT USING (user_id = auth.uid());
