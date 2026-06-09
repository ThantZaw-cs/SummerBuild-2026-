"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

const initialValues = {
  location: "",
  description: ""
};

export function ReportForm() {
  const router = useRouter();
  const [values, setValues] = useState(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    setIsSubmitting(true);
    setMessage(null);
    setIsError(false);

    try {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(
          "You need to be signed in before submitting a report. Auth UI is not added yet."
        );
      }

      const { data, error } = await supabase
        .from("reports")
        .insert({
          user_id: user.id,
          short_description: values.description,
          location_text: values.location,
          media_type: "image"
        })
        .select("id")
        .single();

      if (error) {
        throw error;
      }

      setValues(initialValues);
      form.reset();
      router.push(`/reports/${data.id}`);
    } catch (error) {
      setIsError(true);
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
    <section className="panel px-6 py-6">
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="media"
            className="text-sm font-semibold text-ink"
          >
            Image upload
          </label>
          <div className="mt-2 rounded-lg border border-dashed border-ink/20 bg-tide/20 p-6">
            <input
              id="media"
              name="media"
              type="file"
              accept="image/*"
              className="block w-full text-sm text-ink/70 file:mr-4 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-ink/90"
              required
            />
            <p className="mt-3 text-sm text-ink/55">
              Placeholder upload only. Nothing is uploaded or saved yet.
            </p>
          </div>
        </div>

        <div>
          <label
            htmlFor="location"
            className="text-sm font-semibold text-ink"
          >
            Location
          </label>
          <input
            id="location"
            name="location"
            type="text"
            placeholder="Block 123, Clementi Ave 3"
            value={values.location}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                location: event.target.value
              }))
            }
            className="mt-2 w-full rounded-lg border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-ink/30"
            required
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="text-sm font-semibold text-ink"
          >
            Short description
          </label>
          <textarea
            id="description"
            name="description"
            placeholder="Cracked pavement near the crossing"
            rows={5}
            value={values.description}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                description: event.target.value
              }))
            }
            className="mt-2 w-full rounded-lg border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-ink/30"
            required
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:bg-ink/45"
          >
            {isSubmitting ? "Submitting..." : "Submit report"}
          </button>
          <span className="text-sm text-ink/55">
            {isSubmitting ? "Saving report." : "Saved to Supabase when signed in."}
          </span>
        </div>

        {message ? (
          <div
            className={
              isError
                ? "rounded-lg border border-ember/20 bg-ember/10 px-4 py-3 text-sm text-ember"
                : "rounded-lg border border-moss/20 bg-moss/10 px-4 py-3 text-sm text-moss"
            }
          >
            {message}
          </div>
        ) : null}
      </form>
    </section>
  );
}
