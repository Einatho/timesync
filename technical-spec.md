# TimeSync - Group Scheduling Application

## Technical Specification

### Overview
TimeSync is a modern, high-performance group scheduling web application that helps multiple people find common free time slots. Built with Next.js 15, it offers a seamless, no-login participation experience.

---

## Architecture

### Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **URL State**: nuqs
- **State Management**: React useState (simplified approach)

---

## Data Models (TypeScript Interfaces)

```typescript
// Core Types
interface Poll {
  id: string;                    // Unique identifier (nanoid)
  title: string;                 // Poll title
  description?: string;          // Optional description
  createdAt: string;             // ISO timestamp (GMT)
  creatorName: string;           // Name of poll creator
  dates: string[];               // Array of selected dates (YYYY-MM-DD)
  timeSlotDuration: number;      // Duration in minutes (30 or 60)
  startHour: number;             // Day start hour (0-23)
  endHour: number;               // Day end hour (0-23)
  timezone: string;              // Creator's timezone
}

interface Participant {
  id: string;                    // Unique identifier
  pollId: string;                // Reference to poll
  name: string;                  // Participant name
  color: string;                 // Assigned color for visualization
  createdAt: string;             // ISO timestamp (GMT)
}

interface TimeSlot {
  id: string;                    // Unique identifier
  participantId: string;         // Reference to participant
  pollId: string;                // Reference to poll
  dateTime: string;              // ISO timestamp (GMT) - slot start time
}

// Derived Types for UI
interface AvailabilityCell {
  dateTime: string;              // ISO timestamp
  participants: Participant[];   // Participants available at this time
  count: number;                 // Number of available participants
  percentage: number;            // Percentage of total participants
}

interface HeatmapData {
  slots: AvailabilityCell[];
  maxCount: number;
  totalParticipants: number;
}
```

---

## Component Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout with fonts & providers
│   ├── page.tsx                # Landing page
│   ├── create/
│   │   └── page.tsx            # Poll creation page
│   ├── poll/
│   │   └── [id]/
│   │       ├── page.tsx        # Participant view (add availability)
│   │       └── results/
│   │           └── page.tsx    # Results/heatmap view
│   └── globals.css             # Global styles
│
├── components/
│   ├── ui/                     # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── calendar.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   │
│   ├── poll/
│   │   ├── create-poll-form.tsx       # Multi-step poll creation
│   │   ├── date-range-picker.tsx      # Custom date selection
│   │   ├── time-range-selector.tsx    # Start/end hour picker
│   │   └── poll-preview.tsx           # Preview before creation
│   │
│   ├── availability/
│   │   ├── availability-grid.tsx      # Main interactive grid
│   │   ├── time-slot-row.tsx          # Single time row
│   │   ├── date-column.tsx            # Date column header
│   │   ├── selectable-cell.tsx        # Individual selectable cell
│   │   └── participant-badge.tsx      # Shows who selected a slot
│   │
│   ├── heatmap/
│   │   ├── heatmap-grid.tsx           # Best times visualization
│   │   ├── heatmap-cell.tsx           # Color-coded cell
│   │   ├── legend.tsx                 # Color scale legend
│   │   └── participant-list.tsx       # List of all participants
│   │
│   └── shared/
│       ├── header.tsx                 # App header
│       ├── timezone-indicator.tsx     # Shows current timezone
│       ├── copy-link-button.tsx       # Share link functionality
│       └── loading-skeleton.tsx       # Loading states
│
├── lib/
│   ├── utils.ts                # Utility functions (cn, etc.)
│   ├── date-utils.ts           # Date manipulation helpers
│   ├── timezone-utils.ts       # Timezone conversion helpers
│   ├── color-utils.ts          # Participant color generation
│   └── storage.ts              # LocalStorage persistence
│
├── hooks/
│   ├── use-poll.ts             # Poll state management
│   ├── use-availability.ts     # Availability selection logic
│   ├── use-drag-select.ts      # Drag-to-select functionality
│   └── use-timezone.ts         # Timezone detection & handling
│
└── types/
    └── index.ts                # All TypeScript interfaces
```

---

## Key Features Implementation

### 1. Poll Creation Flow
- Step 1: Enter title and description
- Step 2: Select dates using multi-date calendar picker
- Step 3: Choose time range (start/end hours)
- Step 4: Preview and create → generates unique URL

### 2. Availability Grid
- **Drag-to-select**: Mouse down starts selection, mouse move extends, mouse up confirms
- **Touch support**: Touch events for mobile responsiveness
- **Visual feedback**: Cells highlight on hover/drag
- **Responsive**: Horizontal scroll on mobile, full grid on desktop

### 3. Heatmap Visualization
- **Color scale**: White (0%) → Light Green → Dark Green (100%)
- **Hover details**: Shows exact participants for each slot
- **Best slot highlighting**: Golden border on optimal times

### 4. Timezone Handling
- Detect user timezone via `Intl.DateTimeFormat().resolvedOptions().timeZone`
- Store all times in UTC/GMT
- Convert to local time for display
- Show timezone indicator in UI

---

## URL Structure

- `/` - Landing page
- `/create` - Poll creation wizard
- `/poll/[id]` - Join poll and add availability
- `/poll/[id]/results` - View aggregated results

---

## State Persistence (LocalStorage)

```typescript
// Storage keys
const STORAGE_KEYS = {
  POLLS: 'timesync_polls',           // All created polls
  PARTICIPANTS: 'timesync_participants', // All participants
  TIME_SLOTS: 'timesync_timeslots',     // All time slot selections
};
```

---

## Design System

### Colors
- **Primary**: Emerald (#10B981)
- **Background**: Slate-50 (#F8FAFC)
- **Surface**: White (#FFFFFF)
- **Text**: Slate-900 (#0F172A)
- **Muted**: Slate-500 (#64748B)
- **Accent**: Amber (#F59E0B)
- **Heatmap Scale**: White → Emerald-100 → Emerald-500 → Emerald-700

### Typography
- **Headings**: Inter (or system font)
- **Body**: Inter (or system font)

### Spacing
- Consistent 4px base grid
- Card padding: 24px
- Section gaps: 48px

---

## Responsive Breakpoints

- **Mobile**: < 640px (single column, horizontal scroll for grid)
- **Tablet**: 640px - 1024px (condensed view)
- **Desktop**: > 1024px (full experience)

