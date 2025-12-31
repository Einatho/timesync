import { Poll, Participant, TimeSlot, StorageData } from "@/types";

const STORAGE_KEY = "timesync_data";

// Initialize storage with empty data
const DEFAULT_DATA: StorageData = {
  polls: {},
  participants: {},
  timeSlots: {},
};

// Get all data from localStorage
export function getStorageData(): StorageData {
  if (typeof window === "undefined") return DEFAULT_DATA;
  
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return DEFAULT_DATA;
    return JSON.parse(data) as StorageData;
  } catch {
    return DEFAULT_DATA;
  }
}

// Save all data to localStorage
function saveStorageData(data: StorageData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Poll operations
export function savePoll(poll: Poll): void {
  const data = getStorageData();
  data.polls[poll.id] = poll;
  saveStorageData(data);
}

export function getPoll(id: string): Poll | null {
  const data = getStorageData();
  return data.polls[id] || null;
}

export function getAllPolls(): Poll[] {
  const data = getStorageData();
  return Object.values(data.polls).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

// Participant operations
export function saveParticipant(participant: Participant): void {
  const data = getStorageData();
  data.participants[participant.id] = participant;
  saveStorageData(data);
}

export function getParticipant(id: string): Participant | null {
  const data = getStorageData();
  return data.participants[id] || null;
}

export function getParticipantsByPoll(pollId: string): Participant[] {
  const data = getStorageData();
  return Object.values(data.participants)
    .filter((p) => p.pollId === pollId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export function getParticipantByNameAndPoll(name: string, pollId: string): Participant | null {
  const data = getStorageData();
  return Object.values(data.participants).find(
    (p) => p.pollId === pollId && p.name.toLowerCase() === name.toLowerCase()
  ) || null;
}

// TimeSlot operations
export function saveTimeSlot(timeSlot: TimeSlot): void {
  const data = getStorageData();
  data.timeSlots[timeSlot.id] = timeSlot;
  saveStorageData(data);
}

export function saveTimeSlots(timeSlots: TimeSlot[]): void {
  const data = getStorageData();
  timeSlots.forEach((slot) => {
    data.timeSlots[slot.id] = slot;
  });
  saveStorageData(data);
}

export function deleteTimeSlot(id: string): void {
  const data = getStorageData();
  delete data.timeSlots[id];
  saveStorageData(data);
}

export function deleteTimeSlotsForParticipant(participantId: string): void {
  const data = getStorageData();
  Object.keys(data.timeSlots).forEach((id) => {
    if (data.timeSlots[id].participantId === participantId) {
      delete data.timeSlots[id];
    }
  });
  saveStorageData(data);
}

export function getTimeSlotsByPoll(pollId: string): TimeSlot[] {
  const data = getStorageData();
  return Object.values(data.timeSlots).filter((s) => s.pollId === pollId);
}

export function getTimeSlotsByParticipant(participantId: string): TimeSlot[] {
  const data = getStorageData();
  return Object.values(data.timeSlots).filter((s) => s.participantId === participantId);
}

// Get aggregated availability data for a poll
export function getAggregatedAvailability(pollId: string): Map<string, Participant[]> {
  const data = getStorageData();
  const participants = getParticipantsByPoll(pollId);
  const participantMap = new Map(participants.map((p) => [p.id, p]));
  
  const availability = new Map<string, Participant[]>();
  
  Object.values(data.timeSlots)
    .filter((slot) => slot.pollId === pollId)
    .forEach((slot) => {
      const participant = participantMap.get(slot.participantId);
      if (participant) {
        // Extract just the date portion (YYYY-MM-DD) from the dateTime
        const dateKey = slot.dateTime.split("T")[0];
        const existing = availability.get(dateKey) || [];
        existing.push(participant);
        availability.set(dateKey, existing);
      }
    });
  
  return availability;
}

