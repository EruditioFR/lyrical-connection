## Objectif

Sur mobile, la barre de navigation affiche actuellement, sur une seule ligne : logo + hamburger + bouton « Se connecter » + bouton « S'inscrire ». Cela serre l'espace, force des boutons étroits et brise la hiérarchie visuelle. On va replacer ces deux actions à des emplacements plus naturels sur mobile.

## Nouveau placement

1. **Header mobile (visiteur non connecté)** — On ne garde qu'**un seul** bouton primaire visible : « S'inscrire » (CTA principal, doré/primary). Le bouton « Se connecter » est retiré du header sur mobile pour libérer de l'espace.
2. **Menu hamburger** — En haut du panneau mobile (avant la section « Découvrir Lyrisphere »), on ajoute un bloc d'authentification dédié et bien visible avec :
   - Bouton large « S'inscrire » (primary, pleine largeur)
   - Bouton large « Se connecter » (outline, pleine largeur)
   - Séparateur en dessous
3. **Desktop** — Aucun changement, les deux boutons restent côte à côte dans le header.

## Pourquoi

- Sur mobile, le pouce atteint plus facilement des boutons larges en pleine largeur dans le menu déroulant que deux petits boutons coincés en haut à droite.
- Garder une seule action primaire visible (« S'inscrire ») dans le header réduit la friction visuelle et met en avant la conversion.
- Les visiteurs cherchant à se connecter trouvent le bouton dès l'ouverture du menu — premier élément du panneau.

## Détails techniques

Fichier : `src/components/layout/Navbar.tsx`

- Bloc `else` ligne 218-225 (boutons header) : conditionner sur `!isMobile` les deux boutons, OU n'afficher que le bouton primaire « S'inscrire » sur mobile.
- Bloc menu mobile visiteur ligne 336-382 : ajouter en tête un bloc `<div>` avec deux `<Button>` pleine largeur (`w-full`, `size="lg"`) qui appellent `navigate('/auth')` et `navigate('/auth?tab=signup')`, puis ferment le menu (`setIsMobileMenuOpen(false)`).
- Utiliser les tokens existants (`variant="default"` pour primary, `variant="outline"` pour secondaire). Cibles tactiles ≥ 44px (taille `lg` de shadcn).

## Pas concerné

- La page `/auth` elle-même.
- Le comportement utilisateur connecté.
- Le header desktop.
