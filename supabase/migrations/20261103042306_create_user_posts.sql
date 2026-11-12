/*
# Create authenticated adoption and donation posts

1. New Tables
- `adoption_posts`: animals published by signed-in users, including name, species, breed, age, gender, photo URL, description, vaccination and neutering status, owner, and timestamps.
- `donation_posts`: donation offers or requests published by signed-in users, including title, category, description, city, contact, type, owner, and timestamps.

2. Security
- Both tables enable Row Level Security.
- Public visitors can read published adoption and donation posts.
- Only the signed-in owner of a post can create, edit, or delete it.
- Owner IDs default to the current authenticated user and cannot be supplied to impersonate another user.
- The anon role receives read-only access; authenticated users receive the required CRUD grants.

3. Important Notes
- Existing static content remains available while user-created content is loaded.
- No existing tables or user data are modified or deleted.
*/

CREATE TABLE IF NOT EXISTS public.adoption_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  species text NOT NULL CHECK (species IN ('Cão', 'Gato', 'Outro')),
  breed text NOT NULL,
  age text NOT NULL,
  gender text NOT NULL CHECK (gender IN ('Macho', 'Fêmea')),
  photo text NOT NULL DEFAULT '',
  description text NOT NULL,
  vaccinated boolean NOT NULL DEFAULT false,
  neutered boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.donation_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  city text NOT NULL,
  contact text NOT NULL,
  type text NOT NULL CHECK (type IN ('offer', 'request')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.adoption_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donation_posts ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.adoption_posts, public.donation_posts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.adoption_posts, public.donation_posts TO authenticated;

DROP POLICY IF EXISTS "Public can read adoption posts" ON public.adoption_posts;
CREATE POLICY "Public can read adoption posts" ON public.adoption_posts FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Users can create own adoption posts" ON public.adoption_posts;
CREATE POLICY "Users can create own adoption posts" ON public.adoption_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own adoption posts" ON public.adoption_posts;
CREATE POLICY "Users can update own adoption posts" ON public.adoption_posts FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own adoption posts" ON public.adoption_posts;
CREATE POLICY "Users can delete own adoption posts" ON public.adoption_posts FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public can read donation posts" ON public.donation_posts;
CREATE POLICY "Public can read donation posts" ON public.donation_posts FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Users can create own donation posts" ON public.donation_posts;
CREATE POLICY "Users can create own donation posts" ON public.donation_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own donation posts" ON public.donation_posts;
CREATE POLICY "Users can update own donation posts" ON public.donation_posts FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own donation posts" ON public.donation_posts;
CREATE POLICY "Users can delete own donation posts" ON public.donation_posts FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS adoption_posts_created_at_idx ON public.adoption_posts (created_at DESC);
CREATE INDEX IF NOT EXISTS donation_posts_created_at_idx ON public.donation_posts (created_at DESC);
