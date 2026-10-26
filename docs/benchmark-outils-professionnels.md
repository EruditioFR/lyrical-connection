# Benchmark — outils de gestion et de recrutement pour les professionnels

Octobre 2026. Objectif : identifier les outils les plus utiles aux professionnels du lyrique
(maisons d'opéra, festivals, concours, agents) pour gérer leurs artistes et recruter.

## Solutions étudiées

| Solution | Cible | Fonctionnalités clés pour les professionnels |
|---|---|---|
| [Operabase](https://www.operabase.com/pro/en) | Maisons d'opéra, agents | Base de 600 000+ productions ; Casting Tool par rôle déjà chanté, disponibilité, remplacement de dernière minute (« jump-in ») ; pages d'agence avec roster |
| [Backstage](https://faq.backstage.com/user-guide-casting-director) | Directeurs de casting | Application Manager : statuts par candidat (oui/non, audition, retenu), vues grille/liste, actions groupées, dossiers, notes privées partagées avec les collaborateurs ; [shortlists de projet](https://help.backstage.com/en/articles/12633284-project-shortlists) |
| [Spotlight](https://www.spotlight.com/help-and-faqs/faqs-for-agents) | Casting (Royaume-Uni) | Recherche, appels à candidatures, shortlists, messages depuis une shortlist |
| [Casting Networks](https://ottbusiness.com/ott-directory/cloud-talent-casting-platforms-tools/) | Casting | Soumissions, planification, gestion des auditions, partage vidéo sécurisé |
| [Acceptd](https://getacceptd.com/audition-scheduling-software) | Écoles, programmes, concours | Planning d'auditions en sessions et créneaux (durée, pause, capacité), jurys par session, notifications, export du planning |
| [YAP Tracker](https://getacceptd.com/post/yap-tracker-alternatives) | Programmes jeunes artistes | Dossiers réutilisables (vidéos, CV, répertoire), suivi du statut de candidature |
| [Muzeek](https://www.capterra.ca/software/210127/muzeek) / Stagent | Agents, booking | Gestion du roster, calendrier partagé, confirmations, contrats |

## Ce que Lyrisphere proposait déjà

Recherche par tessiture et répertoire, recherches sauvegardées, favoris, évaluations sur 5 critères,
castings avec critères de notation personnalisés, synthèse de jury, messagerie, publication d'événements,
API de casting et webhooks.

## Manques identifiés et fonctionnalités retenues

| # | Fonctionnalité | Inspirée de | Pourquoi |
|---|---|---|---|
| 1 | **Listes de projet** (shortlists nommées, rôle envisagé par artiste) | Backstage, Spotlight | Les favoris sont une seule liste ; un professionnel prépare plusieurs productions et concours en parallèle |
| 2 | **Notes privées et étiquettes** par artiste | Backstage | Garder la mémoire d'une audition ou d'un concert, retrouver « à réentendre », « dispo été » |
| 3 | **Pipeline des candidatures** (Reçues → Présélectionnées → Retenues / Refusées) + export CSV | Backstage Application Manager | Vue d'ensemble d'un casting et décisions rapides ; l'export alimente les outils internes |
| 4 | **Planning d'auditions par créneaux** + export agenda (.ics) et CSV | Acceptd | Programmer 20 à 60 passages à la main est la tâche la plus longue d'un casting |
| 5 | **Comparateur d'artistes** (2 à 4 côte à côte : tessiture, répertoire, enregistrements, évaluations, notes) | Backstage (grille), Operabase (répertoire) | Décider entre les finalistes d'un rôle |

## Pistes suivantes (non réalisées)

- **Disponibilités des artistes** et recherche « disponible le … » (Operabase jump-in) : demande aux artistes de tenir un calendrier.
- **Partage d'une liste avec des collaborateurs** (Backstage, Casting It) : nécessite une notion d'équipe par organisation.
- **Jurys par session d'audition** avec grille de notation en direct (Acceptd) : combinable avec les critères personnalisés existants.
