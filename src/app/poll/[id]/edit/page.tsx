"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/shared/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/poll/date-picker";
import { getPoll, savePoll } from "@/lib/storage";
import { formatDateKey } from "@/lib/date-utils";
import { Poll } from "@/types";
import {
  ArrowLeft,
  Calendar,
  ImageIcon,
  Plus,
  X,
  Link as LinkIcon,
  Save,
  Check,
} from "lucide-react";
import { parseISO } from "date-fns";

interface PageProps {
  params: { id: string };
}

export default function EditTripPage({ params }: PageProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [poll, setPoll] = useState<Poll | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [heroImage, setHeroImage] = useState("");
  const [imageInputMode, setImageInputMode] = useState<"upload" | "url">("upload");
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  // Load poll data
  useEffect(() => {
    const loadedPoll = getPoll(params.id);
    if (!loadedPoll) {
      router.push("/");
      return;
    }
    setPoll(loadedPoll);
    setTitle(loadedPoll.title);
    setDescription(loadedPoll.description || "");
    setHeroImage(loadedPoll.heroImage || "");
    setSelectedDates(loadedPoll.dates.map((d) => parseISO(d)));
    setIsLoading(false);
  }, [params.id, router]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

  const handleSave = async () => {
    if (!poll || !title.trim() || selectedDates.length === 0) return;

    setIsSaving(true);
    setSaveSuccess(false);

    const updatedPoll: Poll = {
      ...poll,
      title: title.trim(),
      description: description.trim() || undefined,
      heroImage: heroImage.trim() || undefined,
      dates: selectedDates.map(formatDateKey).sort(),
    };

    savePoll(updatedPoll);

    await new Promise((resolve) => setTimeout(resolve, 300));
    
    setSaveSuccess(true);
    setIsSaving(false);

    setTimeout(() => {
      router.push(`/poll/${poll.id}`);
    }, 500);
  };

  const canSave = title.trim().length > 0 && selectedDates.length > 0;

  if (isLoading || !poll) {
    return (
      <>
        <Header />
        <main className="container mx-auto max-w-2xl px-4 py-12">
          <div className="text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 mb-4 animate-pulse">
              <Calendar className="h-6 w-6 text-slate-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Loading...</h1>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="container mx-auto max-w-2xl px-4 py-8">
        {/* Back button */}
        <Link href={`/poll/${poll.id}`}>
          <Button variant="ghost" className="gap-2 mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to Trip
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Edit Trip</CardTitle>
            <CardDescription>Update your trip details and dates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Trip Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Summer Vacation 2025"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Add any additional details about the trip..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Hero Image */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-slate-400" />
                Hero Image (optional)
              </Label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {heroImage ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 group">
                  <img
                    src={heroImage}
                    alt="Hero preview"
                    className="w-full h-40 object-cover"
                    onError={() => clearImage()}
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

                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-px bg-slate-200" />
                    <span className="text-xs text-slate-400">or</span>
                    <div className="flex-1 h-px bg-slate-200" />
                  </div>

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
                    <div className="flex gap-2">
                      <Input
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
                  )}
                </div>
              )}
            </div>

            {/* Dates */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                Trip Dates *
              </Label>
              <div className="flex justify-center">
                <div className="w-full max-w-sm">
                  <DatePicker
                    selectedDates={selectedDates}
                    onDatesChange={setSelectedDates}
                  />
                </div>
              </div>
              {selectedDates.length > 0 && (
                <p className="text-sm text-slate-500 text-center">
                  {selectedDates.length} day{selectedDates.length !== 1 ? "s" : ""} selected
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Link href={`/poll/${poll.id}`} className="flex-1">
                <Button variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
              <Button
                onClick={handleSave}
                disabled={!canSave || isSaving}
                className="flex-1 gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving...
                  </>
                ) : saveSuccess ? (
                  <>
                    <Check className="h-4 w-4" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}

