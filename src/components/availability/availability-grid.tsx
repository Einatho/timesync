"use client";

import { useRef, useCallback, useMemo } from "react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { useDragSelect } from "@/hooks/use-drag-select";
import { formatTime, getCellKey, getHoursInRange } from "@/lib/utils";
import { Poll, Participant } from "@/types";
import { Tooltip } from "@/components/ui/tooltip";

interface AvailabilityGridProps {
  poll: Poll;
  currentParticipant: Participant | null;
  selectedSlots: Set<string>;
  onSlotsChange: (slots: Set<string>) => void;
  allParticipants: Participant[];
  allAvailability: Map<string, Participant[]>;
  isViewMode?: boolean;
}

export function AvailabilityGrid({
  poll,
  currentParticipant,
  selectedSlots,
  onSlotsChange,
  allParticipants,
  allAvailability,
  isViewMode = false,
}: AvailabilityGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  const timeSlots = useMemo(
    () => getHoursInRange(poll.startHour, poll.endHour, poll.timeSlotDuration),
    [poll.startHour, poll.endHour, poll.timeSlotDuration]
  );

  const handleSelectionComplete = useCallback(
    (cells: Set<string>, mode: "add" | "remove") => {
      if (isViewMode) return;

      const newSlots = new Set(selectedSlots);
      cells.forEach((cell) => {
        if (mode === "add") {
          newSlots.add(cell);
        } else {
          newSlots.delete(cell);
        }
      });
      onSlotsChange(newSlots);
    },
    [selectedSlots, onSlotsChange, isViewMode]
  );

  const {
    isSelecting,
    selectionMode,
    selectedCells,
    handleCellMouseDown,
    handleCellMouseEnter,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = useDragSelect({ onSelectionComplete: handleSelectionComplete });

  const getCellFromPoint = useCallback(
    (x: number, y: number): string | null => {
      const element = document.elementFromPoint(x, y);
      if (element && element.hasAttribute("data-cell-key")) {
        return element.getAttribute("data-cell-key");
      }
      return null;
    },
    []
  );

  const getHeatmapColor = (count: number, total: number) => {
    if (total === 0 || count === 0) return "bg-slate-50";
    const percentage = count / total;
    if (percentage <= 0.2) return "bg-emerald-100";
    if (percentage <= 0.4) return "bg-emerald-200";
    if (percentage <= 0.6) return "bg-emerald-300";
    if (percentage <= 0.8) return "bg-emerald-400";
    return "bg-emerald-500";
  };

  const isBestSlot = (cellKey: string) => {
    const availability = allAvailability.get(cellKey) || [];
    return availability.length === allParticipants.length && allParticipants.length > 0;
  };

  return (
    <div
      ref={gridRef}
      className={cn(
        "overflow-x-auto pb-4",
        isSelecting && "cursor-crosshair select-none"
      )}
      onTouchMove={(e) => handleTouchMove(e, getCellFromPoint)}
      onTouchEnd={handleTouchEnd}
    >
      <div className="min-w-[500px]">
        {/* Header row with dates */}
        <div
          className="grid gap-1 mb-1"
          style={{
            gridTemplateColumns: `80px repeat(${poll.dates.length}, minmax(60px, 1fr))`,
          }}
        >
          <div className="h-16" /> {/* Empty corner */}
          {poll.dates.map((dateStr) => {
            const date = parseISO(dateStr);
            return (
              <div
                key={dateStr}
                className="flex flex-col items-center justify-center rounded-xl bg-white/80 border border-slate-100 p-2 text-center shadow-sm"
              >
                <span className="text-xs font-medium text-slate-500">
                  {format(date, "EEE")}
                </span>
                <span className="text-lg font-bold text-slate-900">
                  {format(date, "d")}
                </span>
                <span className="text-xs text-slate-400">
                  {format(date, "MMM")}
                </span>
              </div>
            );
          })}
        </div>

        {/* Time rows */}
        {timeSlots.map(({ hour, minute }, timeIdx) => (
          <div
            key={`${hour}-${minute}`}
            className="grid gap-1 mb-1"
            style={{
              gridTemplateColumns: `80px repeat(${poll.dates.length}, minmax(60px, 1fr))`,
            }}
          >
            {/* Time label */}
            <div className="flex items-center justify-end pr-3">
              <span className="text-xs font-medium text-slate-500">
                {formatTime(hour, minute)}
              </span>
            </div>

            {/* Cells for each date */}
            {poll.dates.map((dateStr) => {
              const cellKey = getCellKey(dateStr, hour, minute);
              const isSelected = selectedSlots.has(cellKey);
              const isBeingSelected = selectedCells.has(cellKey);
              const availability = allAvailability.get(cellKey) || [];
              const isBest = isBestSlot(cellKey);

              // Determine cell state
              let cellClass = "";
              if (isViewMode) {
                // Heatmap mode
                cellClass = getHeatmapColor(availability.length, allParticipants.length);
              } else {
                // Selection mode
                if (isBeingSelected) {
                  cellClass =
                    selectionMode === "add"
                      ? "bg-emerald-300 ring-2 ring-emerald-500"
                      : "bg-red-200 ring-2 ring-red-400";
                } else if (isSelected) {
                  cellClass = "bg-emerald-500";
                } else {
                  cellClass = "bg-slate-100 hover:bg-emerald-100";
                }
              }

              const cellContent = (
                <div
                  data-cell-key={cellKey}
                  className={cn(
                    "h-10 rounded-lg transition-all duration-100 cursor-pointer relative",
                    cellClass,
                    isBest && "ring-2 ring-amber-400 ring-offset-1",
                    !isViewMode && !isSelecting && "hover:scale-105 hover:z-10"
                  )}
                  onMouseDown={() => {
                    if (!isViewMode) {
                      handleCellMouseDown(cellKey, isSelected);
                    }
                  }}
                  onMouseEnter={() => {
                    if (!isViewMode) {
                      handleCellMouseEnter(cellKey);
                    }
                  }}
                  onTouchStart={() => {
                    if (!isViewMode) {
                      handleTouchStart(cellKey, isSelected);
                    }
                  }}
                >
                  {/* Show participant count in heatmap mode */}
                  {isViewMode && availability.length > 0 && (
                    <span
                      className={cn(
                        "absolute inset-0 flex items-center justify-center text-xs font-bold",
                        availability.length / allParticipants.length > 0.5
                          ? "text-white"
                          : "text-emerald-700"
                      )}
                    >
                      {availability.length}
                    </span>
                  )}
                </div>
              );

              // Wrap with tooltip in view mode
              if (isViewMode && availability.length > 0) {
                return (
                  <Tooltip
                    key={cellKey}
                    content={
                      <div className="space-y-1">
                        <div className="font-medium">
                          {availability.length}/{allParticipants.length} available
                        </div>
                        <div className="text-xs opacity-80">
                          {availability.map((p) => p.name).join(", ")}
                        </div>
                      </div>
                    }
                  >
                    {cellContent}
                  </Tooltip>
                );
              }

              return <div key={cellKey}>{cellContent}</div>;
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

