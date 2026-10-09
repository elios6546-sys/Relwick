"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  Download,
  ExternalLink,
  Globe2,
  LayoutDashboard,
  Link2,
  LogOut,
  Monitor,
  Moon,
  MousePointerClick,
  PhoneCall,
  Route,
  Settings,
  Share2,
  Sun,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { LeadStatus } from "@relwick/shared";
import { useTheme } from "@/components/theme/theme-provider";
import { Badge } from "@/components/ui/badge";
import { IconButton } from "@/components/ui/icon-button";
import { Logo } from "@/components/ui/logo";
import { useToast } from "@/components/ui/toast";
import { apiFetch, getApiUrl } from "@/lib/api";
import {
  DASH_PERIODS,
  PERIOD_LABEL,
  type PeriodPreset,
  presetToRange,
  readPreset,
} from "@/lib/admin/period";
import { formatNumber } from "@/lib/format";
import { useStatsSearchParams } from "./use-admin-query";

interface AdminMe {
  email: string;
  name: string;
}

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  count?: "visits" | "leads";
}

const NAV_GROUPS: Array<{ label: string; items: NavItem[] }> = [
  {
    label: "Analyse",
    items: [
      { href: "/admin", label: "Vue d’ensemble", icon: LayoutDashboard, exact: true },
      { href: "/admin/sessions", label: "Visiteurs", icon: Users, count: "visits" },
      { href: "/admin/clicks", label: "Clics", icon: MousePointerClick },
      { href: "/admin/behavior", label: "Comportement", icon: Route },
    ],
  },
  {
    label: "Détails",
    items: [
      { href: "/admin/live", label: "En direct", icon: Activity },
      { href: "/admin/geo", label: "Géographie", icon: Globe2 },
      { href: "/admin/sources", label: "Sources", icon: Share2 },
      { href: "/admin/devices", label: "Appareils", icon: Monitor },
    ],
  },
  {
    label: "Gestion",
    items: [
      { href: "/admin/leads", label: "Demandes d’appel", icon: PhoneCall, count: "leads" },
      { href: "/admin/links", label: "Liens de partage", icon: Link2 },
      { href: "/admin/settings", label: "Paramètres", icon: Settings },
    ],
  },
];

const ALL_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

function initials(name: string | undefined): string {
  if (!name) return "RW";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "";
  const b = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : (parts[0]?.[1] ?? "");
  return (a + b).toUpperCase() || "RW";
}

export function useLiveCount(): number {
  const { data } = useQuery({
    queryKey: ["admin", "live", "count"],
    queryFn: () => apiFetch<{ count: number }>("/v1/admin/stats/live"),
    refetchInterval: 15_000,
  });
  return data?.count ?? 0;
}

