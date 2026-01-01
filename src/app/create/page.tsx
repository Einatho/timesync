"use client";

import { useState, useRef } from "react";
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
  ImageIcon,
  Plus,
  X,
  Link as LinkIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Step = 1 | 2;

export default function CreatePollPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [heroImage, setHeroImage] = useState("");
  const [imageInputMode, setImageInputMode] = useState<"upload" | "url">("upload");
  const [creatorName, setCreatorName] = useState("");
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  const [isCreating, setIsCreating] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 2MB for localStorage)
    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setHeroImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setHeroImage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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
      heroImage: heroImage.trim() || undefined,
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
              {step === 1 && "Trip Details"}
              {step === 2 && "Select Dates"}
            </CardTitle>
            <CardDescription>
              {step === 1 && "Give your trip a name and add your details"}
              {step === 2 && "Choose the dates you want to include in the trip"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Details */}
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="title">Trip Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Summer Vacation 2025"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Add any additional details about the trip..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-slate-400" />
                    Hero Image (optional)
                  </Label>

                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {/* Image preview or upload area */}
                  {heroImage ? (
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 group">
                      <img
                        src={heroImage}
                        alt="Hero preview"
                        className="w-full h-40 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '';
                          clearImage();
                        }}
                      />
                      <button
                        type="button"
                        onClick={clearImage}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Upload button */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 text-slate-500 transition-all hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-600"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
                          <Plus className="h-5 w-5" />
                        </div>
                        <span className="text-sm font-medium">Upload an image</span>
                        <span className="text-xs text-slate-400">PNG, JPG up to 2MB</span>
                      </button>

                      {/* Toggle to URL input */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-px bg-slate-200" />
                        <span className="text-xs text-slate-400">or</span>
                        <div className="flex-1 h-px bg-slate-200" />
                      </div>

                      {/* URL input toggle */}
                      {imageInputMode === "upload" ? (
                        <button
                          type="button"
                          onClick={() => setImageInputMode("url")}
                          className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-50"
                        >
                          <LinkIcon className="h-4 w-4" />
                          Use image URL instead
                        </button>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              id="heroImage"
                              type="url"
                              placeholder="https://example.com/image.jpg"
                              value={heroImage}
                              onChange={(e) => setHeroImage(e.target.value)}
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => setImageInputMode("upload")}
                              className="shrink-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
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
                    <h4 className="font-medium text-slate-900 mb-2">Trip Summary</h4>
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
                      Create Trip
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

