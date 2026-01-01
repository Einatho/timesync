"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/shared/header";
import { TimezoneIndicator } from "@/components/shared/timezone-indicator";
import { AvailabilityGrid } from "@/components/availability/availability-grid";
import { ParticipantList } from "@/components/availability/participant-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  getPoll,
  getParticipantsByPoll,
  getAggregatedAvailability,
} from "@/lib/storage";
import { Poll, Participant } from "@/types";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Users,
  Calendar,
  Trophy,
} from "lucide-react";
import { format, parseISO } from "date-fns";

interface PageProps {
  params: { id: string };
}

interface DateRange {
  startDate: Date;
  endDate: Date;
  count: number;
  participants: Participant[];
}

// Group consecutive dates into ranges
function groupConsecutiveDates(
  slots: { key: string; count: number; participants: Participant[] }[]
): DateRange[] {
  if (slots.length === 0) return [];

  // Sort slots by date
  const sortedSlots = [...slots].sort((a, b) => a.key.localeCompare(b.key));
  
  const ranges: DateRange[] = [];
  let currentRange: DateRange | null = null;

  for (const slot of sortedSlots) {
    const date = parseISO(slot.key);

    if (!currentRange) {
      // Start a new range
      currentRange = {
        startDate: date,
        endDate: date,
        count: slot.count,
        participants: slot.participants,
      };
    } else {
      // Check if this date is consecutive (next day after current endDate)
      const nextDay = new Date(currentRange.endDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const isConsecutive = 
        date.getFullYear() === nextDay.getFullYear() &&
        date.getMonth() === nextDay.getMonth() &&
        date.getDate() === nextDay.getDate();

      if (isConsecutive) {
        // Extend current range
        currentRange.endDate = date;
      } else {
        // Save current range and start a new one
        ranges.push(currentRange);
        currentRange = {
          startDate: date,
          endDate: date,
          count: slot.count,
          participants: slot.participants,
        };
      }
    }
  }

  // Don't forget the last range
  if (currentRange) {
    ranges.push(currentRange);
  }

  return ranges;
}

// Format a date range for display
function formatDateRange(range: DateRange): string {
  const { startDate, endDate } = range;
  
  if (startDate.getTime() === endDate.getTime()) {
    // Single day
    return format(startDate, "MMM d, yyyy");
  }
  
  // Check if same month and year
  if (
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getFullYear() === endDate.getFullYear()
  ) {
    return `${format(startDate, "MMM d")} - ${format(endDate, "d, yyyy")}`;
  }
  
  // Check if same year but different months
  if (startDate.getFullYear() === endDate.getFullYear()) {
    return `${format(startDate, "MMM d")} - ${format(endDate, "MMM d, yyyy")}`;
  }
  
  // Different years
  return `${format(startDate, "MMM d, yyyy")} - ${format(endDate, "MMM d, yyyy")}`;
}

// Get the number of days in a range
function getDayCount(range: DateRange): number {
  const diffTime = Math.abs(range.endDate.getTime() - range.startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
}

export default function ResultsPage({ params }: PageProps) {
  const router = useRouter();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [allAvailability, setAllAvailability] = useState<Map<string, Participant[]>>(new Map());
  const [bestDateRanges, setBestDateRanges] = useState<DateRange[]>([]);
  const [selectedRangeIndex, setSelectedRangeIndex] = useState<number | null>(null);

  // Get the highlighted dates from the selected range
  const getHighlightedDates = (): Set<string> => {
    if (selectedRangeIndex === null || !bestDateRanges[selectedRangeIndex]) {
      return new Set();
    }
    
    const range = bestDateRanges[selectedRangeIndex];
    const dates = new Set<string>();
    const currentDate = new Date(range.startDate);
    
    while (currentDate <= range.endDate) {
      const dateStr = format(currentDate, "yyyy-MM-dd");
      dates.add(dateStr);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  };

  const highlightedDates = getHighlightedDates();

  useEffect(() => {
    const loadedPoll = getPoll(params.id);
    if (!loadedPoll) {
      router.push("/");
      return;
    }
    setPoll(loadedPoll);

    const loadedParticipants = getParticipantsByPoll(params.id);
    setParticipants(loadedParticipants);

    const availability = getAggregatedAvailability(params.id);
    setAllAvailability(availability);

    // Find best slots and group them into date ranges
    if (loadedParticipants.length > 0) {
      const slots = Array.from(availability.entries())
        .map(([key, parts]) => ({
          key,
          count: parts.length,
          participants: parts,
        }))
        .sort((a, b) => b.count - a.count);

      const maxCount = slots[0]?.count || 0;
      const topSlots = slots.filter((s) => s.count === maxCount && s.count > 0);

      // Group consecutive dates into ranges
      const ranges = groupConsecutiveDates(topSlots);
      setBestDateRanges(ranges);
    }
  }, [params.id, router]);

  if (!poll) {
    return (
      <>
        <Header />
        <main className="container mx-auto max-w-6xl px-4 py-12">
          <div className="text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 mb-4">
              <Calendar className="h-6 w-6 text-slate-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Loading results...</h1>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="container mx-auto max-w-6xl px-4 py-8">
        {/* Hero Image */}
        {poll.heroImage && (
          <div className="mb-8 -mx-4 sm:mx-0 sm:rounded-2xl overflow-hidden shadow-lg">
            <img
              src={poll.heroImage}
              alt={poll.title}
              className="w-full h-48 sm:h-64 md:h-80 object-cover"
            />
          </div>
        )}

        {/* Back button and header */}
        <div className="mb-6">
          <Link href={`/poll/${poll.id}`}>
            <Button variant="ghost" className="gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back to Trip
            </Button>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-1">
                Results: {poll.title}
              </h1>
              <p className="text-slate-600">
                Group availability overview from {participants.length} participant
                {participants.length !== 1 ? "s" : ""}
              </p>
            </div>
            <TimezoneIndicator />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr,300px]">
          {/* Main content */}
          <div className="space-y-6">
            {/* Best times - grouped by consecutive date ranges */}
            {bestDateRanges.length > 0 && (
              <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-800">
                    <Trophy className="h-5 w-5 text-amber-500" />
                    {bestDateRanges.length === 1 
                      ? "Best Dates" 
                      : `${bestDateRanges.length} Potential Date Options`}
                    {" "}({bestDateRanges[0].count}/{participants.length} available)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {bestDateRanges.map((range, index) => {
                      const dayCount = getDayCount(range);
                      const isSelected = selectedRangeIndex === index;
                      return (
                        <div
                          key={index}
                          onClick={() => setSelectedRangeIndex(isSelected ? null : index)}
                          className={cn(
                            "flex items-center gap-4 rounded-xl p-4 shadow-sm cursor-pointer transition-all duration-200",
                            isSelected 
                              ? "bg-emerald-100 ring-2 ring-emerald-500 ring-offset-2 scale-[1.02]" 
                              : "bg-white/80 hover:bg-emerald-50 hover:scale-[1.01]"
                          )}
                        >
                          <div className={cn(
                            "flex h-12 w-12 items-center justify-center rounded-lg transition-colors",
                            isSelected ? "bg-emerald-500" : "bg-amber-100"
                          )}>
                            <Calendar className={cn(
                              "h-6 w-6 transition-colors",
                              isSelected ? "text-white" : "text-amber-600"
                            )} />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900 text-lg">
                              {formatDateRange(range)}
                            </p>
                            <p className="text-sm text-slate-600">
                              {dayCount} day{dayCount !== 1 ? "s" : ""} • All {range.count} participants available
                            </p>
                          </div>
                          {bestDateRanges.length > 1 && (
                            <div className={cn(
                              "flex h-8 w-8 items-center justify-center rounded-full font-bold text-sm transition-colors",
                              isSelected 
                                ? "bg-emerald-500 text-white" 
                                : "bg-amber-200 text-amber-700"
                            )}>
                              {index + 1}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <p className="mt-4 text-sm text-amber-700/80 text-center">
                    {bestDateRanges.length > 1 
                      ? "Multiple date ranges work for everyone! Click to highlight in the schedule below."
                      : "Click to highlight these dates in the schedule below."}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Heatmap Grid */}
            <Card className="animate-fade-in" style={{ animationDelay: "100ms" }}>
              <CardHeader>
                <CardTitle>Availability Heatmap</CardTitle>
              </CardHeader>
              <CardContent>
                {participants.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">No participants yet</p>
                    <p className="text-sm">Share the trip link to collect availability</p>
                  </div>
                ) : (
                  <>
                    {/* Legend */}
                    <div className="mb-6 flex flex-wrap items-center justify-center gap-3 text-sm">
                      <span className="text-slate-500 font-medium">Availability:</span>
                      <div className="flex items-center gap-1">
                        <div className="h-4 w-8 rounded bg-slate-50 border-2 border-slate-200" />
                        <span className="text-xs text-slate-500">None</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="h-4 w-8 rounded bg-orange-100" />
                        <span className="text-xs text-slate-500">Few</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="h-4 w-8 rounded bg-orange-200" />
                        <span className="text-xs text-slate-500">Some</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="h-4 w-8 rounded bg-amber-300" />
                        <span className="text-xs text-slate-500">Most</span>
                      </div>
                      <div className="flex items-center gap-2 pl-2 border-l border-slate-300">
                        <div className="h-4 w-8 rounded bg-emerald-400 border-2 border-emerald-500" />
                        <span className="text-xs text-emerald-700 font-semibold">Everyone!</span>
                      </div>
                    </div>

                    <AvailabilityGrid
                      poll={poll}
                      currentParticipant={null}
                      selectedSlots={new Set()}
                      onSlotsChange={() => {}}
                      allParticipants={participants}
                      allAvailability={allAvailability}
                      isViewMode={true}
                      highlightedDates={highlightedDates}
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600">
                    {participants.length}
                    <span className="text-lg font-normal text-slate-400">/10</span>
                  </div>
                  <div className="text-sm text-slate-500">Participants</div>
                </div>
              </CardContent>
            </Card>

            {/* Participants */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Participants ({participants.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ParticipantList participants={participants} />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
