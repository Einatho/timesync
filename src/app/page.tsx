"use client";

import Link from "next/link";
import { Header } from "@/components/shared/header";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Users,
  Zap,
  Clock,
  MousePointerClick,
  BarChart3,
  ArrowRight,
  Sparkles,
  Globe,
} from "lucide-react";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden px-4 py-20 md:py-32">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col items-center text-center">
              {/* Badge */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700 animate-fade-in">
                <Sparkles className="h-4 w-4" />
                Free & No Sign-up Required
              </div>

              {/* Headline */}
              <h1 className="mb-6 max-w-4xl text-4xl font-bold tracking-tight text-slate-900 md:text-6xl lg:text-7xl animate-slide-up">
                Find the{" "}
                <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                  Perfect Time
                </span>{" "}
                for Everyone
              </h1>

              {/* Subtitle */}
              <p className="mb-10 max-w-2xl text-lg text-slate-600 md:text-xl animate-slide-up" style={{ animationDelay: "100ms" }}>
                Schedule group meetings effortlessly. Create a poll, share the link,
                and let everyone mark their availability. No accounts needed.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col gap-4 sm:flex-row animate-slide-up" style={{ animationDelay: "200ms" }}>
                <Link href="/create">
                  <Button size="lg" className="gap-2 text-base">
                    Create a Poll
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button size="lg" variant="outline" className="gap-2 text-base">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>

            {/* Decorative Grid Preview */}
            <div className="mt-16 md:mt-24 animate-slide-up" style={{ animationDelay: "300ms" }}>
              <div className="relative mx-auto max-w-4xl rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-2xl shadow-slate-200/50 backdrop-blur-xl">
                <div className="absolute -top-3 left-6 rounded-full bg-emerald-500 px-3 py-1 text-xs font-medium text-white shadow-lg">
                  Live Preview
                </div>
                <PreviewGrid />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="px-4 py-20 md:py-32">
          <div className="container mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">
                Scheduling Made Simple
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-slate-600">
                Everything you need to coordinate group availability in one beautiful tool.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={<MousePointerClick className="h-6 w-6" />}
                title="Drag to Select"
                description="Click and drag to quickly mark your available time slots. Works on both desktop and mobile."
                delay={0}
              />
              <FeatureCard
                icon={<Users className="h-6 w-6" />}
                title="No Sign-up Required"
                description="Just share the link and enter your name. No accounts, no passwords, no friction."
                delay={100}
              />
              <FeatureCard
                icon={<BarChart3 className="h-6 w-6" />}
                title="Visual Heatmap"
                description="See at a glance when most people are available with our color-coded availability grid."
                delay={200}
              />
              <FeatureCard
                icon={<Globe className="h-6 w-6" />}
                title="Timezone Smart"
                description="Times are automatically converted to each participant's local timezone."
                delay={300}
              />
              <FeatureCard
                icon={<Zap className="h-6 w-6" />}
                title="Instant Results"
                description="See responses in real-time as participants fill in their availability."
                delay={400}
              />
              <FeatureCard
                icon={<Clock className="h-6 w-6" />}
                title="Flexible Time Slots"
                description="Choose 30-minute or 60-minute slots and customize the time range."
                delay={500}
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 py-20">
          <div className="container mx-auto max-w-4xl">
            <div className="rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 p-8 text-center shadow-2xl shadow-emerald-500/25 md:p-16">
              <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
                Ready to Find Your Perfect Time?
              </h2>
              <p className="mb-8 text-lg text-emerald-100">
                Create your first poll in seconds. It&apos;s completely free.
              </p>
              <Link href="/create">
                <Button
                  size="lg"
                  className="gap-2 bg-white text-emerald-600 hover:bg-emerald-50 shadow-xl text-base"
                >
                  <Calendar className="h-5 w-5" />
                  Create a Poll Now
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-200/60 px-4 py-8">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold text-slate-900">TimeSync</span>
              </div>
              <p className="text-sm text-slate-500">
                Built with ❤️ for better scheduling
              </p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <div
      className="group rounded-2xl border border-slate-200/80 bg-white/60 p-6 shadow-lg shadow-slate-100 backdrop-blur-sm transition-all hover:shadow-xl hover:-translate-y-1 animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 transition-colors group-hover:bg-emerald-500 group-hover:text-white">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </div>
  );
}

function PreviewGrid() {
  const days = ["Mon 6", "Tue 7", "Wed 8", "Thu 9", "Fri 10"];
  const times = ["9 AM", "10 AM", "11 AM", "12 PM", "1 PM"];
  
  // Sample availability data (percentage filled)
  const sampleData: Record<string, number> = {
    "0-0": 100, "0-1": 75, "0-2": 50, "0-3": 25, "0-4": 50,
    "1-0": 75, "1-1": 100, "1-2": 100, "1-3": 75, "1-4": 25,
    "2-0": 50, "2-1": 100, "2-2": 100, "2-3": 100, "2-4": 75,
    "3-0": 25, "3-1": 50, "3-2": 75, "3-3": 75, "3-4": 100,
    "4-0": 0, "4-1": 25, "4-2": 50, "4-3": 50, "4-4": 75,
  };

  const getColor = (percentage: number) => {
    if (percentage === 0) return "bg-slate-100";
    if (percentage <= 25) return "bg-emerald-100";
    if (percentage <= 50) return "bg-emerald-200";
    if (percentage <= 75) return "bg-emerald-400";
    return "bg-emerald-500";
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[400px]">
        {/* Header row */}
        <div className="grid grid-cols-6 gap-1 mb-1">
          <div className="h-12" />
          {days.map((day) => (
            <div
              key={day}
              className="flex h-12 flex-col items-center justify-center rounded-lg bg-slate-50 text-xs font-medium text-slate-600"
            >
              <span className="text-slate-400">{day.split(" ")[0]}</span>
              <span className="text-slate-700">{day.split(" ")[1]}</span>
            </div>
          ))}
        </div>

        {/* Time rows */}
        {times.map((time, timeIdx) => (
          <div key={time} className="grid grid-cols-6 gap-1 mb-1">
            <div className="flex h-10 items-center justify-end pr-3 text-xs font-medium text-slate-500">
              {time}
            </div>
            {days.map((_, dayIdx) => {
              const key = `${timeIdx}-${dayIdx}`;
              const percentage = sampleData[key] || 0;
              return (
                <div
                  key={key}
                  className={`h-10 rounded-lg transition-all duration-200 ${getColor(percentage)} ${
                    percentage === 100 ? "ring-2 ring-amber-400 ring-offset-1" : ""
                  }`}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-slate-100" />
          <span>0%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-emerald-200" />
          <span>50%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-emerald-500" />
          <span>100%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-emerald-500 ring-2 ring-amber-400 ring-offset-1" />
          <span>Best Time</span>
        </div>
      </div>
    </div>
  );
}

