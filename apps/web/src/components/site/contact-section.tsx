"use client";

import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { CALL_SLOTS, PROJECT_TYPES } from "@relwick/shared";
import { Button } from "@/components/ui/button";
import { Checkbox, Radio } from "@/components/ui/checkbox";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Select } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { useToast } from "@/components/ui/toast";
import { postLead } from "@/lib/api";
import { bindFormTracking, trackFormError, trackFormSubmit } from "@/lib/tracker/forms";
import { flush, getTrackingIds } from "@/lib/tracker";

const schema = z.object({
  fullName: z.string().min(2, "Indiquez votre nom complet."),
  phone: z
    .string()
    .min(1, "Indiquez un numéro de téléphone.")
    .refine((v) => v.replace(/\D/g, "").length >= 9, {
      message: "Numéro incomplet, par exemple +243 975 993 035.",
    }),
  email: z
    .string()
    .email("Adresse e-mail invalide.")
    .optional()
    .or(z.literal("")),
  projectType: z.string().min(1),
  callSlot: z.enum(["Matin", "Après-midi", "Soir"]),
  message: z.string().optional(),
  consent: z.boolean().refine((v) => v === true, {
    message: "Vous devez accepter d’être recontacté.",
  }),
  website: z.literal("").optional(),
});

type FormValues = {
  fullName: string;
  phone: string;
  email: string;
  projectType: string;
  callSlot: (typeof CALL_SLOTS)[number];
  message: string;
  consent: boolean;
  website: string;
};

const MOMENTS: Record<(typeof CALL_SLOTS)[number], string> = {
  Matin: "le matin",
  "Après-midi": "l’après-midi",
  Soir: "le soir",
};

const empty: FormValues = {
  fullName: "",
  phone: "",
  email: "",
  projectType: PROJECT_TYPES[0],
  callSlot: "Matin",
  message: "",
  consent: false,
  website: "",
};

