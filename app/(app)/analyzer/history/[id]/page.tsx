import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { jobAnalyzers } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export default async function AnalyzerHistoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const { id } = await params;
  const analysisId = Number(id);

  if (!Number.isInteger(analysisId)) {
    notFound();
  }

  const [analysis] = await db
    .select()
    .from(jobAnalyzers)
    .where(
      and(
        eq(jobAnalyzers.id, analysisId),
        eq(jobAnalyzers.userId, userId)
      )
    )
    .limit(1);

  if (!analysis) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50 p-5 md:p-8">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-8">
          <Link
            href="/analyzer/history"
            className="text-sm font-medium text-gray-500 hover:text-gray-900"
          >
            ← Back to History
          </Link>

          <div className="mt-5 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">
                AI Job Analysis
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">
                {analysis.jobTitle || "Job Analysis"}
              </h1>

              <p className="mt-2 text-xs text-gray-400">
                {analysis.createdAt.toLocaleString()}
              </p>
            </div>

            <Link
              href="/analyzer"
              className="rounded-lg bg-black px-5 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              New Analysis
            </Link>
          </div>
        </div>

        {/* Summary */}
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Summary
          </h2>

          <p className="mt-3 text-sm leading-7 text-gray-600">
            {analysis.summary || "No summary available."}
          </p>
        </section>

        {/* Skills */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">

          <ResultSection
            title="Required Skills"
            items={analysis.requiredSkills}
          />

          <ResultSection
            title="Preferred Skills"
            items={analysis.preferredSkills}
          />

          <ResultSection
            title="Important Keywords"
            items={analysis.keywords}
          />

          <ResultSection
            title="Preparation Topics"
            items={analysis.preparationTopics}
          />

        </div>

        {/* Experience + Education */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">

          <InfoCard
            title="Experience"
            value={analysis.experience}
          />

          <InfoCard
            title="Education"
            value={analysis.education}
          />

        </div>

        {/* Responsibilities */}
        <section className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Responsibilities
          </h2>

          {analysis.responsibilities?.length ? (
            <ul className="mt-4 space-y-3">
              {analysis.responsibilities.map(
                (item, index) => (
                  <li
                    key={`${item}-${index}`}
                    className="flex gap-3 text-sm leading-6 text-gray-600"
                  >
                    <span className="font-bold text-gray-400">
                      •
                    </span>

                    <span>{item}</span>
                  </li>
                )
              )}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-gray-400">
              No responsibilities found.
            </p>
          )}
        </section>

        {/* Job Description */}
        <section className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Job Description
          </h2>

          <div className="mt-4 max-h-[500px] overflow-y-auto rounded-xl bg-gray-50 p-5">
            <p className="whitespace-pre-wrap text-sm leading-7 text-gray-600">
              {analysis.jobDescription}
            </p>
          </div>
        </section>

        {/* Bottom Actions */}
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/analyzer"
            className="rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            New Analysis
          </Link>

          <Link
            href="/analyzer/history"
            className="rounded-lg border bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            View History
          </Link>
        </div>

      </div>
    </main>
  );
}

function ResultSection({
  title,
  items,
}: {
  title: string;
  items: unknown;
}) {
  const values = Array.isArray(items)
    ? items.filter(
        (item): item is string =>
          typeof item === "string"
      )
    : [];

  return (
    <section className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">
        {title}
      </h2>

      {values.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {values.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700"
            >
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-gray-400">
          No information found.
        </p>
      )}
    </section>
  );
}

function InfoCard({
  title,
  value,
}: {
  title: string;
  value: unknown;
}) {
  return (
    <section className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">
        {title}
      </h2>

      <p className="mt-4 text-sm leading-6 text-gray-600">
        {typeof value === "string" && value.trim()
          ? value
          : "Not specified"}
      </p>
    </section>
  );
}