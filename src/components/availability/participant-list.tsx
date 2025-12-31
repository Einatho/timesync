"use client";

import { Participant } from "@/types";
import { User, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface ParticipantListProps {
  participants: Participant[];
  currentParticipantId?: string;
}

export function ParticipantList({
  participants,
  currentParticipantId,
}: ParticipantListProps) {
  if (participants.length === 0) {
    return (
      <div className="text-center py-6 text-slate-500">
        <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No participants yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {participants.map((participant) => {
        const isCurrent = participant.id === currentParticipantId;
        return (
          <div
            key={participant.id}
            className={cn(
              "flex items-center gap-3 rounded-xl p-3 transition-colors",
              isCurrent
                ? "bg-emerald-50 border border-emerald-200"
                : "bg-slate-50"
            )}
          >
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: participant.color }}
            >
              {participant.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 truncate">
                {participant.name}
                {isCurrent && (
                  <span className="ml-2 text-xs text-emerald-600">(You)</span>
                )}
              </p>
            </div>
            {isCurrent && <UserCheck className="h-4 w-4 text-emerald-600 shrink-0" />}
          </div>
        );
      })}
    </div>
  );
}

interface ParticipantBadgesProps {
  participants: Participant[];
}

export function ParticipantBadges({ participants }: ParticipantBadgesProps) {
  const maxDisplay = 5;
  const displayParticipants = participants.slice(0, maxDisplay);
  const remaining = participants.length - maxDisplay;

  if (participants.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-1">
      {displayParticipants.map((participant, idx) => (
        <div
          key={participant.id}
          className="h-6 w-6 rounded-full border-2 border-white text-xs font-bold text-white flex items-center justify-center -ml-1 first:ml-0"
          style={{
            backgroundColor: participant.color,
            zIndex: displayParticipants.length - idx,
          }}
          title={participant.name}
        >
          {participant.name.charAt(0).toUpperCase()}
        </div>
      ))}
      {remaining > 0 && (
        <div className="h-6 w-6 rounded-full bg-slate-200 text-xs font-bold text-slate-600 flex items-center justify-center -ml-1 border-2 border-white">
          +{remaining}
        </div>
      )}
    </div>
  );
}

