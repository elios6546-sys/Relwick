import Link from "next/link";

/* Texte à faire relire par un juriste avant mise en ligne publique. */

export const metadata = {
  title: "Mentions légales",
};

export default function MentionsLegalesPage() {
  return (
    <main className="site-container legal-page">
      <h1 className="legal-page__title">Mentions légales</h1>

      <section style={{ marginTop: 32 }}>
        <h2 className="legal-page__h2">Éditeur du site</h2>
        <p>
          Relwick — Elios Ngombe, développeur professionnel<br />
          Kolwezi, République démocratique du Congo<br />
          E-mail : <a href="mailto:elios6546@gmail.com">elios6546@gmail.com</a><br />
          Téléphone : <a href="tel:+243975993035">+243 975 993 035</a>
        </p>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 className="legal-page__h2">Hébergeur</h2>
        <p>
          Hébergeur de production à compléter lors du choix de l&apos;infogéreur (nom, adresse,
          contact).
        </p>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 className="legal-page__h2">Propriété intellectuelle</h2>
        <p>
          L&apos;ensemble des éléments graphiques, textes et codes de ce site sont la propriété de
          Relwick ou de ses partenaires, sauf mention contraire. Toute reproduction non autorisée est
          interdite.
        </p>
      </section>

      <p style={{ marginTop: 40 }}>
        <Link href="/">Retour à l&apos;accueil</Link>
      </p>
    </main>
  );
}
