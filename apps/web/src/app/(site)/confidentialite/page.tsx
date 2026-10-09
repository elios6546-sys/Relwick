import Link from "next/link";

/* Texte à faire relire par un juriste avant mise en ligne publique. */

export const metadata = {
  title: "Confidentialité",
};

export default function ConfidentialitePage() {
  return (
    <main className="site-container legal-page">
      <h1 className="legal-page__title">Politique de confidentialité</h1>
      <p className="site-body site-body--muted">Dernière mise à jour : octobre 2026</p>

      <section style={{ marginTop: 32 }}>
        <h2 className="legal-page__h2">Responsable du traitement</h2>
        <p>
          Relwick, Elios Ngombe, Kolwezi, République démocratique du Congo —{" "}
          <a href="mailto:elios6546@gmail.com">elios6546@gmail.com</a>.
        </p>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 className="legal-page__h2">Mesure d&apos;audience</h2>
        <p>
          Nous mesurons l&apos;utilisation de ce site pour l&apos;améliorer. Les données suivantes
          peuvent être enregistrées pour chaque visite :
        </p>
        <ul>
          <li>Adresse IP complète (IPv4 ou IPv6)</li>
          <li>Localisation approximative déduite de l&apos;IP (pays, région, ville, coordonnées approximatives, rayon de précision)</li>
          <li>Opérateur ou FAI (ASN)</li>
          <li>Appareil, navigateur, système d&apos;exploitation, tailles d&apos;écran et de fenêtre</li>
          <li>Langue et fuseau horaire du navigateur</li>
          <li>Pages consultées, sections vues, clics, profondeur de scroll, temps actif sur le site</li>
          <li>Provenance (referrer, campagnes UTM, catégorie de source)</li>
        </ul>
        <p>
          Nous n&apos;enregistrons pas le contenu des champs de formulaire dans le traceur. Le cookie{" "}
          <code>rw_vid</code> (identifiant aléatoire, 13 mois, SameSite=Lax) permet de distinguer
          les visiteurs.
        </p>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 className="legal-page__h2">Formulaire « Réserver un appel »</h2>
        <p>
          Les coordonnées que vous envoyez (nom, téléphone, e-mail facultatif, type de projet,
          créneau, message) sont utilisées uniquement pour vous recontacter au sujet de votre
          demande.
        </p>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 className="legal-page__h2">Finalités et conservation</h2>
        <p>
          Finalités : comprendre l&apos;utilisation du site, améliorer nos services et suivre les
          demandes reçues. Durée : détail des visites conservé environ 13 mois (395 jours, réglable) ;
          demandes d&apos;appel conservées jusqu&apos;à traitement ou suppression manuelle.
        </p>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 className="legal-page__h2">Partage et hébergement</h2>
        <p>
          Aucune revente ni partage de ces données à des tiers à des fins commerciales. Les données
          sont hébergées sur l&apos;infrastructure choisie pour faire tourner le site et l&apos;API
          Relwick (base MySQL associée au projet).
        </p>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 className="legal-page__h2">Vos droits</h2>
        <p>
          Vous pouvez demander l&apos;accès, la rectification ou la suppression de vos données en
          écrivant à <a href="mailto:elios6546@gmail.com">elios6546@gmail.com</a>.
        </p>
      </section>

      <p style={{ marginTop: 40 }}>
        <Link href="/">Retour à l&apos;accueil</Link>
      </p>
    </main>
  );
}
