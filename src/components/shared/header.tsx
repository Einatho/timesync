"use client";

import Link from "next/link";
import { Calendar, Sparkles } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/60 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/25 transition-transform group-hover:scale-105">
            <Calendar className="h-5 w-5 text-white" />
            <Sparkles className="absolute -top-1 -right-1 h-3.5 w-3.5 text-amber-400" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            TimeSync
          </span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            href="/create"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-600 hover:shadow-xl hover:shadow-emerald-500/30 active:scale-95"
          >
            <Sparkles className="h-4 w-4" />
            New Poll
          </Link>
        </nav>
      </div>
    </header>
  );
}

