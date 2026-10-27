// Tant qu'une migration n'est pas appliquée, PostgREST répond « table introuvable »
export const isMissingTable = (error: { code?: string } | null) =>
  !!error && (error.code === 'PGRST205' || error.code === '42P01');

// ON CONFLICT sur des colonnes sans contrainte unique correspondante
export const isMissingConflictTarget = (error: { code?: string } | null) =>
  !!error && error.code === '42P10';
