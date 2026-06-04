import Link from "next/link";

export default function NotFound() {
  return (
    <div className="panel mx-auto max-w-2xl px-6 py-10 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-moss">
        Report not found
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">
        This report does not exist in the mock dataset.
      </h1>
      <p className="mt-4 text-sm leading-7 text-ink/72">
        The base scaffold uses local mock data, so this screen appears when an
        ID is not present in that starter dataset.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink/90"
      >
        Return to dashboard
      </Link>
    </div>
  );
}
