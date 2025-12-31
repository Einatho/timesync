"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/shared/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/poll/date-picker";
import { savePoll } from "@/lib/storage";
import { formatDateKey, getUserTimezone } from "@/lib/date-utils";
import { generateId } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  FileText,
  Check,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Step = 1 | 2;

export default function CreatePollPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creatorName, setCreatorName] = useState("");
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  const [isCreating, setIsCreating] = useState(false);

  const canProceedFromStep1 = title.trim().length > 0 && creatorName.trim().length > 0;
  const canProceedFromStep2 = selectedDates.length > 0;
  const canCreate = canProceedFromStep1 && canProceedFromStep2;

  const handleNext = () => {
    if (step < 2) setStep((step + 1) as Step);
  };

  const handleBack = () => {
    if (step > 1) setStep((step - 1) as Step);
  };

  const handleCreate = async () => {
    if (!canCreate) return;

    setIsCreating(true);

    const poll = {
      id: generateId(),
      title: title.trim(),
      description: description.trim() || undefined,
      creatorName: creatorName.trim(),
      createdAt: new Date().toISOString(),
      dates: selectedDates.map(formatDateKey).sort(),
      timeSlotDuration: 1440, // Full day (24 hours * 60 minutes)
      startHour: 0,
      endHour: 24,
      timezone: getUserTimezone(),
    };

    savePoll(poll);

    // Small delay for visual feedback
    await new Promise((resolve) => setTimeout(resolve, 500));

    router.push(`/poll/${poll.id}`);
  };

  const steps = [
    { num: 1, title: "Details", icon: FileText },
    { num: 2, title: "Dates", icon: Calendar },
  ];

  return (
    <>
      <Header />
      <main className="container mx-auto max-w-2xl px-4 py-8 md:py-12">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {steps.map((s, idx) => (
              <div key={s.num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300",
                      step >= s.num
                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                        : "bg-slate-100 text-slate-400"
                    )}
                  >
                    {step > s.num ? (
                      <Check className="h-6 w-6" />
                    ) : (
                      <s.icon className="h-5 w-5" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "mt-2 text-sm font-medium",
                      step >= s.num ? "text-slate-900" : "text-slate-400"
                    )}
                  >
                    {s.title}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={cn(
                      "mx-4 h-0.5 w-16 md:w-24 transition-colors duration-300",
                      step > s.num ? "bg-emerald-500" : "bg-slate-200"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>
              {step === 1 && "Poll Details"}
              {step === 2 && "Select Dates"}
            </CardTitle>
            <CardDescription>
              {step === 1 && "Give your poll a name and add your details"}
              {step === 2 && "Choose the dates you want to include in the poll"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Details */}
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="title">Poll Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Team Meeting Next Week"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Add any additional details about the meeting..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Your Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., John Doe"
                    value={creatorName}
                    onChange={(e) => setCreatorName(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* Step 2: Dates */}
            {step === 2 && (
              <>
                <div className="flex justify-center">
                  <div className="w-full max-w-sm">
                    <DatePicker
                      selectedDates={selectedDates}
                      onDatesChange={setSelectedDates}
                    />
                  </div>
                </div>

                {/* Preview */}
                {selectedDates.length > 0 && (
                  <div className="rounded-xl border-2 border-dashed border-emerald-200 bg-emerald-50/50 p-4 mt-6">
                    <h4 className="font-medium text-slate-900 mb-2">Poll Summary</h4>
                    <ul className="space-y-1 text-sm text-slate-600">
                      <li>
                        <span className="text-slate-500">Title:</span>{" "}
                        <span className="font-medium">{title}</span>
                      </li>
                      <li>
                        <span className="text-slate-500">Dates:</span>{" "}
                        <span className="font-medium">
                          {selectedDates.length} day{selectedDates.length !== 1 ? "s" : ""} selected
                        </span>
                      </li>
                    </ul>
                  </div>
                )}
              </>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={step === 1}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>

              {step < 2 ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceedFromStep1}
                  className="gap-2"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleCreate}
                  disabled={!canCreate || isCreating}
                  className="gap-2"
                >
                  {isCreating ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Create Poll
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}

