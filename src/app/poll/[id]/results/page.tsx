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

export default function ResultsPage({ params }: PageProps) {
  const router = useRouter();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [allAvailability, setAllAvailability] = useState<Map<string, Participant[]>>(new Map());
  const [bestSlots, setBestSlots] = useState<{ key: string; count: number; participants: Participant[] }[]>([]);

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

    // Find best slots
    if (loadedParticipants.length > 0) {
      const slots = Array.from(availability.entries())
        .map(([key, parts]) => ({
          key,
          count: parts.length,
          participants: parts,
        }))
        .sort((a, b) => b.count - a.count);

      const maxCount = slots[0]?.count || 0;
      const topSlots = slots
        .filter((s) => s.count === maxCount && s.count > 0)
        .slice(0, 5);

      setBestSlots(topSlots);
    }
  }, [params.id, router]);

  const parseSlotKey = (key: string) => {
    // Key is just the date in YYYY-MM-DD format
    return { dateKey: key };
  };

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
        {/* Back button and header */}
        <div className="mb-6">
          <Link href={`/poll/${poll.id}`}>
            <Button variant="ghost" className="gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back to Poll
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
            {/* Best times */}
            {bestSlots.length > 0 && (
              <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-800">
                    <Trophy className="h-5 w-5 text-amber-500" />
                    Best Times ({bestSlots[0].count}/{participants.length} available)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {bestSlots.map((slot) => {
                      const { dateKey } = parseSlotKey(slot.key);
                      const date = parseISO(dateKey);
                      return (
                        <div
                          key={slot.key}
                          className="flex items-center gap-3 rounded-xl bg-white/80 p-3 shadow-sm"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                            <Calendar className="h-5 w-5 text-amber-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">
                              {format(date, "EEEE, MMM d, yyyy")}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
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
                    <p className="text-sm">Share the poll link to collect availability</p>
                  </div>
                ) : (
                  <>
                    {/* Legend */}
                    <div className="mb-6 flex flex-wrap items-center justify-center gap-4 text-sm">
                      <span className="text-slate-500">Availability:</span>
                      <div className="flex items-center gap-1">
                        <div className="h-4 w-8 rounded bg-slate-50" />
                        <span className="text-xs text-slate-500">0%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="h-4 w-8 rounded bg-emerald-200" />
                        <span className="text-xs text-slate-500">25%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="h-4 w-8 rounded bg-emerald-400" />
                        <span className="text-xs text-slate-500">50%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="h-4 w-8 rounded bg-emerald-500" />
                        <span className="text-xs text-slate-500">100%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="h-4 w-8 rounded bg-emerald-500 ring-2 ring-amber-400 ring-offset-1" />
                        <span className="text-xs text-slate-500">Best</span>
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-600">
                      {participants.length}
                    </div>
                    <div className="text-sm text-slate-500">Participants</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-amber-500">
                      {bestSlots.length > 0 ? bestSlots[0].count : 0}
                    </div>
                    <div className="text-sm text-slate-500">Max Available</div>
                  </div>
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
