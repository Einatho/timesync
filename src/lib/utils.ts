import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate a unique ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Format a date for display
export function formatDate(date: Date, format: "short" | "long" | "weekday" = "short"): string {
  const options: Intl.DateTimeFormatOptions = {
    short: { month: "short", day: "numeric" },
    long: { weekday: "long", month: "long", day: "numeric" },
    weekday: { weekday: "short", month: "short", day: "numeric" },
  }[format];
  
  return date.toLocaleDateString("en-US", options);
}

// Format time for display (12-hour format)
export function formatTime(hour: number, minute: number = 0): string {
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  const displayMinute = minute.toString().padStart(2, "0");
  return `${displayHour}:${displayMinute} ${period}`;
}

// Get hours array for time range
export function getHoursInRange(startHour: number, endHour: number, slotDuration: number): { hour: number; minute: number }[] {
  const slots: { hour: number; minute: number }[] = [];
  const slotsPerHour = 60 / slotDuration;
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let slot = 0; slot < slotsPerHour; slot++) {
      slots.push({ hour, minute: slot * slotDuration });
    }
  }
  
  return slots;
}

// Generate a cell key from date and time
export function getCellKey(date: string, hour: number, minute: number): string {
  return `${date}-${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
}

// Parse a cell key back to components
export function parseCellKey(key: string): { date: string; hour: number; minute: number } {
  const [date, time] = key.split("-").reduce((acc, part, idx) => {
    if (idx < 3) {
      acc[0] = acc[0] ? `${acc[0]}-${part}` : part;
    } else {
      acc[1] = part;
    }
    return acc;
  }, ["", ""] as [string, string]);
  
  const [hourStr, minuteStr] = time.split(":");
  return {
    date,
    hour: parseInt(hourStr, 10),
    minute: parseInt(minuteStr, 10),
  };
}

// Convert local date to ISO string in UTC
export function toUTCString(date: Date): string {
  return date.toISOString();
}

// Get current user's timezone
export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

// Participant colors palette (vibrant but harmonious)
const PARTICIPANT_COLORS = [
  "#3B82F6", // Blue
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#F97316", // Orange
  "#14B8A6", // Teal
  "#EAB308", // Yellow
  "#EF4444", // Red
  "#22C55E", // Green
  "#6366F1", // Indigo
  "#06B6D4", // Cyan
];

export function getParticipantColor(index: number): string {
  return PARTICIPANT_COLORS[index % PARTICIPANT_COLORS.length];
}

// Calculate heatmap intensity (0-7)
export function getHeatmapIntensity(count: number, maxCount: number): number {
  if (maxCount === 0 || count === 0) return 0;
  const percentage = count / maxCount;
  return Math.ceil(percentage * 7);
}

