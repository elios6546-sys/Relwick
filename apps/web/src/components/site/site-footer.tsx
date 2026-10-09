import Image from "next/image";
import Link from "next/link";

const wa = process.env.NEXT_PUBLIC_WHATSAPP ?? "243975993035";

export function SiteFooter() {
  return (
    <footer data-section="footer" data-theme="dark" className="site-footer">
      <div className="site-container">
        <div className="footer-grid">
          <div style={{ maxWidth: 360 }}>
            <Image
              src="/brand/relwick-logo-on-dark.svg"
              alt="Relwick"
              width={120}
              height={32}
              style={{ height: 32, width: "auto", display: "block" }}
            />
            <p style={{ margin: "16px 0 0", color: "var(--rw-text-muted)", textWrap: "pretty" }}>
              Agence de création de sites web et d’applications Android, iOS et PC, basée à
              Kolwezi.
            </p>
          </div>
          <div className="footer-cols">
            <FooterCol title="Services">
              <FooterLink href="#services" track="footer_link_services">
                Sites web
              </FooterLink>
              <FooterLink href="#services" track="footer_link_services">
                Applications Android
              </FooterLink>
              <FooterLink href="#services" track="footer_link_services">
                Applications iOS
              </FooterLink>
              <FooterLink href="#services" track="footer_link_services">
                Logiciels PC
              </FooterLink>
            </FooterCol>
            <FooterCol title="Agence">
              <FooterLink href="#realisations" track="footer_link_realisations">
                Réalisations
              </FooterLink>
              <FooterLink href="#apropos" track="footer_link_apropos">
                À propos
              </FooterLink>
              <FooterLink href="#contact" track="footer_link_contact">
                Réserver un appel
              </FooterLink>
            </FooterCol>
            <FooterCol title="Contact">
              <FooterLink href="mailto:elios6546@gmail.com" track="footer_link_contact">
                elios6546@gmail.com
              </FooterLink>
              <FooterLink href="tel:+243975993035" track="footer_link_contact">
                +243 975 993 035
              </FooterLink>
              <FooterLink href={`https://wa.me/${wa}`} track="footer_link_contact" external>
                WhatsApp
              </FooterLink>
              <span>Kolwezi, RDC</span>
            </FooterCol>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Relwick · Kolwezi, République démocratique du Congo</span>
          <div className="footer-bottom__links">
            <Link href="/confidentialite" data-track="footer_link_confidentialite">
              Confidentialité
            </Link>
            <Link href="/mentions-legales" data-track="footer_link_mentions">
              Mentions légales
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="footer-col">
      <h4>{title}</h4>
      {children}
    </div>
  );
}

function FooterLink({
  href,
  track,
  external,
  children,
}: {
  href: string;
  track: string;
  external?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      data-track={track}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </Link>
  );
}
