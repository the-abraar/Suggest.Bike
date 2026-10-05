"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Heart, Menu, Moon, Sun, X } from "lucide-react";
import { Logo } from "./Logo";
import { useLang, type DictKey } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { SearchBox } from "./SearchBox";

const NAV: { href: string; k: DictKey }[] = [
  { href: "/match/", k: "nav.match" },
  { href: "/bikes/", k: "nav.browse" },
  { href: "/compare/", k: "nav.compare" },
  { href: "/cost/", k: "nav.cost" },
  { href: "/guide/", k: "nav.guide" },
];

export function Header() {
  const pathname = usePathname();
  const { t } = useLang();
  const { saved, ready } = useStore();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 4);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  const active = (href: string) => pathname?.startsWith(href.replace(/\/$/, "")) ?? false;

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-[background,box-shadow,border-color] duration-200 ${
          scrolled || open ? "border-b border-line bg-bg/85 backdrop-blur-xl" : "border-b border-transparent bg-bg"
        }`}
      >
        <div className="container-x flex h-16 items-center gap-6">
          <Link href="/" className="shrink-0 rounded-lg" aria-label="Suggest.Bike home">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`rounded-lg px-3 py-2 text-[14.5px] font-medium transition-colors ${
                  active(n.href) ? "text-ink bg-surface-2" : "text-muted hover:text-ink"
                }`}
              >
                {t(n.k)}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            <div className="hidden w-64 md:block xl:w-72">
              <SearchBox compact />
            </div>
            <Link
              href="/saved/"
              className="relative grid h-10 w-10 place-items-center rounded-xl text-ink-2 hover:bg-surface-2"
              aria-label={t("nav.saved")}
            >
              <Heart size={19} />
              {ready && saved.length > 0 && (
                <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-signal px-1 text-[10px] font-bold text-white tnum">
                  {saved.length}
                </span>
              )}
            </Link>
            <LangToggle />
            <ThemeToggle />
            <button
              className="grid h-10 w-10 place-items-center rounded-xl text-ink hover:bg-surface-2 lg:hidden"
              onClick={() => setOpen((o) => !o)}
              aria-label="Menu"
              aria-expanded={open}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>
      {/* Outside <header>: its backdrop-filter would otherwise trap this fixed panel inside the 64px bar. */}
      {open && (
        <div className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto bg-bg lg:hidden animate-fade">
          <div className="container-x space-y-6 py-6">
            <SearchBox />
            <nav className="grid gap-1" aria-label="Mobile">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`rounded-xl px-4 py-3.5 text-lg font-medium ${active(n.href) ? "bg-surface-2 text-ink" : "text-ink-2"}`}
                >
                  {t(n.k)}
                </Link>
              ))}
              <Link href="/saved/" className="rounded-xl px-4 py-3.5 text-lg font-medium text-ink-2">
                {t("nav.saved")} {ready && saved.length > 0 && <span className="text-muted">({saved.length})</span>}
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <button
      onClick={() => setLang(lang === "en" ? "bn" : "en")}
      className="grid h-10 min-w-10 place-items-center rounded-xl px-2 text-[13px] font-semibold text-ink-2 hover:bg-surface-2"
      aria-label={lang === "en" ? "বাংলায় দেখুন" : "Switch to English"}
      title={lang === "en" ? "বাংলায় দেখুন" : "Switch to English"}
    >
      {lang === "en" ? "বাং" : "EN"}
    </button>
  );
}

function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);
  useEffect(() => {
    setTheme((document.documentElement.dataset.theme as "light" | "dark") || "light");
  }, []);
  const flip = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("sb-theme", next);
    } catch {}
    setTheme(next);
  };
  return (
    <button onClick={flip} className="grid h-10 w-10 place-items-center rounded-xl text-ink-2 hover:bg-surface-2" aria-label="Toggle dark mode">
      {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
    </button>
  );
}