export function ContactSection() {
  const formRef = useRef<HTMLFormElement>(null);
  const { show } = useToast();
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    return bindFormTracking(form);
  }, []);

  const setField = <K extends keyof FormValues>(key: K, val: FormValues[K]) => {
    setValues((v) => ({ ...v, [key]: val }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = () => {
    const parsed = schema.safeParse(values);
    if (parsed.success) return parsed.data;
    const next: Partial<Record<keyof FormValues, string>> = {};
    parsed.error.issues.forEach((issue) => {
      const key = issue.path[0] as keyof FormValues;
      if (!next[key]) next[key] = issue.message;
      trackFormError(String(key));
    });
    setErrors(next);
    return null;
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (values.website) return;
    const data = validate();
    if (!data) return;
    setDialogOpen(true);
  };

  const confirmSend = async () => {
    const data = validate();
    if (!data) return;
    setSubmitting(true);
    try {
      const ids = getTrackingIds();
      const res = await postLead({
        fullName: data.fullName,
        phone: data.phone,
        email: data.email || null,
        projectType: data.projectType,
        callSlot: data.callSlot,
        message: data.message || null,
        consent: true,
        website: "",
        visitorId: ids?.visitorId ?? null,
        sessionId: ids?.sessionId ?? null,
      });
      trackFormSubmit(res.id);
      flush();
      setDialogOpen(false);
      setValues(empty);
      show(
        "Demande envoyée",
        "Elios Ngombe vous rappelle sous 48 h au numéro indiqué.",
      );
    } catch {
      show(
        "Envoi impossible",
        "Vérifiez votre connexion et réessayez dans quelques instants.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const dialogBody = (
    <>
      Elios Ngombe vous rappellera au <strong>{values.phone}</strong>, de préférence{" "}
      <strong>{MOMENTS[values.callSlot]}</strong>, pour parler de votre projet (
      {values.projectType.toLowerCase()}).
      {values.email.trim()
        ? ` Une copie de la demande sera envoyée à ${values.email.trim()}.`
        : null}
    </>
  );

  return (
    <section
      id="contact"
      data-section="contact"
      className="site-section site-container site-section-pad-contact"
    >
      <div className="site-split">
        <div data-rv="0">
          <span className="site-eyebrow">Réserver un appel</span>
          <h2 className="site-h2" style={{ marginBottom: 16 }}>
            Parlons de <span style={{ color: "var(--rw-primary)" }}>votre projet.</span>
          </h2>
          <p className="site-lead site-lead--muted" style={{ marginBottom: 40, maxWidth: 500 }}>
            Laissez vos coordonnées : nous vous rappelons pour un premier échange de 30 minutes,
            gratuit et sans engagement.
          </p>
          <ContactCard />
        </div>

        <form
          ref={formRef}
          onSubmit={onSubmit}
          className="rw-card contact-form"
          data-rv="140"
        >
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden
            value={values.website}
            onChange={(e) => setField("website", e.target.value as "")}
            style={{ position: "absolute", left: -9999, opacity: 0, height: 0 }}
          />
          <div className="form-row-2">
            <Field label="Nom complet" error={errors.fullName}>
              <Input
                value={values.fullName}
                onChange={(e) => setField("fullName", e.target.value)}
                placeholder="Ex. Grâce Mukendi"
                autoComplete="name"
                aria-invalid={!!errors.fullName}
              />
            </Field>
            <Field label="Téléphone ou WhatsApp" error={errors.phone}>
              <Input
                type="tel"
                value={values.phone}
                onChange={(e) => setField("phone", e.target.value)}
                placeholder="+243 9XX XXX XXX"
                autoComplete="tel"
                aria-invalid={!!errors.phone}
              />
            </Field>
          </div>
          <Field
            label="Adresse e-mail"
            hint="Facultatif, pour recevoir une copie de la demande."
            error={errors.email}
          >
            <Input
              type="email"
              value={values.email}
              onChange={(e) => setField("email", e.target.value)}
              placeholder="vous@exemple.com"
              autoComplete="email"
              aria-invalid={!!errors.email}
            />
          </Field>
          <Field label="Type de projet">
            <Select
              value={values.projectType}
              onChange={(e) => setField("projectType", e.target.value)}
            >
              {PROJECT_TYPES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Select>
          </Field>
          <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
            <legend
              style={{
                font: "var(--text-label)",
                color: "var(--rw-text)",
                marginBottom: 10,
              }}
            >
              Moment préféré pour l&apos;appel
            </legend>
            <SegmentedControl
              name="creneau"
              value={values.callSlot}
              onChange={(v) => setField("callSlot", v)}
              options={CALL_SLOTS.map((s) => ({ value: s, label: s }))}
            />
            <div className="sr-only">
              {CALL_SLOTS.map((slot) => (
                <Radio
                  key={slot}
                  name="creneau-access"
                  label={slot}
                  checked={values.callSlot === slot}
                  onChange={() => setField("callSlot", slot)}
                />
              ))}
            </div>
          </fieldset>
          <Field label="Votre projet en quelques lignes">
            <Input
              multiline
              rows={4}
              value={values.message ?? ""}
              onChange={(e) => setField("message", e.target.value)}
              placeholder="Ex. Je voudrais une application pour gérer les commandes de ma boutique."
            />
          </Field>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <Checkbox
              label="J’accepte d’être recontacté au sujet de ma demande."
              checked={values.consent}
              onChange={(e) => setField("consent", e.target.checked)}
            />
            {errors.consent ? (
              <span className="rw-field__hint rw-field__hint--error" style={{ paddingLeft: 28 }}>
                {errors.consent}
              </span>
            ) : null}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px 20px" }}>
            <Button
              type="submit"
              size="lg"
              arrow
              data-track="form_submit"
              disabled={submitting}
            >
              Réserver l&apos;appel
            </Button>
            <span style={{ font: "var(--text-small)", color: "var(--rw-text-muted)" }}>
              Appel gratuit, sans engagement.
            </span>
          </div>
        </form>
      </div>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Confirmer votre demande ?"
        actions={
          <>
            <Button
              variant="ghost"
              onClick={() => setDialogOpen(false)}
              data-track="dialog_modifier"
            >
              Modifier
            </Button>
            <Button
              arrow
              onClick={() => void confirmSend()}
              disabled={submitting}
              data-track="dialog_confirmer"
            >
              Confirmer
            </Button>
          </>
        }
      >
        {dialogBody}
      </Dialog>
    </section>
  );
}

function ContactCard() {
  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "20px 0",
          borderTop: "1px solid var(--rw-line)",
          borderBottom: "1px solid var(--rw-line)",
          marginBottom: 28,
        }}
      >
        <span
          style={{
            flex: "none",
            display: "grid",
            placeItems: "center",
            width: 56,
            height: 56,
            borderRadius: "16px 0",
            background: "var(--rw-primary)",
            color: "var(--rw-on-primary)",
            font: "600 18px/1 var(--font-sans)",
            letterSpacing: "-0.01em",
          }}
        >
          EN
        </span>
        <div>
          <div style={{ font: "var(--text-h3)", letterSpacing: "var(--ls-heading)" }}>
            Elios Ngombe
          </div>
          <div style={{ font: "var(--text-small)", color: "var(--rw-text-muted)", marginTop: 2 }}>
            Développeur professionnel, votre interlocuteur du premier appel à la mise en ligne
          </div>
        </div>
      </div>
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "flex",
          flexDirection: "column",
          gap: 14,
          font: "var(--text-body)",
        }}
      >
        <li style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Mail size={20} style={{ color: "var(--rw-primary)" }} />
          <a className="contact-link" href="mailto:elios6546@gmail.com" data-track="contact_email">
            elios6546@gmail.com
          </a>
        </li>
        <li style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Phone size={20} style={{ color: "var(--rw-primary)" }} />
          <a className="contact-link" href="tel:+243975993035" data-track="contact_tel">
            +243 975 993 035
          </a>
        </li>
        <li style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <MessageCircle size={20} style={{ color: "var(--rw-primary)" }} />
          <a
            className="contact-link"
            href="https://wa.me/243975993035?text=Bonjour%20Elios%2C%20je%20souhaite%20parler%20de%20mon%20projet."
            target="_blank"
            rel="noopener noreferrer"
            data-track="contact_whatsapp"
          >
            Écrire sur WhatsApp
          </a>
        </li>
        <li style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <MapPin size={20} style={{ color: "var(--rw-primary)" }} />
          <span>Kolwezi, République démocratique du Congo</span>
        </li>
      </ul>
    </>
  );
}
