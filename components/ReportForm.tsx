"use client";

import { useState } from "react";

const initialValues = {
  locationText: "",
  description: ""
};

export function ReportForm() {
  const [values, setValues] = useState(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    await new Promise((resolve) => setTimeout(resolve, 900));

    setIsSubmitting(false);
    setValues(initialValues);
    setMessage("Mock submission complete. This base scaffold does not save data yet.");
  }

  return (
    <section className="panel px-6 py-6">
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="media"
            className="text-sm font-semibold text-ink"
          >
            Photo or video
          </label>
          <div className="mt-2 rounded-[24px] border border-dashed border-ink/20 bg-tide/20 p-6">
            <input
              id="media"
              name="media"
              type="file"
              accept="image/*,video/*"
              className="block w-full text-sm text-ink/70 file:mr-4 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-ink/90"
            />
            <p className="mt-3 text-sm text-ink/55">
              Placeholder upload only. Nothing is uploaded or saved yet.
            </p>
          </div>
        </div>

        <div>
          <label
            htmlFor="locationText"
            className="text-sm font-semibold text-ink"
          >
            Location
          </label>
          <input
            id="locationText"
            name="locationText"
            type="text"
            placeholder="Block 123, Clementi Ave 3"
            value={values.locationText}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                locationText: event.target.value
              }))
            }
            className="mt-2 w-full rounded-[20px] border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-ink/30"
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
            className="mt-2 w-full rounded-[20px] border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-ink/30"
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
            {isSubmitting ? "Simulating a basic form flow." : "UI-only base form."}
          </span>
        </div>

        {message ? (
          <div className="rounded-[20px] border border-moss/20 bg-moss/10 px-4 py-3 text-sm text-moss">
            {message}
          </div>
        ) : null}
      </form>
    </section>
  );
}
