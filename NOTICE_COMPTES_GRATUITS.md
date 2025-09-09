# 📋 NOTICE : Création et Gestion des Comptes Gratuits Lyrisphere

## 🎯 Vue d'ensemble

Le système de comptes gratuits Lyrisphere permet aux administrateurs de créer des comptes pour les artistes et professionnels sans que ces derniers aient besoin de s'inscrire eux-mêmes. Ce processus facilite l'onboarding et permet un contrôle qualité des profils.

---

## 🔧 1. Comment créer un compte gratuit

### Accès administrateur requis
- Se connecter avec un compte administrateur
- Aller sur la page `/admin`
- Accéder à l'onglet "Comptes Gratuits"

### Processus de création

#### **Option 1 : Création directe**
1. Cliquer sur "Créer un compte"
2. Choisir le type : **Artiste** ou **Professionnel**
3. Remplir les informations obligatoires :

**Pour les Artistes :**
- Nom de scène **(obligatoire)**
- Email de contact **(obligatoire)**
- Type de voix
- Nationalité
- Localisation
- Années d'expérience
- Téléphone
- Site web
- Biographie
- **Niveau d'accès :** Standard ou Premium Visibilité

**Pour les Professionnels :**
- Nom de l'entreprise **(obligatoire)**
- Email de contact **(obligatoire)**
- Rôle professionnel **(obligatoire)** :
  - Directeur artistique
  - Agent
  - Directeur de casting
  - Producteur
  - Directeur de théâtre
  - Organisateur de festival
  - Autre
- Localisation
- Téléphone
- Site web
- Description de l'entreprise
- Description de l'équipe
- **Niveau d'accès :** Standard ou Premium Visibilité

4. Valider la création

#### **Option 2 : Import CSV**
- Possibilité d'importer plusieurs comptes via fichier CSV
- Format spécifique requis selon le type de profil

---

## 📧 2. Ce que reçoit le nouvel utilisateur

### Email d'invitation automatique
Le système envoie automatiquement un **email d'invitation** professionnel contenant :

#### **Contenu de l'email :**
- **Objet :** "Invitation à rejoindre Lyrisphere - [Profil Artiste/Professionnel]"
- **Expéditeur :** "Lyrisphere <jbbejot@aacfi.fr>"
- **Design :** Email HTML avec branding Lyrisphere

#### **Informations incluses :**
- ✅ Message de bienvenue personnalisé
- ✅ Explication du type de profil créé (Artiste/Professionnel)
- ✅ **Lien d'activation unique** (valable 7 jours)
- ✅ Email de connexion confirmé
- ✅ Instructions pour créer un mot de passe
- ✅ Informations sur l'accès aux fonctionnalités

#### **Sécurité :**
- 🔐 Token d'invitation unique et sécurisé
- ⏰ Expiration automatique après 7 jours
- 🚫 Usage unique (lien désactivé après utilisation)

---

## 🔑 3. Comment l'utilisateur se connecte

### **Étape 1 : Activation du compte**
1. L'utilisateur clique sur le lien dans l'email d'invitation
2. Il arrive sur la page `/invitation/[token]`
3. Le système vérifie automatiquement :
   - Validité du token
   - Date d'expiration
   - Si le lien n'a pas déjà été utilisé

