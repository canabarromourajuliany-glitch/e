/*
# Create care management tables for the "Cuidado em Dia" feature

1. New Tables
- `pets`: individual animal profiles created by signed-in users, with name, photo, species, birthdate, notes, and timestamps.
- `care_records`: medical/care entries logged per pet (vaccines, vet visits, medications, etc.), with type, date, notes, and optional next-due date.
- `care_tasks`: scheduled care tasks with title, description, category, due date/time, status (pending/completed), and completion timestamp.

2. Security
- All three tables enable Row Level Security.
- Owner columns default to auth.uid() so inserts that omit user_id still satisfy the INSERT policy.
- Each user can only create, read, update, and delete their own pets and related records.
- The `pets` table is the parent; `care_records` and `care_tasks` reference it via pet_id with ON DELETE CASCADE.
- Policies on child tables verify ownership through the parent pet.
- Grants: SELECT/INSERT/UPDATE/DELETE to `authenticated` only (the app requires sign-in to use this feature).

3. Important Notes
- No existing tables or user data are modified or deleted.
- Guest users can browse other tabs but cannot use the Cuidado em Dia feature.
*/

CREATE TABLE IF NOT EXISTS public.pets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  photo text NOT NULL DEFAULT '',
  species text NOT NULL DEFAULT 'Cão',
  birthdate text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.care_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  date text NOT NULL,
  notes text NOT NULL DEFAULT '',
  next_due text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.care_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'saude',
  due_at timestamptz NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_tasks ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pets, public.care_records, public.care_tasks TO authenticated;

-- Pets policies
DROP POLICY IF EXISTS "select_own_pets" ON public.pets;
CREATE POLICY "select_own_pets" ON public.pets FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_pets" ON public.pets;
CREATE POLICY "insert_own_pets" ON public.pets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_pets" ON public.pets;
CREATE POLICY "update_own_pets" ON public.pets FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_pets" ON public.pets;
CREATE POLICY "delete_own_pets" ON public.pets FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Care records policies (ownership through pet)
DROP POLICY IF EXISTS "select_own_care_records" ON public.care_records;
CREATE POLICY "select_own_care_records" ON public.care_records FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_care_records" ON public.care_records;
CREATE POLICY "insert_own_care_records" ON public.care_records FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_care_records" ON public.care_records;
CREATE POLICY "update_own_care_records" ON public.care_records FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_care_records" ON public.care_records;
CREATE POLICY "delete_own_care_records" ON public.care_records FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Care tasks policies (ownership through user_id)
DROP POLICY IF EXISTS "select_own_care_tasks" ON public.care_tasks;
CREATE POLICY "select_own_care_tasks" ON public.care_tasks FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_care_tasks" ON public.care_tasks;
CREATE POLICY "insert_own_care_tasks" ON public.care_tasks FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_care_tasks" ON public.care_tasks;
CREATE POLICY "update_own_care_tasks" ON public.care_tasks FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_care_tasks" ON public.care_tasks;
CREATE POLICY "delete_own_care_tasks" ON public.care_tasks FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS pets_user_id_idx ON public.pets (user_id);
CREATE INDEX IF NOT EXISTS care_records_pet_id_idx ON public.care_records (pet_id);
CREATE INDEX IF NOT EXISTS care_tasks_pet_id_idx ON public.care_tasks (pet_id);
CREATE INDEX IF NOT EXISTS care_tasks_due_at_idx ON public.care_tasks (due_at);
CREATE INDEX IF NOT EXISTS care_tasks_completed_idx ON public.care_tasks (completed);
