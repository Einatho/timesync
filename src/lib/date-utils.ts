import {
  format,
  parse,
  addDays,
  startOfDay,
  eachDayOfInterval,
  isSameDay,
  isToday,
  isBefore,
  setHours,
  setMinutes,
} from "date-fns";
import { formatInTimeZone, toZonedTime, fromZonedTime } from "date-fns-tz";

// Format a date as YYYY-MM-DD
export function formatDateKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

// Parse YYYY-MM-DD to Date
export function parseDateKey(dateKey: string): Date {
  return parse(dateKey, "yyyy-MM-dd", new Date());
}

// Get array of dates between start and end (inclusive)
export function getDateRange(start: Date, end: Date): Date[] {
  return eachDayOfInterval({ start: startOfDay(start), end: startOfDay(end) });
}

// Format date for display in grid header
export function formatGridDate(date: Date): { day: string; weekday: string; month: string } {
  return {
    day: format(date, "d"),
    weekday: format(date, "EEE"),
    month: format(date, "MMM"),
  };
}

// Check if a date is in the past
export function isPastDate(date: Date): boolean {
  return isBefore(startOfDay(date), startOfDay(new Date()));
}

// Get the start of today
export function getTodayStart(): Date {
  return startOfDay(new Date());
}

// Add days to a date
export function addDaysToDate(date: Date, days: number): Date {
  return addDays(date, days);
}

// Check if two dates are the same day
export function isSameDayCheck(date1: Date, date2: Date): boolean {
  return isSameDay(date1, date2);
}

// Check if a date is today
export function isTodayCheck(date: Date): boolean {
  return isToday(date);
}

// Create a datetime from date string, hour, and minute
export function createDateTime(dateKey: string, hour: number, minute: number): Date {
  let date = parseDateKey(dateKey);
  date = setHours(date, hour);
  date = setMinutes(date, minute);
  return date;
}

// Convert a local datetime to UTC ISO string
export function localToUTC(date: Date, timezone: string): string {
  const utcDate = fromZonedTime(date, timezone);
  return utcDate.toISOString();
}

// Convert a UTC ISO string to local datetime
export function utcToLocal(isoString: string, timezone: string): Date {
  return toZonedTime(new Date(isoString), timezone);
}

// Format a datetime for storage (UTC ISO string)
export function formatForStorage(dateKey: string, hour: number, minute: number, timezone: string): string {
  const localDate = createDateTime(dateKey, hour, minute);
  return localToUTC(localDate, timezone);
}

// Format a UTC datetime for display in a specific timezone
export function formatForDisplay(
  isoString: string,
  timezone: string,
  formatStr: string = "h:mm a"
): string {
  return formatInTimeZone(new Date(isoString), timezone, formatStr);
}

// Get the date key from a UTC ISO string in a specific timezone
export function getDateKeyFromUTC(isoString: string, timezone: string): string {
  return formatInTimeZone(new Date(isoString), timezone, "yyyy-MM-dd");
}

// Get hour and minute from a UTC ISO string in a specific timezone
export function getTimeFromUTC(isoString: string, timezone: string): { hour: number; minute: number } {
  const zonedDate = toZonedTime(new Date(isoString), timezone);
  return {
    hour: zonedDate.getHours(),
    minute: zonedDate.getMinutes(),
  };
}

// Generate time slots for a given date range and time range
export function generateTimeSlots(
  dates: string[],
  startHour: number,
  endHour: number,
  slotDuration: number
): { dateKey: string; hour: number; minute: number }[] {
  const slots: { dateKey: string; hour: number; minute: number }[] = [];
  const slotsPerHour = 60 / slotDuration;
  
  dates.forEach((dateKey) => {
    for (let hour = startHour; hour < endHour; hour++) {
      for (let slotIdx = 0; slotIdx < slotsPerHour; slotIdx++) {
        slots.push({
          dateKey,
          hour,
          minute: slotIdx * slotDuration,
        });
      }
    }
  });
  
  return slots;
}

// Get user's timezone
export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

// Format timezone for display
export function formatTimezone(timezone: string): string {
  const now = new Date();
  const offset = formatInTimeZone(now, timezone, "xxx");
  const name = timezone.replace(/_/g, " ").split("/").pop() || timezone;
  return `${name} (GMT${offset})`;
}

