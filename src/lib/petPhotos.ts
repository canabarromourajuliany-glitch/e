import { supabase } from '@/lib/supabase';

const BUCKET = 'pet-photos';
const MAX_BYTES = 5 * 1024 * 1024;
const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

export async function uploadPetPhoto(file: File): Promise<string> {
  const extension = EXTENSIONS[file.type];
  if (!extension) throw new Error('Escolha uma foto em JPG, PNG, WEBP ou GIF.');
  if (file.size > MAX_BYTES) throw new Error('A foto precisa ter no máximo 5 MB.');

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw new Error('Entre na sua conta para enviar fotos.');

  const path = `${userData.user.id}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error('Não foi possível enviar a foto. Tente novamente.');

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  if (!data.publicUrl) throw new Error('Não foi possível gerar o link da foto. Tente novamente.');
  return data.publicUrl;
}
