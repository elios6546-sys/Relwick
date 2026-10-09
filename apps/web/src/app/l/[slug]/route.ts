import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * Lien court de partage : /l/abc1234 → page cible avec les paramètres UTM
 * et le marqueur du lien (rwl). Le compteur d'ouvertures est incrémenté par l'API.
 */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const { slug } = await ctx.params;
  const safe = /^[A-Za-z0-9_-]{4,16}$/.test(slug) ? slug : null;

  if (safe) {
    try {
      const res = await fetch(`${API_URL}/v1/links/${encodeURIComponent(safe)}/resolve`, {
        method: "POST",
        headers: { "X-Requested-With": "relwick" },
        cache: "no-store",
      });
      if (res.ok) {
        const data = (await res.json()) as { url?: string };
        if (data.url && data.url.startsWith(SITE_URL)) {
          return NextResponse.redirect(data.url, { status: 302 });
        }
      }
    } catch {
      // API indisponible : on renvoie vers l'accueil sans suivi.
    }
  }

  return NextResponse.redirect(`${SITE_URL}/`, { status: 302 });
}
