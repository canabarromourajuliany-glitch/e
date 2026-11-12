/*
# Create pet photos storage bucket

1. New Storage
- `pet-photos` bucket for pet profile pictures uploaded from the device gallery.
- Public bucket so photos can be displayed with a direct link.

2. Security
- Signed-in users can only upload, replace, and delete files inside their own folder (named after their user id).
- Signed-in users can list only their own files.
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('pet-photos', 'pet-photos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "select_own_pet_photos" ON storage.objects;
CREATE POLICY "select_own_pet_photos" ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'pet-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "insert_own_pet_photos" ON storage.objects;
CREATE POLICY "insert_own_pet_photos" ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'pet-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "update_own_pet_photos" ON storage.objects;
CREATE POLICY "update_own_pet_photos" ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'pet-photos' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'pet-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "delete_own_pet_photos" ON storage.objects;
CREATE POLICY "delete_own_pet_photos" ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'pet-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
