"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/shared/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAllPolls, getParticipantsByPoll } from "@/lib/storage";
import { Poll } from "@/types";
import {
  Calendar,
  Users,
  MapPin,
  Clock,
  CheckCircle2,
  Plane,
  Plus,
  ArrowRight,
} from "lucide-react";
import { format, parseISO, isAfter, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";

type TripStatus = "planning" | "done";

interface TripWithMeta extends Poll {
  status: TripStatus;
  participantCount: number;
  nextDate: string | null;
  lastDate: string | null;
}

export default function TripsPage() {
  const [trips, setTrips] = useState<TripWithMeta[]>([]);
  const [activeTab, setActiveTab] = useState<TripStatus | "all">("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const polls = getAllPolls();
    const today = startOfDay(new Date());

    const tripsWithMeta: TripWithMeta[] = polls.map((poll) => {
      const participants = getParticipantsByPoll(poll.id);
      const sortedDates = [...poll.dates].sort();
      const lastDate = sortedDates[sortedDates.length - 1];
      const nextDate = sortedDates.find((d) => isAfter(parseISO(d), today) || parseISO(d).getTime() === today.getTime());
      
      // Trip is "done" if all dates are in the past
      const isDone = lastDate ? isAfter(today, parseISO(lastDate)) : false;

      return {
        ...poll,
        status: isDone ? "done" : "planning",
        participantCount: participants.length,
        nextDate: nextDate || null,
        lastDate: lastDate || null,
      };
    });

    setTrips(tripsWithMeta);
    setIsLoading(false);
  }, []);

  const planningTrips = trips.filter((t) => t.status === "planning");
  const doneTrips = trips.filter((t) => t.status === "done");

  const filteredTrips =
    activeTab === "all"
      ? trips
      : activeTab === "planning"
      ? planningTrips
      : doneTrips;

  const tabs = [
    { id: "all" as const, label: "All Trips", count: trips.length },
    { id: "planning" as const, label: "Planning", count: planningTrips.length, icon: Clock },
    { id: "done" as const, label: "Done", count: doneTrips.length, icon: CheckCircle2 },
  ];

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="container mx-auto max-w-4xl px-4 py-12">
          <div className="text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 mb-4 animate-pulse">
              <Plane className="h-6 w-6 text-slate-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Loading trips...</h1>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="container mx-auto max-w-4xl px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">My Trips</h1>
          <p className="text-slate-600">
            Manage all your trips in one place
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                activeTab === tab.id
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {tab.icon && <tab.icon className="h-4 w-4" />}
              {tab.label}
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-xs",
                  activeTab === tab.id
                    ? "bg-white/20 text-white"
                    : "bg-slate-200 text-slate-500"
                )}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Empty State */}
        {trips.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-16">
              <div className="text-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mb-4">
                  <Plane className="h-8 w-8 text-emerald-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">
                  No trips yet
                </h2>
                <p className="text-slate-600 mb-6 max-w-sm mx-auto">
                  Create your first trip to start planning with friends and family
                </p>
                <Link href="/create">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Your First Trip
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : filteredTrips.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12">
              <div className="text-center text-slate-500">
                <p>No {activeTab === "planning" ? "trips being planned" : "completed trips"} yet</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}

        {/* Create new trip FAB for mobile */}
        <Link
          href="/create"
          className="fixed bottom-6 right-6 md:hidden flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 transition-transform hover:scale-105 active:scale-95"
        >
          <Plus className="h-6 w-6" />
        </Link>
      </main>
    </>
  );
}

function TripCard({ trip }: { trip: TripWithMeta }) {
  const statusConfig = {
    planning: {
      label: "Planning",
      className: "bg-blue-100 text-blue-700",
      icon: Clock,
    },
    done: {
      label: "Done",
      className: "bg-emerald-100 text-emerald-700",
      icon: CheckCircle2,
    },
  };

  const status = statusConfig[trip.status];
  const StatusIcon = status.icon;

  return (
    <Link href={`/poll/${trip.id}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5">
        <div className="flex">
          {/* Hero Image or Placeholder */}
          <div className="relative w-32 sm:w-48 shrink-0">
            {trip.heroImage ? (
              <img
                src={trip.heroImage}
                alt={trip.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                <MapPin className="h-8 w-8 text-white/80" />
              </div>
            )}
          </div>

          {/* Content */}
          <CardContent className="flex-1 p-4 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                {/* Status badge */}
                <div className="mb-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                      status.className
                    )}
                  >
                    <StatusIcon className="h-3 w-3" />
                    {status.label}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-semibold text-slate-900 truncate group-hover:text-emerald-600 transition-colors">
                  {trip.title}
                </h3>

                {/* Description */}
                {trip.description && (
                  <p className="text-sm text-slate-500 truncate mt-1">
                    {trip.description}
                  </p>
                )}

                {/* Meta info */}
                <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {trip.dates.length} potential date{trip.dates.length !== 1 ? "s" : ""}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {trip.participantCount} participant{trip.participantCount !== 1 ? "s" : ""}
                  </span>
                  {trip.nextDate && trip.status === "planning" && (
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                      <Clock className="h-3.5 w-3.5" />
                      Next: {format(parseISO(trip.nextDate), "MMM d")}
                    </span>
                  )}
                </div>
              </div>

              {/* Arrow */}
              <div className="hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    </Link>
  );
}

