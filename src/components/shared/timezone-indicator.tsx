"use client";

import { useEffect, useState } from "react";
import { Globe } from "lucide-react";
import { formatTimezone, getUserTimezone } from "@/lib/date-utils";

export function TimezoneIndicator() {
  const [timezone, setTimezone] = useState<string>("");

  useEffect(() => {
    setTimezone(getUserTimezone());
  }, []);

  if (!timezone) return null;

  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
      <Globe className="h-3.5 w-3.5" />
      <span>{formatTimezone(timezone)}</span>
    </div>
  );
}

