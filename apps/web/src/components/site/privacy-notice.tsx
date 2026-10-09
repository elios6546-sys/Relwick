"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";

const KEY = "rw_privacy_notice";

const subscribeNever = () => () => {};

function alreadySeen(): boolean {
  try {
    return localStorage.getItem(KEY) !== null;
  } catch {
    return false;
  }
}

export function PrivacyNotice() {
  // Côté serveur, on considère le bandeau déjà vu : il n'apparaît qu'après lecture du navigateur.
  const seen = useSyncExternalStore(subscribeNever, alreadySeen, () => true);
  const [dismissed, setDismissed] = useState(false);

  if (seen || dismissed) return null;

  return (
    <div className="privacy-banner" role="region" aria-label="Information sur la mesure d’audience">
      <p style={{ margin: 0, fontSize: 14, color: "var(--rw-text-muted)", flex: 1 }}>
        Ce site mesure son audience pour s&apos;améliorer.{" "}
        <Link href="/confidentialite" style={{ color: "var(--rw-primary)" }}>
          En savoir plus
        </Link>
      </p>
      <Button
        size="sm"
        data-track="privacy_notice_ok"
        onClick={() => {
          try {
            localStorage.setItem(KEY, "1");
          } catch {
            /* ignore */
          }
          setDismissed(true);
        }}
      >
        Compris
      </Button>
    </div>
  );
}
