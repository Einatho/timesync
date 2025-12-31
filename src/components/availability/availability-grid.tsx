"use client";

import { useRef, useCallback } from "react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { useDragSelect } from "@/hooks/use-drag-select";
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
      {/* Day-based grid - one cell per day */}
      <div 
        className="grid gap-3"
        style={{
          gridTemplateColumns: `repeat(auto-fill, minmax(120px, 1fr))`,
        }}
      >
        {poll.dates.map((dateStr) => {
          const date = parseISO(dateStr);
          const cellKey = dateStr; // Use date string as the cell key
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
              cellClass = "bg-emerald-500 text-white";
            } else {
              cellClass = "bg-slate-100 hover:bg-emerald-100";
            }
          }

          const cellContent = (
            <div
              data-cell-key={cellKey}
              className={cn(
                "flex flex-col items-center justify-center rounded-xl p-4 transition-all duration-100 cursor-pointer relative min-h-[100px]",
                cellClass,
                isBest && "ring-2 ring-amber-400 ring-offset-2",
                !isViewMode && !isSelecting && "hover:scale-105 hover:z-10 hover:shadow-lg"
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
              <span className={cn(
                "text-xs font-medium",
                isSelected && !isViewMode ? "text-emerald-100" : "text-slate-500"
              )}>
                {format(date, "EEE")}
              </span>
              <span className={cn(
                "text-2xl font-bold",
                isSelected && !isViewMode ? "text-white" : "text-slate-900"
              )}>
                {format(date, "d")}
              </span>
              <span className={cn(
                "text-xs",
                isSelected && !isViewMode ? "text-emerald-100" : "text-slate-400"
              )}>
                {format(date, "MMM yyyy")}
              </span>
              
              {/* Show participant count in heatmap mode */}
              {isViewMode && availability.length > 0 && (
                <span
                  className={cn(
                    "mt-2 text-sm font-bold px-2 py-0.5 rounded-full",
                    availability.length / allParticipants.length > 0.5
                      ? "bg-white/30 text-white"
                      : "bg-emerald-100 text-emerald-700"
                  )}
                >
                  {availability.length}/{allParticipants.length}
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
    </div>
  );
}

