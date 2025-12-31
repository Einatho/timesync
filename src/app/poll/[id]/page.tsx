"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/shared/header";
import { TimezoneIndicator } from "@/components/shared/timezone-indicator";
import { ShareLinkDisplay } from "@/components/shared/copy-link-button";
import { AvailabilityGrid } from "@/components/availability/availability-grid";
import { ParticipantList } from "@/components/availability/participant-list";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getPoll,
  getParticipantsByPoll,
  getParticipantByNameAndPoll,
  saveParticipant,
  getTimeSlotsByParticipant,
  saveTimeSlots,
  deleteTimeSlotsForParticipant,
  getAggregatedAvailability,
} from "@/lib/storage";
import { generateId, getParticipantColor, getCellKey } from "@/lib/utils";
import { formatForStorage, getUserTimezone } from "@/lib/date-utils";
import { Poll, Participant, TimeSlot } from "@/types";
import {
  Users,
  Calendar,
  Clock,
  BarChart3,
  Save,
  Check,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PageProps {
  params: { id: string };
}

export default function PollPage({ params }: PageProps) {
  const router = useRouter();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [currentParticipant, setCurrentParticipant] = useState<Participant | null>(null);
  const [allAvailability, setAllAvailability] = useState<Map<string, Participant[]>>(new Map());

  // Form state
  const [name, setName] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const refreshData = useCallback(() => {
    const loadedParticipants = getParticipantsByPoll(params.id);
    setParticipants(loadedParticipants);
    setAllAvailability(getAggregatedAvailability(params.id));
  }, [params.id]);

  // Load poll data
  useEffect(() => {
    const loadedPoll = getPoll(params.id);
    if (!loadedPoll) {
      router.push("/");
      return;
    }
    setPoll(loadedPoll);
    refreshData();
  }, [params.id, router, refreshData]);

  // Load participant's existing selections when they join
  const loadParticipantSelections = useCallback((participant: Participant) => {
    const slots = getTimeSlotsByParticipant(participant.id);
    const timezone = getUserTimezone();
    
    const selectedKeys = new Set<string>();
    slots.forEach((slot) => {
      // Convert UTC to local for display
      const date = new Date(slot.dateTime);
      const localDate = new Date(date.toLocaleString("en-US", { timeZone: timezone }));
      const dateKey = `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, "0")}-${String(localDate.getDate()).padStart(2, "0")}`;
      const hour = localDate.getHours();
      const minute = localDate.getMinutes();
      const key = getCellKey(dateKey, hour, minute);
      selectedKeys.add(key);
    });
    
    setSelectedSlots(selectedKeys);
  }, []);

  const handleJoin = async () => {
    if (!name.trim() || !poll) return;

    setIsJoining(true);
    setError(null);

    try {
      // Check if participant already exists
      let participant = getParticipantByNameAndPoll(name.trim(), poll.id);

      if (!participant) {
        // Create new participant
        participant = {
          id: generateId(),
          pollId: poll.id,
          name: name.trim(),
          color: getParticipantColor(participants.length),
          createdAt: new Date().toISOString(),
        };
        saveParticipant(participant);
      }

      setCurrentParticipant(participant);
      loadParticipantSelections(participant);
      refreshData();
    } catch (err) {
      setError("Failed to join poll. Please try again.");
    } finally {
      setIsJoining(false);
    }
  };

  const handleSave = async () => {
    if (!currentParticipant || !poll) return;

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const timezone = getUserTimezone();

      // Delete existing time slots for this participant
      deleteTimeSlotsForParticipant(currentParticipant.id);

      // Create new time slots
      const newSlots: TimeSlot[] = [];
      selectedSlots.forEach((cellKey) => {
        const parts = cellKey.split("-");
        const dateKey = `${parts[0]}-${parts[1]}-${parts[2]}`;
        const [hourStr, minuteStr] = parts[3].split(":");
        const hour = parseInt(hourStr, 10);
        const minute = parseInt(minuteStr, 10);

        const utcDateTime = formatForStorage(dateKey, hour, minute, timezone);

        newSlots.push({
          id: generateId(),
          participantId: currentParticipant.id,
          pollId: poll.id,
          dateTime: utcDateTime,
        });
      });

      saveTimeSlots(newSlots);
      refreshData();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError("Failed to save availability. Please try again.");
    } finally {
      setIsSaving(false);
    }
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
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Loading poll...</h1>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="container mx-auto max-w-6xl px-4 py-8">
        {/* Poll Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-1">{poll.title}</h1>
              {poll.description && (
                <p className="text-slate-600">{poll.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <TimezoneIndicator />
            </div>
          </div>

          {/* Poll info badges */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
              <Calendar className="h-3.5 w-3.5" />
              {poll.dates.length} day{poll.dates.length !== 1 ? "s" : ""}
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
              <Clock className="h-3.5 w-3.5" />
              {poll.timeSlotDuration} min slots
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
              <Users className="h-3.5 w-3.5" />
              {participants.length} participant{participants.length !== 1 ? "s" : ""}
            </div>
          </div>

          {/* Share link */}
          <ShareLinkDisplay url={shareUrl} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr,300px]">
          {/* Main content */}
          <div className="space-y-6">
            {/* Join form or Grid */}
            {!currentParticipant ? (
              <Card className="animate-fade-in">
                <CardHeader>
                  <CardTitle>Join this Poll</CardTitle>
                  <CardDescription>
                    Enter your name to mark your availability
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {error && (
                    <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                      <AlertCircle className="h-4 w-4" />
                      {error}
                    </div>
                  )}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your Name</Label>
                      <Input
                        id="name"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && name.trim()) {
                            handleJoin();
                          }
                        }}
                        autoFocus
                      />
                    </div>
                    <Button
                      onClick={handleJoin}
                      disabled={!name.trim() || isJoining}
                      className="w-full gap-2"
                    >
                      {isJoining ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Joining...
                        </>
                      ) : (
                        <>
                          Continue
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="animate-fade-in">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Select Your Availability</CardTitle>
                      <CardDescription>
                        Click and drag to select when you&apos;re free
                      </CardDescription>
                    </div>
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className={cn(
                        "gap-2 transition-all",
                        saveSuccess && "bg-emerald-600"
                      )}
                    >
                      {isSaving ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Saving...
                        </>
                      ) : saveSuccess ? (
                        <>
                          <Check className="h-4 w-4" />
                          Saved!
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {error && (
                    <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                      <AlertCircle className="h-4 w-4" />
                      {error}
                    </div>
                  )}

                  {/* Instructions */}
                  <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded bg-slate-100" />
                      <span>Not selected</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded bg-emerald-500" />
                      <span>Your availability</span>
                    </div>
                  </div>

                  <AvailabilityGrid
                    poll={poll}
                    currentParticipant={currentParticipant}
                    selectedSlots={selectedSlots}
                    onSlotsChange={setSelectedSlots}
                    allParticipants={participants}
                    allAvailability={allAvailability}
                  />
                </CardContent>
              </Card>
            )}

            {/* View Results Button */}
            {participants.length > 0 && (
              <Link href={`/poll/${poll.id}/results`}>
                <Button variant="outline" className="w-full gap-2">
                  <BarChart3 className="h-4 w-4" />
                  View Group Results
                </Button>
              </Link>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Participants */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Participants ({participants.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ParticipantList
                  participants={participants}
                  currentParticipantId={currentParticipant?.id}
                />
              </CardContent>
            </Card>

            {/* Quick tips */}
            <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100">
              <CardContent className="pt-6">
                <h4 className="font-medium text-slate-900 mb-3">💡 Quick Tips</h4>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>• Click and drag to select multiple slots</li>
                  <li>• Click on selected slots to deselect</li>
                  <li>• Don&apos;t forget to save your changes</li>
                  <li>• View results to see everyone&apos;s availability</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
