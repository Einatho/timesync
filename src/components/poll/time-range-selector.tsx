"use client";

import { cn } from "@/lib/utils";

interface TimeRangeSelectorProps {
  startHour: number;
  endHour: number;
  onStartHourChange: (hour: number) => void;
  onEndHourChange: (hour: number) => void;
}

export function TimeRangeSelector({
  startHour,
  endHour,
  onStartHourChange,
  onEndHourChange,
}: TimeRangeSelectorProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const formatHour = (hour: number) => {
    if (hour === 0) return "12 AM";
    if (hour === 12) return "12 PM";
    if (hour < 12) return `${hour} AM`;
    return `${hour - 12} PM`;
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Start Time */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Start Time
          </label>
          <div className="relative">
            <select
              value={startHour}
              onChange={(e) => onStartHourChange(parseInt(e.target.value))}
              className="w-full h-11 px-4 rounded-lg border-2 border-input bg-background text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              {hours.map((hour) => (
                <option key={hour} value={hour} disabled={hour >= endHour}>
                  {formatHour(hour)}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
              <svg
                className="h-5 w-5 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* End Time */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            End Time
          </label>
          <div className="relative">
            <select
              value={endHour}
              onChange={(e) => onEndHourChange(parseInt(e.target.value))}
              className="w-full h-11 px-4 rounded-lg border-2 border-input bg-background text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              {hours.map((hour) => (
                <option key={hour} value={hour} disabled={hour <= startHour}>
                  {formatHour(hour)}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
              <svg
                className="h-5 w-5 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Range Indicator */}
      <div className="relative pt-2">
        <div className="h-2 rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-300"
            style={{
              marginLeft: `${(startHour / 24) * 100}%`,
              width: `${((endHour - startHour) / 24) * 100}%`,
            }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-slate-500">
          <span>12 AM</span>
          <span>6 AM</span>
          <span>12 PM</span>
          <span>6 PM</span>
          <span>12 AM</span>
        </div>
      </div>

      {/* Duration Info */}
      <div className="text-center text-sm text-slate-600">
        <span className="font-medium text-emerald-600">{endHour - startHour} hours</span>
        {" "}({formatHour(startHour)} – {formatHour(endHour)})
      </div>
    </div>
  );
}

interface SlotDurationSelectorProps {
  duration: 30 | 60;
  onDurationChange: (duration: 30 | 60) => void;
}

export function SlotDurationSelector({
  duration,
  onDurationChange,
}: SlotDurationSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">
        Time Slot Duration
      </label>
      <div className="flex gap-2">
        {[30, 60].map((d) => (
          <button
            key={d}
            onClick={() => onDurationChange(d as 30 | 60)}
            className={cn(
              "flex-1 h-11 rounded-lg text-sm font-medium transition-all duration-200",
              duration === d
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            )}
          >
            {d} minutes
          </button>
        ))}
      </div>
    </div>
  );
}

