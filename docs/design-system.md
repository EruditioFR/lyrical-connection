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
| `destructive` | `hsl(4 74% 42%)` | suppression uniquement | — |

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
| Écoute | bouton rond de 44 px minimum, `aria-label` « Écouter … », `aria-pressed` |
| Images d'illustration | photos réelles des artistes et des productions ; pas d'image générée |

## À faire / à éviter

| ✅ À faire | ❌ À éviter |
|---|---|
| Mettre la voix en avant (extraits écoutables) | Grilles de cartes « icône + titre + 2 lignes » répétées |
| Une couleur d'accent, en aplat | Dégradés, texte en dégradé |
| Jetons du thème (`bg-background`, `text-muted-foreground`) | Couleurs codées en dur (`bg-white`, `text-gray-600`) |
| Libellés concrets (« Écoutez la distribution ») | Emojis décoratifs, formules creuses |

## Garde-fous automatiques

`npm test` échoue si l'un de ces motifs réapparaît : dégradé décoratif, texte en dégradé, emoji
décoratif, bouton avec une couleur maison au lieu d'une variante du thème.

## Reste à reprendre

- Environ 600 couleurs Tailwind codées en dur (statuts, pages admin, page du concours Sumi Jo en ambre).
- Les pages de présentation (castings, fonctionnalités) gardent leurs grilles de cartes : à transformer en listes éditoriales.
