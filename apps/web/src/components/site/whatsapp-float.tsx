import { MessageCircle } from "lucide-react";
import Link from "next/link";

const wa = process.env.NEXT_PUBLIC_WHATSAPP ?? "243975993035";

export function WhatsappFloat() {
  return (
    <Link
      href={`https://wa.me/${wa}?text=Bonjour%20Elios%2C%20je%20souhaite%20parler%20de%20mon%20projet.`}
      className="rw-btn rw-btn--primary rw-btn--lg whatsapp-float"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contacter Relwick sur WhatsApp"
      data-track="whatsapp_float"
    >
      <MessageCircle size={20} strokeWidth={2} aria-hidden="true" />
      WhatsApp
    </Link>
  );
}
