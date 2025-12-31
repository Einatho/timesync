// Core data types for the scheduling application

export interface Poll {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  creatorName: string;
  dates: string[]; // Array of dates in YYYY-MM-DD format
  timeSlotDuration: number; // Duration in minutes (30 or 60)
  startHour: number; // 0-23
  endHour: number; // 0-23
  timezone: string;
}

export interface Participant {
  id: string;
  pollId: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface TimeSlot {
  id: string;
  participantId: string;
  pollId: string;
  dateTime: string; // ISO timestamp in UTC
}

// UI-specific derived types
export interface AvailabilityCell {
  dateTime: string;
  date: string; // YYYY-MM-DD
  hour: number;
  minute: number;
  participants: Participant[];
  count: number;
  percentage: number;
  isSelected: boolean;
}

export interface HeatmapData {
  slots: AvailabilityCell[];
  maxCount: number;
  totalParticipants: number;
  bestSlots: string[]; // dateTime strings of optimal slots
}

// Form/UI state types
export interface CreatePollFormData {
  title: string;
  description: string;
  creatorName: string;
  dates: Date[];
  startHour: number;
  endHour: number;
  timeSlotDuration: 30 | 60;
}

export interface SelectionState {
  isSelecting: boolean;
  startCell: string | null;
  currentCell: string | null;
  mode: "add" | "remove";
  selectedCells: Set<string>;
}

// Storage types
export interface StorageData {
  polls: Record<string, Poll>;
  participants: Record<string, Participant>;
  timeSlots: Record<string, TimeSlot>;
}

