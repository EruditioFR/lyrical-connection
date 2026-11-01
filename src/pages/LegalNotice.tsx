import React from 'react';
import Layout from '@/components/layout/Layout';
import { Eyebrow } from '@/components/editorial/Editorial';

const LegalNotice = () => {
  return (
    <Layout>
      <article className="container mx-auto px-4 md:px-6 py-16 max-w-3xl">
        <div className="mb-8">
          <Eyebrow className="mb-4">Informations légales</Eyebrow>
        <h1 className="text-4xl md:text-5xl font-serif mb-4">Mentions Légales</h1>
          <p className="text-muted-foreground">
            Informations légales relatives à l'utilisation de Lyrisphere
          </p>
        </div>

        <div className="border-b border-border">
          <section className="py-8 border-t border-border">
              <h2 className="text-2xl font-serif mb-4">Identification de l'éditeur</h2>
            <div className="space-y-4 leading-relaxed">
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
            </div>
          </section>

          <section className="py-8 border-t border-border">
              <h2 className="text-2xl font-serif mb-4">Directeur de la publication</h2>
            <div className="space-y-4 leading-relaxed">
              <p>[À compléter - Nom du directeur de la publication]</p>
            </div>
          </section>

          <section className="py-8 border-t border-border">
              <h2 className="text-2xl font-serif mb-4">Hébergement</h2>
            <div className="space-y-4 leading-relaxed">
              <div>
                <h3 className="font-semibold mb-2">Nom de l'hébergeur :</h3>
                <p>Supabase Inc.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Adresse :</h3>
                <p>970 Toa Payoh North #07-04, Singapore 318992</p>
              </div>
            </div>
          </section>

          <section className="py-8 border-t border-border">
              <h2 className="text-2xl font-serif mb-4">Propriété intellectuelle</h2>
            <div className="space-y-4 leading-relaxed">
              <p className="mb-4">
                L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
              </p>
              <p>
                La reproduction de tout ou partie de ce site sur un support électronique quel qu'il soit est formellement interdite sauf autorisation expresse du directeur de la publication.
              </p>
            </div>
          </section>

          <section className="py-8 border-t border-border">
              <h2 className="text-2xl font-serif mb-4">Limitation de responsabilité</h2>
            <div className="space-y-4 leading-relaxed">
              <p className="mb-4">
                Les informations contenues sur ce site sont aussi précises que possible et le site remis à jour à différentes périodes de l'année, mais peut toutefois contenir des inexactitudes ou des omissions.
              </p>
              <p className="mb-4">
                Si vous constatez une lacune, erreur ou ce qui parait être un dysfonctionnement, merci de bien vouloir le signaler par email, à l'adresse contact@lyrisphere.com, en décrivant le problème de la façon la plus précise possible.
              </p>
              <p>
                Tout contenu téléchargé se fait aux risques et périls de l'utilisateur et sous sa seule responsabilité. En conséquence, ne saurait être tenu responsable d'un quelconque dommage subi par l'ordinateur de l'utilisateur ou d'une quelconque perte de données consécutives au téléchargement.
              </p>
            </div>
          </section>

          <section className="py-8 border-t border-border">
              <h2 className="text-2xl font-serif mb-4">Droit applicable et attribution de juridiction</h2>
            <div className="space-y-4 leading-relaxed">
              <p>
                Tout litige en relation avec l'utilisation du site Lyrisphere est soumis au droit français. Il est fait attribution exclusive de juridiction aux tribunaux compétents de [À compléter].
              </p>
            </div>
          </section>

          <section className="py-8 border-t border-border">
              <h2 className="text-2xl font-serif mb-4">Collecte et traitement des données personnelles</h2>
            <div className="space-y-4 leading-relaxed">
              <p className="mb-4">
                Conformément aux dispositions de la loi n° 78-17 du 6 janvier 1978 modifiée relative à l'informatique, aux fichiers et aux libertés et du Règlement Général sur la Protection des Données (RGPD), l'utilisateur dispose d'un droit d'accès, de rectification et de suppression des données le concernant.
              </p>
              <p>
                Pour exercer ce droit, adressez-vous à : contact@lyrisphere.com
              </p>
            </div>
          </section>
        </div>
      </article>
    </Layout>
  );
};

export default LegalNotice;