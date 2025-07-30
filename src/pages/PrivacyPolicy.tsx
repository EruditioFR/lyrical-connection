import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PrivacyPolicy = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-center">Politique de Confidentialité</h1>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Collecte des données personnelles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Lyrisphere collecte les données personnelles suivantes :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Données d'identification (nom, prénom, email)</li>
                <li>Données de profil artistique (voix, répertoire, photos)</li>
                <li>Données de localisation (ville, pays)</li>
                <li>Données de navigation et d'utilisation du site</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Finalités du traitement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Vos données personnelles sont traitées pour les finalités suivantes :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Création et gestion de votre compte utilisateur</li>
                <li>Mise en relation entre artistes et professionnels</li>
                <li>Communication et envoi d'informations relatives aux événements</li>
                <li>Amélioration de nos services</li>
                <li>Respect de nos obligations légales</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Base légale du traitement</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Le traitement de vos données personnelles repose sur :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                <li>Votre consentement pour la création de profil</li>
                <li>L'exécution du contrat de service</li>
                <li>Notre intérêt légitime pour l'amélioration des services</li>
                <li>Le respect d'obligations légales</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Durée de conservation</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Vos données personnelles sont conservées pendant la durée nécessaire aux finalités 
                pour lesquelles elles ont été collectées, et conformément aux obligations légales 
                de conservation. En cas de suppression de votre compte, vos données sont supprimées 
                dans un délai de 30 jours.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Vos droits</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Conformément au RGPD, vous disposez des droits suivants :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                <li>Droit d'accès à vos données</li>
                <li>Droit de rectification</li>
                <li>Droit à l'effacement</li>
                <li>Droit à la limitation du traitement</li>
                <li>Droit à la portabilité des données</li>
                <li>Droit d'opposition</li>
              </ul>
              <p className="mt-4">
                Pour exercer ces droits, contactez-nous à : privacy@lyrisphere.com
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Sécurité des données</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Nous mettons en œuvre des mesures techniques et organisationnelles appropriées 
                pour protéger vos données personnelles contre tout accès non autorisé, 
                altération, divulgation ou destruction.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Transfert de données</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Vos données peuvent être transférées vers des pays tiers dans le cadre de 
                l'utilisation de services techniques. Ces transferts sont encadrés par des 
                garanties appropriées conformément au RGPD.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Cookies</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Notre site utilise des cookies pour améliorer votre expérience de navigation. 
                Vous pouvez configurer vos préférences de cookies dans les paramètres de 
                votre navigateur.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Pour toute question relative à cette politique de confidentialité, 
                vous pouvez nous contacter :
              </p>
              <div className="mt-4 space-y-2">
                <p><strong>Email :</strong> privacy@lyrisphere.com</p>
                <p><strong>Adresse :</strong> Lyrisphere, 123 rue de la Musique, 75001 Paris, France</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Modifications</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Cette politique de confidentialité peut être modifiée. Les modifications 
                seront publiées sur cette page avec la date de mise à jour.
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

export default PrivacyPolicy;