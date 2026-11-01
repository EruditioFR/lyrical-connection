import React from 'react';
import Layout from '@/components/layout/Layout';
import { Eyebrow } from '@/components/editorial/Editorial';

const CookiesPolicy = () => {
  return (
    <Layout>
      <article className="container mx-auto px-4 md:px-6 py-16 max-w-3xl">
        <Eyebrow className="mb-4">Informations légales</Eyebrow>
        <h1 className="text-4xl md:text-5xl font-serif mb-8">Politique des Cookies</h1>
        
        <div className="border-b border-border">
          <section className="py-8 border-t border-border">
              <h2 className="text-2xl font-serif mb-4">1. Qu'est-ce qu'un cookie ?</h2>
            <div className="space-y-4 leading-relaxed">
              <p>
                Un cookie est un petit fichier texte déposé sur votre terminal (ordinateur, tablette, 
                smartphone) lors de la visite d'un site web. Il permet de reconnaître votre navigateur 
                et de collecter certaines informations sur votre navigation.
              </p>
            </div>
          </section>

          <section className="py-8 border-t border-border">
              <h2 className="text-2xl font-serif mb-4">2. Utilisation des cookies sur Lyrisphere</h2>
            <div className="space-y-4 leading-relaxed">
              <p>
                Lyrisphere utilise des cookies pour améliorer votre expérience utilisateur, 
                analyser l'utilisation de notre site et personnaliser nos services. 
                Nous respectons votre vie privée et vous informons des cookies que nous utilisons.
              </p>
            </div>
          </section>

          <section className="py-8 border-t border-border">
              <h2 className="text-2xl font-serif mb-4">3. Types de cookies utilisés</h2>
            <div className="space-y-6 leading-relaxed">
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
            </div>
          </section>

          <section className="py-8 border-t border-border">
              <h2 className="text-2xl font-serif mb-4">4. Durée de conservation</h2>
            <div className="space-y-4 leading-relaxed">
              <dl className="divide-y divide-border border-y border-border">
                <div className="py-3 sm:grid sm:grid-cols-[14rem_1fr] sm:gap-4">
                  <dt className="font-semibold">Cookies de session</dt>
                  <dd className="text-muted-foreground">Supprimés à la fermeture du navigateur</dd>
                </div>
                <div className="py-3 sm:grid sm:grid-cols-[14rem_1fr] sm:gap-4">
                  <dt className="font-semibold">Cookies persistants</dt>
                  <dd className="text-muted-foreground">Conservés jusqu'à 13 mois maximum</dd>
                </div>
                <div className="py-3 sm:grid sm:grid-cols-[14rem_1fr] sm:gap-4">
                  <dt className="font-semibold">Cookies analytiques</dt>
                  <dd className="text-muted-foreground">Conservés 26 mois maximum</dd>
                </div>
                <div className="py-3 sm:grid sm:grid-cols-[14rem_1fr] sm:gap-4">
                  <dt className="font-semibold">Cookies publicitaires</dt>
                  <dd className="text-muted-foreground">Conservés 13 mois maximum</dd>
                </div>
              </dl>
            </div>
          </section>

          <section className="py-8 border-t border-border">
              <h2 className="text-2xl font-serif mb-4">5. Gestion de vos préférences</h2>
            <div className="space-y-4 leading-relaxed">
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
              
              <div className="border-l-2 border-gold-600 pl-4 mt-4">
                <p className="text-sm">
                  <strong>Note :</strong> Désactiver certains cookies peut affecter le fonctionnement 
                  optimal de notre site et limiter certaines fonctionnalités.
                </p>
              </div>
            </div>
          </section>

          <section className="py-8 border-t border-border">
              <h2 className="text-2xl font-serif mb-4">6. Configuration par navigateur</h2>
            <div className="space-y-4 leading-relaxed">
              <p>Voici comment gérer les cookies selon votre navigateur :</p>
              
              <dl className="divide-y divide-border border-y border-border">
                <div className="py-3 sm:grid sm:grid-cols-[14rem_1fr] sm:gap-4">
                  <dt className="font-semibold">Chrome</dt>
                  <dd className="text-muted-foreground">Paramètres → Confidentialité et sécurité → Cookies</dd>
                </div>
                <div className="py-3 sm:grid sm:grid-cols-[14rem_1fr] sm:gap-4">
                  <dt className="font-semibold">Firefox</dt>
                  <dd className="text-muted-foreground">Préférences → Vie privée et sécurité → Cookies</dd>
                </div>
                <div className="py-3 sm:grid sm:grid-cols-[14rem_1fr] sm:gap-4">
                  <dt className="font-semibold">Safari</dt>
                  <dd className="text-muted-foreground">Préférences → Confidentialité → Cookies</dd>
                </div>
                <div className="py-3 sm:grid sm:grid-cols-[14rem_1fr] sm:gap-4">
                  <dt className="font-semibold">Edge</dt>
                  <dd className="text-muted-foreground">Paramètres → Cookies et autorisations</dd>
                </div>
              </dl>
            </div>
          </section>

          <section className="py-8 border-t border-border">
              <h2 className="text-2xl font-serif mb-4">7. Cookies tiers</h2>
            <div className="space-y-4 leading-relaxed">
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
            </div>
          </section>

          <section className="py-8 border-t border-border">
              <h2 className="text-2xl font-serif mb-4">8. Vos droits</h2>
            <div className="space-y-4 leading-relaxed">
              <p>
                Vous disposez de droits concernant les cookies conformément au RGPD :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                <li>Droit d'information sur l'utilisation des cookies</li>
                <li>Droit de consentement libre et éclairé</li>
                <li>Droit de retrait du consentement à tout moment</li>
                <li>Droit d'opposition au traçage publicitaire</li>
              </ul>
            </div>
          </section>

          <section className="py-8 border-t border-border">
              <h2 className="text-2xl font-serif mb-4">9. Contact</h2>
            <div className="space-y-4 leading-relaxed">
              <p>
                Pour toute question sur notre politique des cookies, contactez-nous :
              </p>
              <div className="mt-4 space-y-2">
                <p><strong>Email :</strong> cookies@lyrisphere.com</p>
              </div>
            </div>
          </section>

          <section className="py-8 border-t border-border">
              <h2 className="text-2xl font-serif mb-4">10. Mise à jour</h2>
            <div className="space-y-4 leading-relaxed">
              <p>
                Cette politique des cookies peut être mise à jour pour refléter les changements 
                dans nos pratiques ou pour d'autres raisons opérationnelles, légales ou réglementaires.
              </p>
              <p className="mt-4 text-sm text-muted-foreground">
                Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
              </p>
            </div>
          </section>
        </div>
      </article>
    </Layout>
  );
};

export default CookiesPolicy;