// Tant qu'une migration n'est pas appliquée, PostgREST répond « table introuvable »
export const isMissingTable = (error: { code?: string } | null) =>
  !!error && (error.code === 'PGRST205' || error.code === '42P01');

// ON CONFLICT sur des colonnes sans contrainte unique correspondante
export const isMissingConflictTarget = (error: { code?: string } | null) =>
  !!error && error.code === '42P10';

// Colonne inconnue (migration pas encore appliquée), en écriture (PGRST204) ou en filtre (42703)
export const isMissingColumn = (error: { code?: string } | null) =>
  !!error && (error.code === 'PGRST204' || error.code === '42703');

// Fonction SQL inconnue (migration pas encore appliquée)
export const isMissingFunction = (error: { code?: string } | null) =>
  !!error && (error.code === 'PGRST202' || error.code === '42883');
