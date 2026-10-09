"use client";

import { Menu, Moon, Sun, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { EventType } from "@relwick/shared";
import { useTheme } from "@/components/theme/theme-provider";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Logo } from "@/components/ui/logo";
import { track } from "@/lib/tracker";

const NAV = [
  { href: "#services", label: "Services", track: "header_nav_services" },
  { href: "#realisations", label: "Réalisations", track: "header_nav_realisations" },
  { href: "#apropos", label: "À propos", track: "header_nav_apropos" },
  { href: "#contact", label: "Contact", track: "header_nav_contact" },
] as const;

export function SiteHeader() {
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const toggleMenu = () => {
    setMenuOpen((o) => {
      const next = !o;
      track(EventType.MENU_TOGGLE, { value: next ? 1 : 0 });
      return next;
    });
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header
      data-section="header"
      className={`site-header${scrolled ? " site-header--scrolled" : ""}${menuOpen ? " site-header--menu-open" : ""}`}
    >
      <div className="site-header__inner">
        <Link
          href="#accueil"
          className="site-header__logo"
          aria-label="Relwick — accueil"
          data-track="header_logo"
          onClick={closeMenu}
        >
          <Logo />
        </Link>
        <nav className="site-nav site-nav--desktop" style={{ margin: "0 auto" }}>
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} data-track={item.track}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginLeft: "auto" }}>
          <IconButton
            label="Changer de thème"
            data-track="header_theme_toggle"
            onClick={toggleTheme}
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </IconButton>
          <Button
            className="site-header__cta-desktop"
            size="sm"
            arrow
            href="#contact"
            data-track="header_cta_appel"
            data-track-cta
          >
            Réserver un appel
          </Button>
          <IconButton
            className="site-header__menu-btn"
            label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            data-track="header_menu_toggle"
            aria-expanded={menuOpen}
            onClick={toggleMenu}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </IconButton>
        </div>
      </div>
      {menuOpen ? (
        <nav className="site-mobile-nav" data-section="header">
          {NAV.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              data-track={item.track}
              onClick={closeMenu}
              style={{ ["--i" as string]: i }}
            >
              {item.label}
            </Link>
          ))}
          <div
            style={{ display: "flex", paddingTop: 20, ["--i" as string]: NAV.length }}
            onClick={closeMenu}
          >
            <Button
              size="lg"
              arrow
              href="#contact"
              data-track="header_cta_appel"
              data-track-cta
            >
              Réserver un appel
            </Button>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
