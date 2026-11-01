# Système visuel Lyrisphere — « Programme de salle »

Direction : celle d'un programme d'opéra plutôt que d'un site « luxe » générique. Papier, encre,
une seule couleur d'accent (le rouge rideau), des filets plutôt que des cartes ombrées, la voix au
premier plan. Maquette de référence : canevas « Direction Programme de salle ».

Les valeurs vivent dans `src/index.css` (jetons du thème, clair et sombre) et `tailwind.config.ts`.
Les garde-fous automatiques sont dans `src/design-system.test.ts` (lancés par `npm test`).

## Jetons

### Couleurs (thème clair)

| Jeton | Valeur | Usage | Contraste sur le fond |
|---|---|---|---|
| `background` | papier `hsl(43 19% 94%)` | fond des pages | — |
| `foreground` | encre `hsl(40 17% 7%)` | texte, titres | 16:1 |
| `muted-foreground` | `hsl(40 7% 34%)` | texte secondaire, légendes | 6:1 |
| `primary` | encre | boutons principaux | — |
| `border` | filet `hsl(40 13% 78%)` | séparations, contours | traits seulement |
| `ring`, `gold-600` | rideau `#9e1b32` | accent : étiquettes, focus, soulignés | 7:1 |
| `destructive` | `hsl(4 74% 37%)` | suppression, erreurs | 6,6:1 |
| `success` | `hsl(145 45% 26%)` | statut accepté, publié, confirmé | 6,6:1 |
| `warning` | `hsl(30 80% 30%)` | en attente, à vérifier | 5,9:1 |
| `info` | `hsl(212 55% 34%)` | information, statut en cours | 6,9:1 |

Les jetons d'état s'emploient en texte (`text-success`), en fond teinté (`bg-success/15`, texte
toujours ≥ 4,5:1) ou en aplat avec leur couleur de texte (`bg-success text-success-foreground`).
En mode sombre ils sont éclaircis et leur texte d'aplat passe à l'encre. Ils servent aux **états**,
jamais aux **catégories** (type d'événement, d'œuvre, niveau) : celles-ci sont des étiquettes neutres à
filet (`border border-border text-muted-foreground`), le libellé suffit.

Le rouge rideau n'est **jamais** la couleur des boutons principaux : il resterait confondu avec les
actions de suppression. Les boutons sont à l'encre (papier en mode sombre).

Les palettes historiques `lyrical-*` et `gold-*` sont conservées comme noms mais redéfinies :
`lyrical` = encres et gris chauds, `gold` = nuances du rouge rideau. En mode sombre, leurs teintes
foncées sont éclaircies automatiquement, et les fonds clairs codés en dur (`bg-white`, teintes 50/100)
prennent la surface sombre du thème.

### Typographie

- Titres `h1`–`h3` : **Source Serif 4**, couleur héritée du contexte.
- Texte, interface, `h4`–`h6` : **Source Sans 3**, 16 px minimum pour le texte courant.
- Étiquettes de section : capitales espacées (`uppercase tracking-[0.14em]`), petite taille, en rouge rideau ou gris.

### Formes

- Rayon : `0.125rem` (coins presque droits) ; `rounded-xl/2xl/3xl` plafonnés à 4–8 px ; `rounded-full` réservé aux avatars et pastilles.
- Ombres : aucune sur la page (`shadow`, `shadow-sm`, `shadow-md` = rien) ; `shadow-lg` et plus pour les éléments flottants (fenêtres, menus).
- Pas de dégradé, sauf les voiles sombres vers `transparent` qui rendent un texte lisible sur une photo.

## Composants et motifs

| Élément | Règle |
|---|---|
| Bouton principal | variante par défaut (encre) — ne pas surcharger la couleur |
| Bouton secondaire | `variant="outline"` |
| Carte | contour fin, pas d'ombre ; préférer des listes séparées par des filets |
| Page de lecture | `<article>` de 3xl de large, étiquette + titre serif, sections séparées par des filets (`py-8 border-t`), listes de définitions plutôt que des encadrés ; voir `pages/TermsOfService.tsx` |
| Liste éditoriale | `components/editorial/Editorial.tsx` : `EditorialSection` (étiquette rouge + titre serif à gauche, contenu à droite), `EditorialList` (liste à filets, `numbered` pour « 01, 02… »), `Eyebrow` (étiquette seule) |
| Écoute | bouton rond de 44 px minimum, `aria-label` « Écouter … », `aria-pressed` |
| Images d'illustration | photos réelles des artistes et des productions ; pas d'image générée |

## À faire / à éviter

| ✅ À faire | ❌ À éviter |
|---|---|
| Mettre la voix en avant (extraits écoutables) | Grilles de cartes « icône + titre + 2 lignes » répétées |
| Une couleur d'accent, en aplat | Dégradés, texte en dégradé |
| Jetons du thème (`bg-background`, `text-muted-foreground`) | Couleurs codées en dur (`bg-white`, `text-gray-600`) |
| Libellés concrets (« Écoutez la distribution ») | Emojis décoratifs, formules creuses |
| Décrire ce que l'application fait réellement | Chiffres non sourcés (« 500+ artistes »), profils fictifs, données tirées au hasard |

## Garde-fous automatiques

`npm test` échoue si l'un de ces motifs réapparaît : dégradé décoratif, texte en dégradé, emoji
décoratif, bouton avec une couleur maison au lieu d'une variante du thème, couleur Tailwind codée en
dur (`text-green-600`, `bg-gray-100`…), fond `bg-white` opaque.

## Reste à reprendre

- Pages internes (tableaux de bord, administration, candidatures) : couleurs migrées vers les jetons, mise en page encore en cartes ; à reprendre écran par écran.
- Mentions légales : éditeur, hébergeur, directeur de la publication et tribunal compétent sont « [À compléter] » (obligation légale, à renseigner par l'éditeur).
- FAQ : « candidatures prioritaires » (Premium) et limites de taille des fichiers (10 Mo / 50 Mo) ne sont pas vérifiables dans le code ; à confirmer.
