import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { jobAnalyzers } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export default async function AnalyzerHistoryPage() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const analyses = await db
    .select()
    .from(jobAnalyzers)
    .where(eq(jobAnalyzers.userId, userId))
    .orderBy(desc(jobAnalyzers.createdAt));

  return (
    <main className="min-h-screen bg-gray-50 p-5 md:p-8">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-8">
          <Link
            href="/analyzer"
            className="text-sm font-medium text-gray-500 transition hover:text-gray-900"
          >
            ← AI Job Analyzer
          </Link>

          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Analyzer History
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                View your previous job description analyses.
              </p>
            </div>

            <Link
              href="/analyzer"
              className="w-fit rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              New Analysis
            </Link>
          </div>
        </div>

        {/* Empty State */}
        {analyses.length === 0 ? (
          <section className="rounded-2xl border border-dashed bg-white p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-2xl">
              ✨
            </div>

            <h2 className="mt-4 text-lg font-semibold text-gray-900">
              No analyses yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
              Analyze a job description to create your first
              saved analysis.
            </p>

            <Link
              href="/analyzer"
              className="mt-6 inline-block rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              Analyze Job
            </Link>
          </section>
        ) : (
          /* Analysis List */
          <div className="space-y-4">
            {analyses.map((analysis) => (
              <Link
                key={analysis.id}
                href={`/analyzer/history/${analysis.id}`}
                className="block rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-semibold text-gray-900">
                      {analysis.jobTitle || "Job Analysis"}
                    </h2>

                    <p className="mt-1 text-xs text-gray-400">
                      {analysis.createdAt.toLocaleString()}
                    </p>

                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-600">
                      {analysis.summary || "No summary available."}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600">
                      {analysis.requiredSkills?.length ?? 0} required skills
                    </span>

                    <span className="text-sm font-medium text-gray-400">
                      View →
                    </span>
                  </div>

                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}