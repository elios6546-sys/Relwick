import { SiteHeader } from "./site-header";
import { Hero } from "./hero";
import { Services } from "./services";
import { Realisations } from "./realisations";
import { APropos } from "./apropos";
import { ContactSection } from "./contact-section";
import { SiteFooter } from "./site-footer";
import { PrivacyNotice } from "./privacy-notice";
import { RevealOnScroll } from "./reveal";
import { WhatsappFloat } from "./whatsapp-float";

export function LandingPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <Services />
        <Realisations />
        <APropos />
        <ContactSection />
      </main>
      <SiteFooter />
      <WhatsappFloat />
      <PrivacyNotice />
      <RevealOnScroll />
    </>
  );
}
