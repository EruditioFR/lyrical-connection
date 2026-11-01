// Répartition des messages dans les dossiers, du point de vue de l'utilisateur connecté.
// Chaque participant a ses propres indicateurs : favori, corbeille, suppression définitive.

export interface RawMailMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  is_deleted_by_sender: boolean;
  is_deleted_by_recipient: boolean;
  is_starred?: boolean;
  // Absents tant que la migration 20261029100000 n'est pas appliquée
  is_starred_by_sender?: boolean;
  is_starred_by_recipient?: boolean;
  is_purged_by_sender?: boolean;
  is_purged_by_recipient?: boolean;
}

/** Favori de l'utilisateur ; avant migration, retombe sur l'ancien favori commun */
export const isStarredBy = (m: RawMailMessage, userId: string) => {
  const own = m.sender_id === userId ? m.is_starred_by_sender : m.is_starred_by_recipient;
  const other = m.sender_id === userId && m.recipient_id === userId ? m.is_starred_by_recipient : undefined;
  if (own === undefined) return !!m.is_starred;
  return !!own || !!other;
};

export const sortIntoFolders = <T extends RawMailMessage>(messages: T[], userId: string) => {
  const isSender = (m: T) => m.sender_id === userId;
  const isRecipient = (m: T) => m.recipient_id === userId;
  const inSent = (m: T) => isSender(m) && !m.is_deleted_by_sender && !m.is_purged_by_sender;
  const inInbox = (m: T) => isRecipient(m) && !m.is_deleted_by_recipient && !m.is_purged_by_recipient;
  const inTrash = (m: T) =>
    (isRecipient(m) && m.is_deleted_by_recipient && !m.is_purged_by_recipient) ||
    (isSender(m) && m.is_deleted_by_sender && !m.is_purged_by_sender);

  return {
    inbox: messages.filter(inInbox),
    sent: messages.filter(inSent),
    starred: messages.filter(m => (inInbox(m) || inSent(m)) && isStarredBy(m, userId)),
    trash: messages.filter(inTrash),
  };
};
