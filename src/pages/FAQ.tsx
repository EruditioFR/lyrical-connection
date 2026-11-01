import React from 'react';
import Layout from '@/components/layout/Layout';
import { Eyebrow } from '@/components/editorial/Editorial';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const FAQ = () => {
  return (
    <Layout>
      <article className="container mx-auto px-4 md:px-6 py-16 max-w-3xl">
        <Eyebrow className="mb-4">Aide</Eyebrow>
        <h1 className="text-4xl md:text-5xl font-serif mb-8">Questions fréquentes</h1>
        
        <div className="border-b border-border">
          {/* Section Général */}
          <section className="py-8 border-t border-border">
              <h2 className="text-2xl font-serif mb-2">Questions Générales</h2>
            <div>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Qu'est-ce que Lyrisphere ?</AccordionTrigger>
                  <AccordionContent>
                    Lyrisphere est une plateforme dédiée aux artistes lyriques et aux professionnels de l'opéra 
                    et de la musique classique. Elle permet aux chanteurs de créer leur profil artistique et 
                    aux professionnels de découvrir de nouveaux talents pour leurs productions.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2">
                  <AccordionTrigger>Comment fonctionne Lyrisphere ?</AccordionTrigger>
                  <AccordionContent>
                    Les artistes créent leur profil avec leur répertoire, photos et enregistrements audio. 
                    Les professionnels peuvent rechercher des artistes selon des critères spécifiques, 
                    publier des annonces de castings et contacter directement les artistes qui les intéressent.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-3">
                  <AccordionTrigger>Qui peut utiliser Lyrisphere ?</AccordionTrigger>
                  <AccordionContent>
                    Lyrisphere s'adresse aux chanteurs lyriques professionnels et étudiants, ainsi qu'aux 
                    directeurs artistiques, agents, maisons d'opéra, festivals, orchestres et autres 
                    professionnels du secteur musical classique.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </section>

          {/* Section Inscription et Profil */}
          <section className="py-8 border-t border-border">
              <h2 className="text-2xl font-serif mb-2">Inscription et Profil</h2>
            <div>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="profile-1">
                  <AccordionTrigger>Comment créer mon profil d'artiste ?</AccordionTrigger>
                  <AccordionContent>
                    Inscrivez-vous gratuitement, complétez vos informations personnelles, ajoutez votre 
                    répertoire, téléchargez vos photos professionnelles et vos enregistrements audio. 
                    Plus votre profil est complet, plus vous avez de chances d'être contacté par des professionnels.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="profile-2">
                  <AccordionTrigger>Quels types de fichiers puis-je télécharger ?</AccordionTrigger>
                  <AccordionContent>
                    Vous pouvez télécharger des photos au format JPEG ou PNG (max 10 MB) et des fichiers 
                    audio au format MP3, WAV ou M4A (max 50 MB). Nous recommandons des enregistrements 
                    de haute qualité pour mettre en valeur votre voix.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="profile-3">
                  <AccordionTrigger>Comment modifier mes informations ?</AccordionTrigger>
                  <AccordionContent>
                    Connectez-vous à votre compte, accédez à votre profil et cliquez sur "Modifier". 
                    Vous pouvez mettre à jour vos informations, ajouter de nouveaux éléments à votre 
                    répertoire ou modifier vos photos à tout moment.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </section>

          {/* Section Abonnements */}
          <section className="py-8 border-t border-border">
              <h2 className="text-2xl font-serif mb-2">Abonnements et Tarifs</h2>
            <div>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="pricing-1">
                  <AccordionTrigger>Lyrisphere est-il gratuit ?</AccordionTrigger>
                  <AccordionContent>
                    Lyrisphere propose un compte gratuit avec des fonctionnalités de base. Pour accéder 
                    à toutes les fonctionnalités (recherche avancée, messagerie illimitée, candidatures 
                    prioritaires), vous pouvez souscrire à un abonnement Premium.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="pricing-2">
                  <AccordionTrigger>Quels sont les avantages du compte Premium ?</AccordionTrigger>
                  <AccordionContent>
                    Le compte Premium inclut : recherche avancée avec filtres détaillés, messagerie 
                    illimitée, candidatures prioritaires aux castings, visibilité accrue de votre profil, 
                    statistiques détaillées et support client prioritaire.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="pricing-3">
                  <AccordionTrigger>Puis-je annuler mon abonnement ?</AccordionTrigger>
                  <AccordionContent>
                    Oui, vous pouvez annuler votre abonnement à tout moment depuis vos paramètres de compte. 
                    L'annulation prendra effet à la fin de votre période de facturation en cours.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </section>

          {/* Section Recherche et Contact */}
          <section className="py-8 border-t border-border">
              <h2 className="text-2xl font-serif mb-2">Recherche et Contact</h2>
            <div>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="search-1">
                  <AccordionTrigger>Comment rechercher des artistes ?</AccordionTrigger>
                  <AccordionContent>
                    Utilisez notre moteur de recherche avec des filtres par tessiture, répertoire, 
                    localisation, âge et expérience. Vous pouvez sauvegarder vos recherches favorites 
                    et recevoir des notifications quand de nouveaux profils correspondent à vos critères.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="search-2">
                  <AccordionTrigger>Comment contacter un artiste ?</AccordionTrigger>
                  <AccordionContent>
                    Depuis le profil d'un artiste, cliquez sur "Contacter" pour envoyer un message privé. 
                    Présentez-vous, votre projet et soyez précis dans votre demande. Les artistes Premium 
                    reçoivent une notification immédiate.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="search-3">
                  <AccordionTrigger>Comment publier une annonce de casting ?</AccordionTrigger>
                  <AccordionContent>
                    Créez un compte professionnel, accédez à la section "Castings" et cliquez sur 
                    "Publier une annonce". Décrivez votre projet, les rôles recherchés, les conditions 
                    et la procédure de candidature.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </section>

          {/* Section Technique */}
          <section className="py-8 border-t border-border">
              <h2 className="text-2xl font-serif mb-2">Questions Techniques</h2>
            <div>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="tech-1">
                  <AccordionTrigger>J'ai oublié mon mot de passe, que faire ?</AccordionTrigger>
                  <AccordionContent>
                    Cliquez sur "Mot de passe oublié" sur la page de connexion. Saisissez votre adresse 
                    email et vous recevrez un lien pour réinitialiser votre mot de passe.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="tech-2">
                  <AccordionTrigger>Pourquoi mon fichier audio ne se télécharge pas ?</AccordionTrigger>
                  <AccordionContent>
                    Vérifiez que votre fichier respecte les formats acceptés (MP3, WAV, M4A) et ne 
                    dépasse pas 50 MB. Assurez-vous d'avoir une connexion internet stable. Si le 
                    problème persiste, contactez notre support.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="tech-3">
                  <AccordionTrigger>Comment supprimer mon compte ?</AccordionTrigger>
                  <AccordionContent>
                    Écrivez à support@lyrisphere.com depuis l'adresse e-mail de votre compte en demandant
                    sa suppression. Elle est définitive : profil, enregistrements et messages sont effacés.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </section>

          {/* Section Confidentialité et Sécurité */}
          <section className="py-8 border-t border-border">
              <h2 className="text-2xl font-serif mb-2">Confidentialité et Sécurité</h2>
            <div>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="privacy-1">
                  <AccordionTrigger>Mes données sont-elles sécurisées ?</AccordionTrigger>
                  <AccordionContent>
                    Oui, nous utilisons un chiffrement SSL et des mesures de sécurité avancées pour 
                    protéger vos données. Consultez notre politique de confidentialité pour plus de détails.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="privacy-2">
                  <AccordionTrigger>Qui peut voir mon profil ?</AccordionTrigger>
                  <AccordionContent>
                    Votre profil est visible par tous les professionnels inscrits sur la plateforme. 
                    Vous pouvez ajuster vos paramètres de confidentialité pour contrôler qui peut 
                    vous contacter directement.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="privacy-3">
                  <AccordionTrigger>Comment signaler un comportement inapproprié ?</AccordionTrigger>
                  <AccordionContent>
                    Écrivez à notre équipe de modération à abuse@lyrisphere.com en indiquant le profil
                    ou le message concerné. Chaque signalement est examiné.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </section>

          {/* Contact */}
          <section className="py-8 border-t border-border">
              <h2 className="text-2xl font-serif mb-2">Vous ne trouvez pas la réponse à votre question ?</h2>
            <div>
              <p className="mb-4">
                Notre équipe support est là pour vous aider. N'hésitez pas à nous contacter :
              </p>
              <div className="space-y-2">
                <p><strong>Email :</strong> support@lyrisphere.com</p>
                <p><strong>Temps de réponse :</strong> Sous 24h en moyenne</p>
                <p><strong>Horaires :</strong> Lundi au vendredi, 9h-18h (heure de Paris)</p>
              </div>
            </div>
          </section>
        </div>
      </article>
    </Layout>
  );
};

export default FAQ;