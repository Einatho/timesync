# TimeSync - Group Scheduling Made Simple

A modern, high-performance group scheduling web application similar to Doodle or When2Meet. Built with Next.js 15, TypeScript, and Tailwind CSS.

![TimeSync Preview](https://via.placeholder.com/800x400?text=TimeSync+Preview)

## Features

- 📅 **Poll Creation**: Create scheduling polls with custom date ranges and time slots
- 🖱️ **Drag-to-Select**: Intuitive click-and-drag interface for selecting availability
- 🌡️ **Heatmap Visualization**: See at a glance when most people are available
- 👤 **No Login Required**: Just share a link and enter your name to participate
- 🌍 **Timezone Support**: Times stored in UTC and displayed in local timezone
- 📱 **Responsive Design**: Works great on desktop and mobile devices
- 💾 **Local Storage**: Data persists in the browser (no server required)

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom shadcn/ui-inspired components
- **Icons**: Lucide React
- **Date Handling**: date-fns & date-fns-tz
- **State Management**: React useState

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
   ```bash
   cd when2meet-clone
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Creating a Poll

1. Click "New Poll" or "Create a Poll"
2. Enter a title and your name
3. Select the dates you want to include
4. Choose the time range and slot duration
5. Click "Create Poll"
6. Share the generated link with participants

### Participating in a Poll

1. Open the shared poll link
2. Enter your name
3. Click and drag on the grid to select your available times
4. Click "Save" to submit your availability

### Viewing Results

1. Click "View Group Results" on any poll
2. See the heatmap showing when most people are available
3. Best times are highlighted with a golden border

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing page
│   ├── create/            # Poll creation
│   └── poll/[id]/         # Poll participation & results
├── components/
│   ├── ui/                # Base UI components
│   ├── poll/              # Poll-specific components
│   ├── availability/      # Grid and selection components
│   └── shared/            # Common components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and helpers
└── types/                 # TypeScript interfaces
```

## License

MIT License - feel free to use this for your own projects!

## Acknowledgments

- Inspired by [When2Meet](https://when2meet.com) and [Doodle](https://doodle.com)
- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Lucide](https://lucide.dev/)

