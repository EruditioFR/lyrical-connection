import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const LegalNotice = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Mentions Légales</h1>
          <p className="text-muted-foreground">
            Informations légales relatives à l'utilisation de Lyrisphere
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Identification de l'éditeur</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Nom de la société :</h3>
                <p>Lyrisphere</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Forme juridique :</h3>
                <p>[À compléter]</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Adresse du siège social :</h3>
                <p>[À compléter]</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Numéro de téléphone :</h3>
                <p>[À compléter]</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Adresse e-mail :</h3>
                <p>contact@lyrisphere.com</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Directeur de la publication</CardTitle>
            </CardHeader>
            <CardContent>
              <p>[À compléter - Nom du directeur de la publication]</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hébergement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Nom de l'hébergeur :</h3>
                <p>Supabase Inc.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Adresse :</h3>
                <p>970 Toa Payoh North #07-04, Singapore 318992</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Propriété intellectuelle</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
              </p>
              <p>
                La reproduction de tout ou partie de ce site sur un support électronique quel qu'il soit est formellement interdite sauf autorisation expresse du directeur de la publication.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Limitation de responsabilité</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Les informations contenues sur ce site sont aussi précises que possible et le site remis à jour à différentes périodes de l'année, mais peut toutefois contenir des inexactitudes ou des omissions.
              </p>
              <p className="mb-4">
                Si vous constatez une lacune, erreur ou ce qui parait être un dysfonctionnement, merci de bien vouloir le signaler par email, à l'adresse contact@lyrisphere.com, en décrivant le problème de la façon la plus précise possible.
              </p>
              <p>
                Tout contenu téléchargé se fait aux risques et périls de l'utilisateur et sous sa seule responsabilité. En conséquence, ne saurait être tenu responsable d'un quelconque dommage subi par l'ordinateur de l'utilisateur ou d'une quelconque perte de données consécutives au téléchargement.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Droit applicable et attribution de juridiction</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Tout litige en relation avec l'utilisation du site Lyrisphere est soumis au droit français. Il est fait attribution exclusive de juridiction aux tribunaux compétents de [À compléter].
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Collecte et traitement des données personnelles</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Conformément aux dispositions de la loi n° 78-17 du 6 janvier 1978 modifiée relative à l'informatique, aux fichiers et aux libertés et du Règlement Général sur la Protection des Données (RGPD), l'utilisateur dispose d'un droit d'accès, de rectification et de suppression des données le concernant.
              </p>
              <p>
                Pour exercer ce droit, adressez-vous à : contact@lyrisphere.com
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default LegalNotice;