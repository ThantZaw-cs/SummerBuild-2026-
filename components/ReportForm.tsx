"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Camera,
  CheckCircle,
  FileText,
  Image,
  Info,
  MapPin,
  Upload,
  Video,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getSupabaseBrowserClient } from "@/lib/supabase";

const steps = [
  { id: 1, label: "Upload Media", icon: Camera },
  { id: 2, label: "Location", icon: MapPin },
  { id: 3, label: "Details", icon: FileText }
];

const categories = [
  "Roads & Pavements",
  "Street Lighting",
  "Drainage & Waterways",
  "Signage & Furniture",
  "Parks & Greenery",
  "Public Property",
  "Other"
];

export function ReportForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedMediaUrl, setUploadedMediaUrl] = useState<string | null>(null);
  const [uploadedMediaType, setUploadedMediaType] = useState<"image" | "video">("image");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setUploadedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setUploadedMediaUrl(null);
    setMessage(null);
    setIsUploading(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Please log in before uploading media.");
      }

      const mediaType = file.type.startsWith("video") ? "video" : "image";
      const extension = file.name.split(".").pop() ?? mediaType;
      const filePath = `${user.id}/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from("report-media")
        .upload(filePath, file, {
          contentType: file.type,
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrl } = supabase.storage
        .from("report-media")
        .getPublicUrl(filePath);

      setUploadedMediaUrl(publicUrl.publicUrl);
      setUploadedMediaType(mediaType);
    } catch (error) {
      setUploadedFile(null);
      setUploadedMediaUrl(null);
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to upload media. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  }

  function removeFile() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setUploadedFile(null);
    setPreviewUrl(null);
    setUploadedMediaUrl(null);
  }

  function canProceed() {
    if (currentStep === 1) {
      return Boolean(uploadedFile && uploadedMediaUrl && !isUploading);
    }

    if (currentStep === 2) {
      return location.trim().length > 0;
    }

    if (currentStep === 3) {
      return description.trim().length > 0;
    }

    return false;
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    setMessage(null);

    try {
      if (!uploadedFile) {
        throw new Error("Please upload a photo or video before submitting.");
      }

      const supabase = getSupabaseBrowserClient();
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Please log in before submitting a report.");
      }

      if (!uploadedMediaUrl) {
        throw new Error("Please wait for the media upload to finish.");
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      if (!accessToken) {
        throw new Error("Your session expired. Please log in again.");
      }

      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          description,
          location_text: location,
          media_url: uploadedMediaUrl,
          media_type: uploadedMediaType,
          issue_type: category || null
        })
      });

      const payload = (await response.json()) as { id?: string; error?: string };

      if (!response.ok || !payload.id) {
        throw new Error(payload.error ?? "Unable to submit report.");
      }

      router.push(`/reports/${payload.id}`);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to submit report. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8 text-center">
        <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
          Report an Issue
        </h1>
        <p className="mt-2 text-muted-foreground">
          Help improve your community - it only takes 30 seconds.
        </p>
      </div>

      <div className="mb-10 flex items-center justify-center gap-2">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isDone = currentStep > step.id;

          return (
            <div key={step.id} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => isDone && setCurrentStep(step.id)}
                className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-primary text-white shadow-sm"
                    : isDone
                      ? "cursor-pointer bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {isDone ? (
                  <CheckCircle className="h-3.5 w-3.5" />
                ) : (
                  <Icon className="h-3.5 w-3.5" />
                )}
                <span className="hidden sm:inline">{step.label}</span>
              </button>
              {index < steps.length - 1 ? (
                <div className={`h-px w-8 ${isDone ? "bg-primary" : "bg-border"}`} />
              ) : null}
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {currentStep === 1 ? (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <Card className="border-border shadow-sm">
              <CardContent className="p-6 sm:p-8">
            <h2 className="mb-1 font-heading text-lg font-semibold text-foreground">
              Upload a photo or video
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Take a clear photo showing the infrastructure issue.
            </p>

            {!uploadedFile ? (
              <label className="flex h-56 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border transition-all hover:border-primary/40">
                <Upload className="mb-3 h-8 w-8 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  Click to upload or drag and drop
                </span>
                <span className="mt-1 text-xs text-muted-foreground">
                  JPG, PNG, MP4, MOV / Max 25MB
                </span>
                <div className="mt-4 flex items-center gap-4">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Image className="h-3.5 w-3.5" /> Photo
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Video className="h-3.5 w-3.5" /> Video
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            ) : (
              <div className="relative overflow-hidden rounded-xl border border-border">
                {uploadedFile.type.startsWith("video") ? (
                  <video src={previewUrl ?? undefined} className="h-56 w-full object-cover" controls />
                ) : (
                  <img
                    src={previewUrl ?? undefined}
                    alt="Preview"
                    className="h-56 w-full object-cover"
                  />
                )}
                <button
                  type="button"
                  onClick={removeFile}
                  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
                  aria-label="Remove file"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="absolute bottom-3 left-3 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white">
                  {isUploading
                    ? "Uploading..."
                    : uploadedMediaUrl
                      ? "Uploaded"
                      : "Upload needed"}
                </div>
              </div>
            )}
              </CardContent>
            </Card>
          </motion.div>
        ) : null}

        {currentStep === 2 ? (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <Card className="border-border shadow-sm">
              <CardContent className="p-6 sm:p-8">
            <h2 className="mb-1 font-heading text-lg font-semibold text-foreground">
              Where is the issue?
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Enter the location or use the map to pin it.
            </p>

            <div className="space-y-4">
              <div>
                <Label htmlFor="location" className="text-sm font-medium">
                  Location
                </Label>
                <div className="relative mt-1.5">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="location"
                    placeholder="e.g. Tampines Ave 4, Bus Stop 75219"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex h-48 w-full items-center justify-center rounded-xl border border-border bg-muted">
                <div className="text-center">
                  <MapPin className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Map view</p>
                  <p className="text-xs text-muted-foreground">
                    Click to pin location
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setLocation("Current GPS Location")}
              >
                <MapPin className="mr-2 h-4 w-4" />
                Use my current location
              </Button>
            </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : null}

        {currentStep === 3 ? (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <Card className="border-border shadow-sm">
              <CardContent className="p-6 sm:p-8">
            <h2 className="mb-1 font-heading text-lg font-semibold text-foreground">
              Describe the issue
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">
              A short sentence is all we need - AI handles the rest.
            </p>

            <div className="space-y-5">
              <div>
                <Label htmlFor="description" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="e.g. Crack near bus stop"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="mt-1.5 h-24 resize-none"
                />
                <div className="mt-2 flex items-start gap-2 text-xs text-muted-foreground">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>
                    Just write a simple sentence. Our AI will analyze the photo
                    and generate a full report.
                  </span>
                </div>
              </div>

              <div>
                <Label htmlFor="category" className="text-sm font-medium">
                  Category{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="AI will auto-detect if not selected" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="mt-6 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
          className="text-muted-foreground"
        >
          Back
        </Button>

        {currentStep < 3 ? (
          <Button
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={!canProceed()}
            className="bg-primary text-white hover:bg-primary/90"
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!canProceed() || isSubmitting}
            className="min-w-[140px] bg-primary text-white hover:bg-primary/90"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Submitting...
              </div>
            ) : (
              <>
                Submit Report
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </div>

      {message ? (
        <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {message}
        </div>
      ) : null}
    </div>
  );
}
