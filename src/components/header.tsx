"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { BrandMark } from "./brand";
import { authClient } from "@/lib/auth-client";
import { english } from "@/lib/i18n";
export function Header() {
  const path = usePathname(),
    [open, setOpen] = useState(false);
  const { data: session } = authClient.useSession();
  const text = english.navigation;
  const links = [
    { href: "/#pathways", text: text.pathways },
    { href: "/courses", text: text.courses },
    { href: "/coaching", text: text.coaching },
    { href: "/about", text: text.about },
  ];
  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label="Oraculihub home">
        <BrandMark />
        <span>
          ORACULIHUB<small>WISDOM MEETS POSSIBILITY</small>
        </span>
      </Link>
      <nav
        className={open ? "main-nav open" : "main-nav"}
        aria-label="Main navigation"
      >
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={path === l.href ? "active" : ""}
            onClick={() => setOpen(false)}
          >
            {l.text}
          </Link>
        ))}
        <Link
          className="mobile-account"
          href={session ? "/dashboard" : "/sign-in"}
          onClick={() => setOpen(false)}
        >
          {session ? text.learning : text.signIn}
        </Link>
      </nav>
      <div className="header-actions">
        <span className="language" aria-label={english.language}>
          EN
        </span>
        <Link
          className="account-link"
          href={session ? "/dashboard" : "/sign-in"}
        >
          {session ? text.learning : text.signIn}
        </Link>
        <Link
          href={session ? "/dashboard" : "/sign-up"}
          className="button button-outline button-small"
        >
          {session ? text.dashboard : text.begin}
          <ArrowUpRight size={15} />
        </Link>
        <button
          className="menu-button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label={open ? text.close : text.open}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
}
