"use client";

import Link from "next/link";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export function Navbar() {
  const { t, lang, toggleLang } = useI18n();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <Link href="/" className="text-sm font-semibold tracking-wide text-slate-900">
            {t.nav.brand}
          </Link>
          <p className="text-xs text-slate-500">{t.nav.tagline}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLang}
            className="gap-1.5 text-slate-600"
          >
            <Globe className="h-4 w-4" />
            {lang === "vi" ? "EN" : "VI"}
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/login">{t.nav.adminLogin}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
