"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const KEY = "rw_privacy_notice";

export function PrivacyNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

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
          setVisible(false);
        }}
      >
        Compris
      </Button>
    </div>
  );
}