function PeriodTabs({
  value,
  onChange,
}: {
  value: PeriodPreset;
  onChange: (p: PeriodPreset) => void;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const [ink, setInk] = useState<{ left: number; width: number } | null>(null);

  useLayoutEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const measure = () => {
      const btn = el.querySelector<HTMLButtonElement>('[role="tab"][aria-selected="true"]');
      if (!btn) return;
      setInk({ left: btn.offsetLeft, width: btn.offsetWidth });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [value]);

  return (
    <div className="dash-periods">
      <div ref={listRef} className="rw-tabs rw-tabs--pill" role="tablist" aria-label="Période">
        {ink ? (
          <span
            className="rw-tabs__ink"
            aria-hidden="true"
            style={{ left: ink.left, width: ink.width }}
          />
        ) : null}
        {DASH_PERIODS.map((p) => (
          <button
            key={p.value}
            type="button"
            role="tab"
            className="rw-tab"
            aria-selected={value === p.value}
            onClick={() => onChange(p.value)}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function AdminShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme, toggleTheme } = useTheme();
  const toast = useToast();
  const qs = useStatsSearchParams();
  const preset = readPreset(searchParams);
  const live = useLiveCount();

  const { data: me } = useQuery({
    queryKey: ["admin", "me"],
    queryFn: () => apiFetch<AdminMe>("/v1/auth/me"),
  });

  const { data: newLeads } = useQuery({
    queryKey: ["admin", "leads", "new-count"],
    queryFn: async () => {
      const res = await apiFetch<{ total: number }>(
        `/v1/admin/leads?page=1&pageSize=1&status=${LeadStatus.NEW}`,
      );
      return res.total;
    },
    refetchInterval: 60_000,
  });

  const { data: overview } = useQuery({
    queryKey: ["admin", "stats", "overview", qs],
    queryFn: () =>
      apiFetch<{ current: { visits: number } }>(`/v1/admin/stats/overview?${qs}`),
  });

  const navQs = useMemo(() => {
    const range = presetToRange(preset);
    return new URLSearchParams({
      preset,
      from: range.from,
      to: range.to,
      compare: "1",
    }).toString();
  }, [preset]);

  const setPeriod = useCallback(
    (p: PeriodPreset) => {
      const range = presetToRange(p);
      const params = new URLSearchParams(searchParams.toString());
      params.set("preset", p);
      params.set("from", range.from);
      params.set("to", range.to);
      params.set("compare", "1");
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams],
  );

  const logout = async () => {
    await apiFetch("/v1/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const exportCsv = async () => {
    try {
      const res = await fetch(`${getApiUrl()}/v1/admin/sessions/export.csv?${qs}`, {
        credentials: "include",
        headers: { "X-Requested-With": "relwick" },
      });
      if (!res.ok) throw new Error(String(res.status));
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `relwick-visites-${preset}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.show("Export prêt", `Visites · ${PERIOD_LABEL[preset]} au format CSV.`);
    } catch {
      toast.show("Export impossible", "Veuillez réessayer dans un instant.");
    }
  };

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  const countFor = (item: NavItem): React.ReactNode => {
    if (item.count === "visits" && overview?.current) {
      return <span className="dash-navbtn__count">{formatNumber(overview.current.visits)}</span>;
    }
    if (item.count === "leads" && newLeads) {
      return <span className="dash-navbtn__pill">{newLeads}</span>;
    }
    return null;
  };

  const renderNavLink = (item: NavItem, withCount: boolean) => (
    <Link
      key={item.href}
      href={`${item.href}?${navQs}`}
      className="dash-navbtn"
      aria-current={isActive(item) ? "page" : undefined}
    >
      <span className="dash-navbtn__icon">
        <item.icon size={withCount ? 18 : 16} strokeWidth={2} />
      </span>
      <span className="dash-navbtn__text">{item.label}</span>
      {withCount ? countFor(item) : null}
    </Link>
  );

  return (
    <div className="dash">
      <aside className="dash-sidebar" aria-label="Navigation principale">
        <div className="dash-sidebar__top">
          <Link href={`/admin?${navQs}`} aria-label="Vue d’ensemble">
            <Logo height={24} />
          </Link>
          <Badge tone="copper">Admin</Badge>
        </div>

        <nav className="dash-nav">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="dash-nav">
              <div className="dash-nav__label">{group.label}</div>
              {group.items.map((item) => renderNavLink(item, true))}
            </div>
          ))}
        </nav>

        <div className="dash-sidebar__bottom">
          <a
            className="dash-navbtn"
            href="/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="dash-navbtn__icon">
              <ExternalLink size={18} strokeWidth={2} />
            </span>
            <span className="dash-navbtn__text">Voir le site</span>
          </a>
          <div className="dash-user">
            <div className="dash-avatar" aria-hidden="true">
              {initials(me?.name)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="dash-user__name">{me?.name ?? "…"}</div>
              <div className="dash-user__role">Administrateur</div>
            </div>
            <IconButton label="Se déconnecter" size="sm" onClick={() => void logout()}>
              <LogOut size={16} />
            </IconButton>
          </div>
        </div>
      </aside>

      <div className="dash-main">
        <header className="dash-header">
          <div className="dash-header__inner">
            <Link href={`/admin?${navQs}`} className="dash-header__logo" aria-label="Vue d’ensemble">
              <Logo height={22} />
            </Link>
            <div className="dash-header__titles">
              <h1 className="dash-header__title">{title}</h1>
              <p className="dash-header__sub">
                {subtitle ?? `Activité du site · ${PERIOD_LABEL[preset]}`}
              </p>
            </div>
            <div className="dash-header__actions">
              <Badge tone="success">
                <span className="dash-live-dot" aria-hidden="true" />
                {live} en ligne
              </Badge>
              <PeriodTabs value={preset} onChange={setPeriod} />
              <button
                type="button"
                className="rw-btn rw-btn--secondary"
                onClick={() => void exportCsv()}
              >
                <Download size={16} strokeWidth={2} />
                Exporter
              </button>
              <IconButton
                label={theme === "dark" ? "Passer en mode clair" : "Passer en mode sombre"}
                onClick={toggleTheme}
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </IconButton>
            </div>
          </div>
          <nav className="dash-subnav" aria-label="Sections">
            {ALL_ITEMS.map((item) => renderNavLink(item, false))}
          </nav>
        </header>

        <main className="dash-content">{children}</main>
      </div>
    </div>
  );
}
