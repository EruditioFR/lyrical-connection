import { supabase } from '@/integrations/supabase/client';

// Pièces jointes de la messagerie, dans un espace privé.
// Les nouveaux messages stockent le chemin « <id utilisateur>/<horodatage>-<nom> » ;
// les anciens stockent l'URL publique complète, encore acceptée en lecture.
const BUCKET = 'message-attachments';

/** Chemin dans l'espace de stockage, à partir d'un chemin ou d'une ancienne URL publique */
export const attachmentPath = (ref: string): string => {
  if (!/^https?:\/\//.test(ref)) return ref;
  const marker = `/${BUCKET}/`;
  const i = ref.indexOf(marker);
  if (i === -1) return ref;
  return decodeURIComponent(ref.slice(i + marker.length).split('?')[0]);
};

/** Nom de fichier lisible, sans le préfixe d'horodatage */
export const attachmentName = (ref: string): string => {
  const last = attachmentPath(ref).split('/').pop() || 'fichier';
  return last.replace(/^\d{10,}-/, '') || last;
};

/** Dépose un fichier dans le dossier de l'utilisateur et renvoie son chemin */
export const uploadAttachment = async (file: File, userId: string): Promise<string> => {
  const safeName = file.name.replace(/[^\p{L}\p{N}._-]+/gu, '_');
  const path = `${userId}/${Date.now()}-${safeName}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file);
  if (error) throw new Error(`Erreur lors de l'envoi du fichier : ${error.message}`);
  return path;
};

export const removeAttachment = async (ref: string) => {
  await supabase.storage.from(BUCKET).remove([attachmentPath(ref)]);
};

/** Lien temporaire (1 heure), réservé aux participants du message */
export const attachmentSignedUrl = async (ref: string): Promise<string> => {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(attachmentPath(ref), 3600);
  if (error || !data) throw new Error("Pièce jointe inaccessible");
  return data.signedUrl;
};
