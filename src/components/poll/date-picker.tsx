"use client";

import { useState, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  isBefore,
  startOfDay,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  selectedDates: Date[];
  onDatesChange: (dates: Date[]) => void;
  minDate?: Date;
}

export function DatePicker({
  selectedDates,
  onDatesChange,
  minDate = new Date(),
}: DatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<Date | null>(null);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    const daysArray: Date[] = [];
    let day = start;
    while (day <= end) {
      daysArray.push(day);
      day = addDays(day, 1);
    }
    return daysArray;
  }, [currentMonth]);

  const isDateSelected = (date: Date) =>
    selectedDates.some((d) => isSameDay(d, date));

  const isDateDisabled = (date: Date) =>
    isBefore(startOfDay(date), startOfDay(minDate));

  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date)) return;

    const isSelected = isDateSelected(date);
    if (isSelected) {
      onDatesChange(selectedDates.filter((d) => !isSameDay(d, date)));
    } else {
      onDatesChange([...selectedDates, date].sort((a, b) => a.getTime() - b.getTime()));
    }
  };

  const handleMouseDown = (date: Date) => {
    if (isDateDisabled(date)) return;
    setIsSelecting(true);
    setSelectionStart(date);
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
    setSelectionStart(null);
  };

  const handleMouseEnter = (date: Date) => {
    if (!isSelecting || !selectionStart || isDateDisabled(date)) return;

    // Get all dates between start and current
    const start = selectionStart < date ? selectionStart : date;
    const end = selectionStart < date ? date : selectionStart;
    const rangeDates: Date[] = [];
    let current = start;
    while (current <= end) {
      if (!isDateDisabled(current)) {
        rangeDates.push(current);
      }
      current = addDays(current, 1);
    }

    // Determine if we're adding or removing based on the start date's state
    const isStartSelected = selectedDates.some((d) => isSameDay(d, selectionStart!));
    
    if (isStartSelected) {
      // We're removing dates
      onDatesChange(
        selectedDates.filter(
          (d) => !rangeDates.some((rd) => isSameDay(rd, d))
        )
      );
    } else {
      // We're adding dates
      const newDates = [...selectedDates];
      rangeDates.forEach((rd) => {
        if (!newDates.some((d) => isSameDay(d, rd))) {
          newDates.push(rd);
        }
      });
      onDatesChange(newDates.sort((a, b) => a.getTime() - b.getTime()));
    }
  };

  return (
    <div
      className="select-none"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-slate-600" />
        </button>
        <h3 className="text-lg font-semibold text-slate-900">
          {format(currentMonth, "MMMM yyyy")}
        </h3>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ChevronRight className="h-5 w-5 text-slate-600" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="h-10 flex items-center justify-center text-xs font-medium text-slate-500"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          const isSelected = isDateSelected(day);
          const isDisabled = isDateDisabled(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isTodayDate = isToday(day);

          return (
            <button
              key={idx}
              disabled={isDisabled}
              onClick={() => handleDateClick(day)}
              onMouseDown={() => handleMouseDown(day)}
              onMouseEnter={() => handleMouseEnter(day)}
              className={cn(
                "h-10 w-full rounded-lg text-sm font-medium transition-all duration-150",
                isCurrentMonth ? "text-slate-900" : "text-slate-400",
                isDisabled && "opacity-40 cursor-not-allowed",
                !isDisabled && !isSelected && "hover:bg-emerald-100",
                isSelected && "bg-emerald-500 text-white hover:bg-emerald-600",
                isTodayDate && !isSelected && "ring-2 ring-emerald-500 ring-inset"
              )}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>

      {/* Selected count */}
      {selectedDates.length > 0 && (
        <div className="mt-4 text-center text-sm text-slate-600">
          <span className="font-medium text-emerald-600">{selectedDates.length}</span>
          {" "}date{selectedDates.length !== 1 ? "s" : ""} selected
        </div>
      )}
    </div>
  );
}

