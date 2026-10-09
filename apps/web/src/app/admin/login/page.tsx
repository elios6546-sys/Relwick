"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await apiFetch("/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      document.cookie = "rw_ignore=1; Max-Age=31536000; Path=/; SameSite=Lax";
      router.push(searchParams.get("next") || "/admin");
      router.refresh();
    } catch {
      setError("E-mail ou mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background: "var(--rw-bg)",
      }}
    >
      <form
        onSubmit={(e) => void onSubmit(e)}
        className="rw-card"
        style={{ width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", gap: 16 }}
      >
        <h1 style={{ font: "600 22px/1.2 var(--font-sans)", margin: 0 }}>Connexion administrateur</h1>
        <Field label="Adresse e-mail">
          <Input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Mot de passe">
          <Input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        {error ? <p style={{ color: "var(--rw-danger)", margin: 0, fontSize: 14 }}>{error}</p> : null}
        <Button type="submit" disabled={loading}>
          Se connecter
        </Button>
      </form>
    </main>
  );
}
