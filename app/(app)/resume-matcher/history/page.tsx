import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { resumeMatchers } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export default async function ResumeMatcherHistoryPage() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const analyses = await db
    .select()
    .from(resumeMatchers)
    .where(eq(resumeMatchers.userId, userId))
    .orderBy(desc(resumeMatchers.createdAt));

  return (
    <main className="min-h-screen bg-gray-50 p-5 md:p-8">
      <div className="mx-auto max-w-6xl">

        <div className="mb-8">
          <Link
            href="/resume-matcher"
            className="text-sm font-medium text-gray-500 hover:text-gray-900"
          >
            ← Resume Matcher
          </Link>

          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Resume Matcher History
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                View your previous resume-to-job analyses.
              </p>
            </div>

            <Link
              href="/resume-matcher"
              className="w-fit rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              New Analysis
            </Link>
          </div>
        </div>

        {analyses.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-white p-12 text-center">
            <div className="text-4xl">📄</div>

            <h2 className="mt-4 text-lg font-semibold text-gray-900">
              No analyses yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
              Upload your resume and compare it with a job description
              to create your first analysis.
            </p>

            <Link
              href="/resume-matcher"
              className="mt-6 inline-block rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white"
            >
              Analyze Resume
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {analyses.map((analysis) => (
              <AnalysisCard
                key={analysis.id}
                analysis={analysis}
              />
            ))}
          </div>
        )}

      </div>
    </main>
  );
}

function AnalysisCard({
  analysis,
}: {
  analysis: typeof resumeMatchers.$inferSelect;
}) {
  const score = Number(analysis.matchScore);

  const scoreClass =
    score >= 80
      ? "bg-green-100 text-green-700"
      : score >= 60
        ? "bg-yellow-100 text-yellow-700"
        : "bg-red-100 text-red-700";

  return (
    <Link
      href={`/resume-matcher/history/${analysis.id}`}
      className="block rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900">
            {analysis.resumeName}
          </p>

          <p className="mt-1 text-xs text-gray-400">
            {analysis.createdAt.toLocaleString()}
          </p>

          <p className="mt-3 line-clamp-2 text-sm text-gray-600">
            {analysis.summary}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <div
            className={`rounded-full px-4 py-2 text-sm font-bold ${scoreClass}`}
          >
            {score}%
          </div>

          <span className="text-sm text-gray-400">
            View →
          </span>
        </div>

      </div>
    </Link>
  );
}