### **Étape 2 : Création des identifiants**
1. **Email pré-rempli** (celui fourni par l'admin)
2. **Création d'un mot de passe** (minimum 6 caractères)
3. Validation du formulaire

### **Étape 3 : Finalisation**
- Le système transfère le profil temporaire vers le compte utilisateur réel
- L'invitation est marquée comme "utilisée"
- Redirection vers la page de connexion

### **Étape 4 : Connexion normale**
- Page `/auth`
- Email + mot de passe définis lors de l'activation
- Accès immédiat à toutes les fonctionnalités

---

## 💰 4. Passage en forfait payant (après 3 mois)

### **Système automatique de rappel**
Le passage en payant n'est pas automatique mais géré par rappels :

#### **Déclenchement des rappels :**
1. **Suivi administrateur** des comptes gratuits arrivant à échéance
2. **Demande d'upgrade** générée par l'admin
3. **Email automatique** envoyé à l'utilisateur

#### **Processus d'upgrade :**

**1. Demande d'upgrade (Admin) :**
- L'admin sélectionne les profils à upgrader
- Génération d'un lien de paiement personnalisé
- Envoi automatique de l'email de demande

**2. Email de demande d'upgrade :**
```
Objet : Amélioration de votre profil [artiste/professionnel]

Contenu :
- Rappel des avantages du compte gratuit
- Présentation des fonctionnalités premium
- Lien de paiement sécurisé Stripe
- Date limite pour l'upgrade
- Informations de contact support
```

**3. Paiement par l'utilisateur :**
- Clic sur le lien de paiement
- Redirection vers Stripe Checkout
- Paiement sécurisé par carte bancaire
- Upgrade automatique du profil

**4. Activation des fonctionnalités premium :**
- ✅ **Visibilité premium** dans les recherches
- ✅ **Apparition prioritaire** dans les résultats
- ✅ **Badge premium** sur le profil
- ✅ **Statistiques avancées**
- ✅ **Support prioritaire**

#### **Système de relance :**
- **1er rappel :** 15 jours avant échéance
- **2e rappel :** 7 jours avant échéance  
- **3e rappel :** Le jour de l'échéance
- **Désactivation progressive** si pas de paiement

---

## ⚙️ 5. Configuration technique

### **Variables d'environnement requises :**
```
MAILJET_API_KEY=xxxxx
MAILJET_SECRET_KEY=xxxxx
STRIPE_SECRET_KEY=sk_xxxxx
RESEND_API_KEY=re_xxxxx (pour les rappels)
```

### **Tables de base de données impliquées :**
- `artist_profiles` / `professional_profiles`
- `account_invitations`
- `upgrade_requests`
- `payments`
- `subscriptions`

### **Fonctions Edge utilisées :**
- `create-free-user` : Création du profil temporaire
- `send-account-invitation` : Envoi de l'email d'invitation
- `send-upgrade-reminder` : Rappels de paiement
- `create-subscription` : Gestion des paiements Stripe

---

## 📊 6. Suivi et analytics

### **Tableaux de bord admin :**
- 📈 **Statistiques** des comptes gratuits créés
- 📊 **Taux d'activation** des invitations
- 💳 **Taux de conversion** vers les comptes payants
- 📧 **Statut des emails** (envoyés/ouverts/cliqués)

### **Filtres disponibles :**
- Par type de profil (Artiste/Professionnel)
- Par statut d'activation
- Par date de création
- Par niveau d'accès

---

## 🚨 7. Points d'attention

### **Bonnes pratiques :**
- ✅ Vérifier la validité des emails avant création
- ✅ Personnaliser le message d'invitation si nécessaire
- ✅ Suivre les taux d'activation pour optimiser le processus
- ✅ Planifier les rappels d'upgrade à l'avance

### **Limitations techniques :**
- ⚠️ Invitations valables 7 jours seulement
- ⚠️ Un seul compte par adresse email
- ⚠️ Suppression impossible une fois l'invitation envoyée (seulement désactivation)

### **Support utilisateur :**
- 📞 Contact admin pour problèmes d'activation
- 🔄 Possibilité de renvoyer une invitation expirée
- 🛠️ Modification du profil après activation

---

## 📞 8. Contact et support

**Pour les administrateurs :**
- Interface admin : `/admin`
- Logs des fonctions : Supabase Dashboard > Functions
- Analytics : Onglet "Statistiques" dans l'admin

**Pour les utilisateurs :**
- Support email : contact@lyrisphere.com
- Page d'aide : `/faq`
- Tutoriels : Section "Aide" après connexion

---

*Document mis à jour le : Décembre 2024*
*Version du système : 2.0*