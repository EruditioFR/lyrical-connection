import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CookiesPolicy = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-center">Politique des Cookies</h1>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Qu'est-ce qu'un cookie ?</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Un cookie est un petit fichier texte déposé sur votre terminal (ordinateur, tablette, 
                smartphone) lors de la visite d'un site web. Il permet de reconnaître votre navigateur 
                et de collecter certaines informations sur votre navigation.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Utilisation des cookies sur Lyrisphere</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Lyrisphere utilise des cookies pour améliorer votre expérience utilisateur, 
                analyser l'utilisation de notre site et personnaliser nos services. 
                Nous respectons votre vie privée et vous informons des cookies que nous utilisons.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Types de cookies utilisés</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">Cookies strictement nécessaires</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Ces cookies sont indispensables au fonctionnement du site et ne peuvent pas être désactivés.
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                  <li>Cookies de session pour maintenir votre connexion</li>
                  <li>Cookies de sécurité pour protéger votre compte</li>
                  <li>Cookies de préférences de langue</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Cookies de performance</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Ces cookies nous permettent d'analyser l'utilisation du site pour l'améliorer.
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                  <li>Google Analytics pour les statistiques de visite</li>
                  <li>Cookies de mesure d'audience</li>
                  <li>Cookies de performance technique</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Cookies de fonctionnalité</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Ces cookies permettent d'améliorer les fonctionnalités et la personnalisation.
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                  <li>Cookies de préférences utilisateur</li>
                  <li>Cookies de thème (mode sombre/clair)</li>
                  <li>Cookies de recherches sauvegardées</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Cookies publicitaires</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Ces cookies sont utilisés pour afficher des publicités pertinentes.
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                  <li>Cookies de ciblage publicitaire</li>
                  <li>Cookies de réseaux sociaux</li>
                  <li>Cookies de partenaires publicitaires</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Durée de conservation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h5 className="font-semibold mb-2">Cookies de session</h5>
                  <p className="text-sm">Supprimés à la fermeture du navigateur</p>
                </div>
                <div className="border rounded-lg p-4">
                  <h5 className="font-semibold mb-2">Cookies persistants</h5>
                  <p className="text-sm">Conservés jusqu'à 13 mois maximum</p>
                </div>
                <div className="border rounded-lg p-4">
                  <h5 className="font-semibold mb-2">Cookies analytiques</h5>
                  <p className="text-sm">Conservés 26 mois maximum</p>
                </div>
                <div className="border rounded-lg p-4">
                  <h5 className="font-semibold mb-2">Cookies publicitaires</h5>
                  <p className="text-sm">Conservés 13 mois maximum</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Gestion de vos préférences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Vous avez le contrôle sur les cookies déposés sur votre terminal. 
                Vous pouvez à tout moment :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Accepter ou refuser les cookies via notre bandeau de consentement</li>
                <li>Modifier vos préférences dans les paramètres de votre compte</li>
                <li>Configurer votre navigateur pour bloquer certains cookies</li>
                <li>Supprimer les cookies déjà stockés</li>
              </ul>
              
              <div className="bg-muted p-4 rounded-lg mt-4">
                <p className="text-sm">
                  <strong>Note :</strong> Désactiver certains cookies peut affecter le fonctionnement 
                  optimal de notre site et limiter certaines fonctionnalités.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Configuration par navigateur</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Voici comment gérer les cookies selon votre navigateur :</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h5 className="font-semibold mb-2">Chrome</h5>
                  <p className="text-sm">Paramètres → Confidentialité et sécurité → Cookies</p>
                </div>
                <div className="border rounded-lg p-4">
                  <h5 className="font-semibold mb-2">Firefox</h5>
                  <p className="text-sm">Préférences → Vie privée et sécurité → Cookies</p>
                </div>
                <div className="border rounded-lg p-4">
                  <h5 className="font-semibold mb-2">Safari</h5>
                  <p className="text-sm">Préférences → Confidentialité → Cookies</p>
                </div>
                <div className="border rounded-lg p-4">
                  <h5 className="font-semibold mb-2">Edge</h5>
                  <p className="text-sm">Paramètres → Cookies et autorisations</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Cookies tiers</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Certains cookies sont déposés par des services tiers que nous utilisons :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                <li><strong>Google Analytics :</strong> Analyse d'audience et de performance</li>
                <li><strong>Réseaux sociaux :</strong> Boutons de partage et widgets</li>
                <li><strong>Stripe :</strong> Traitement sécurisé des paiements</li>
                <li><strong>Supabase :</strong> Authentification et base de données</li>
              </ul>
              <p className="mt-4 text-sm text-muted-foreground">
                Ces services ont leurs propres politiques de cookies que nous vous invitons à consulter.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Vos droits</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Vous disposez de droits concernant les cookies conformément au RGPD :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                <li>Droit d'information sur l'utilisation des cookies</li>
                <li>Droit de consentement libre et éclairé</li>
                <li>Droit de retrait du consentement à tout moment</li>
                <li>Droit d'opposition au traçage publicitaire</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Pour toute question sur notre politique des cookies, contactez-nous :
              </p>
              <div className="mt-4 space-y-2">
                <p><strong>Email :</strong> cookies@lyrisphere.com</p>
                <p><strong>Adresse :</strong> Lyrisphere, 123 rue de la Musique, 75001 Paris, France</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Mise à jour</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Cette politique des cookies peut être mise à jour pour refléter les changements 
                dans nos pratiques ou pour d'autres raisons opérationnelles, légales ou réglementaires.
              </p>
              <p className="mt-4 text-sm text-muted-foreground">
                Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default CookiesPolicy;