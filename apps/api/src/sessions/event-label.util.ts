import { EventType } from '@prisma/client';
import { TRACK_NAMES } from '@relwick/shared';

export function formatEventLabel(event: {
  type: EventType;
  name: string | null;
  label: string | null;
  section: string | null;
  value: number | null;
  href: string | null;
  meta: unknown;
}): string {
  switch (event.type) {
    case EventType.PAGEVIEW:
      return `Page vue ${event.label ?? event.name ?? ''}`.trim();
    case EventType.CLICK:
    case EventType.CTA_CLICK:
      return formatClick(event);
    case EventType.CONTACT_CLICK:
      return `Contact ${event.label ?? event.name ?? ''}`.trim();
    case EventType.OUTBOUND_CLICK:
      return `Lien externe ${event.label ?? event.href ?? ''}`.trim();
    case EventType.SECTION_VIEW:
      return `Section ${event.section ?? ''} vue ${event.value != null ? `${Math.round(event.value / 1000)} s` : ''}`.trim();
    case EventType.SCROLL_DEPTH:
      return `Scroll ${event.value ?? 0} %`;
    case EventType.FORM_START:
      return 'Formulaire commencé';
    case EventType.FORM_ERROR:
      return `Erreur : ${event.name ?? 'champ'}`;
    case EventType.FORM_SUBMIT:
      return 'Formulaire envoyé';
    case EventType.FILTER_CHANGE:
      return `Filtre réalisations : ${event.value ?? event.name ?? ''}`;
    case EventType.THEME_TOGGLE:
      return 'Bascule de thème';
    case EventType.MENU_TOGGLE:
      return 'Menu mobile';
    default:
      return event.type;
  }
}

function formatClick(event: {
  name: string | null;
  label: string | null;
  section: string | null;
}): string {
  const trackLabel = event.name ? TRACK_NAMES[event.name] : undefined;
  const text = event.label ?? trackLabel ?? event.name ?? 'élément';
  const section = event.section ? ` (section ${event.section})` : '';
  return `Clic sur « ${text} »${section}`;
}
