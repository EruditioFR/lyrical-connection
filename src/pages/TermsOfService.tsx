import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TermsOfService = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-center">Conditions Générales d'Utilisation</h1>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Objet</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Les présentes Conditions Générales d'Utilisation (CGU) régissent l'utilisation 
                de la plateforme Lyrisphere, accessible à l'adresse www.lyrisphere.com, 
                qui met en relation des artistes lyriques avec des professionnels de l'opéra 
                et de la musique classique.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Acceptation des conditions</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                L'utilisation de la plateforme Lyrisphere implique l'acceptation pleine et entière 
                des présentes CGU. Si vous n'acceptez pas ces conditions, vous ne devez pas 
                utiliser nos services.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Description des services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Lyrisphere propose les services suivants :</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Création de profils pour artistes lyriques</li>
                <li>Recherche et mise en relation avec des professionnels</li>
                <li>Publication et gestion d'événements artistiques</li>
                <li>Système de messagerie entre utilisateurs</li>
                <li>Gestion de candidatures pour castings et événements</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Inscription et compte utilisateur</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Pour utiliser nos services, vous devez créer un compte en fournissant des 
                informations exactes et à jour. Vous êtes responsable :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>De la confidentialité de vos identifiants de connexion</li>
                <li>De toutes les activités réalisées sous votre compte</li>
                <li>De la mise à jour de vos informations personnelles</li>
                <li>De signaler tout usage non autorisé de votre compte</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Obligations des utilisateurs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>En utilisant Lyrisphere, vous vous engagez à :</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Fournir des informations exactes et authentiques</li>
                <li>Respecter les droits de propriété intellectuelle</li>
                <li>Ne pas publier de contenu illégal, offensant ou inapproprié</li>
                <li>Ne pas utiliser la plateforme à des fins commerciales non autorisées</li>
                <li>Respecter les autres utilisateurs et maintenir un comportement professionnel</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Contenu utilisateur</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Vous conservez la propriété du contenu que vous publiez sur Lyrisphere. 
                Cependant, en publiant du contenu, vous accordez à Lyrisphere une licence 
                non exclusive pour utiliser, reproduire et diffuser ce contenu dans le cadre 
                de nos services. Vous garantissez détenir tous les droits nécessaires sur 
                le contenu publié.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Propriété intellectuelle</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                La plateforme Lyrisphere, son design, ses fonctionnalités et son contenu 
                sont protégés par des droits de propriété intellectuelle. Toute reproduction, 
                distribution ou utilisation non autorisée est interdite.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Tarifs et paiements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Lyrisphere propose des comptes gratuits et des abonnements payants. 
                Les tarifs sont affichés sur notre page de tarification.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Les paiements sont sécurisés et traités par des prestataires tiers</li>
                <li>Les abonnements sont renouvelés automatiquement</li>
                <li>Vous pouvez annuler votre abonnement à tout moment</li>
                <li>Aucun remboursement n'est accordé pour les périodes non utilisées</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Suspension et résiliation</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Lyrisphere se réserve le droit de suspendre ou résilier votre compte en cas 
                de violation des présentes CGU, d'activité frauduleuse ou de comportement 
                inapproprié. Vous pouvez également supprimer votre compte à tout moment 
                depuis vos paramètres de profil.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Limitation de responsabilité</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Lyrisphere s'efforce de fournir un service de qualité mais ne peut garantir 
                la disponibilité permanente de la plateforme. Notre responsabilité est limitée 
                aux montants payés pour nos services. Nous ne sommes pas responsables des 
                dommages indirects ou des pertes de données.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>11. Protection des données</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Le traitement de vos données personnelles est régi par notre 
                <a href="/politique-confidentialite" className="text-primary hover:underline ml-1">
                  Politique de Confidentialité
                </a>.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>12. Droit applicable et juridiction</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Les présentes CGU sont régies par le droit français. En cas de litige, 
                les tribunaux français seront seuls compétents, après tentative de 
                résolution amiable.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>13. Modifications des CGU</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Lyrisphere se réserve le droit de modifier les présentes CGU à tout moment. 
                Les modifications seront publiées sur cette page et prendront effet 
                immédiatement. Il est de votre responsabilité de consulter régulièrement 
                cette page.
              </p>
              <p className="mt-4 text-sm text-muted-foreground">
                Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>14. Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Pour toute question concernant ces CGU, vous pouvez nous contacter :
              </p>
              <div className="mt-4 space-y-2">
                <p><strong>Email :</strong> legal@lyrisphere.com</p>
                <p><strong>Adresse :</strong> Lyrisphere, 123 rue de la Musique, 75001 Paris, France</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default TermsOfService;