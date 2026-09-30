import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { resumeMatchers } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export default async function ResumeMatcherHistoryDetailPage({
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
    .from(resumeMatchers)
    .where(
      and(
        eq(resumeMatchers.id, analysisId),
        eq(resumeMatchers.userId, userId)
      )
    )
    .limit(1);

  if (!analysis) {
    notFound();
  }

  /*
   * Your current Drizzle schema returns these JSON fields as unknown.
   * Convert them safely into string arrays before rendering.
   */
  const candidateSkills = toStringArray(
    analysis.candidateSkills
  );

  const matchingSkills = toStringArray(
    analysis.matchingSkills
  );

  const missingSkills = toStringArray(
    analysis.missingSkills
  );

  const jobRequirements = toStringArray(
    analysis.jobRequirements
  );

  const recommendations = toStringArray(
    analysis.recommendations
  );

  const score = Number(analysis.matchScore);

  const scoreClass =
    score >= 80
      ? "bg-green-100 text-green-700"
      : score >= 60
        ? "bg-yellow-100 text-yellow-700"
        : "bg-red-100 text-red-700";

  return (
    <main className="min-h-screen bg-gray-50 p-5 md:p-8">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-8">
          <Link
            href="/resume-matcher/history"
            className="text-sm font-medium text-gray-500 hover:text-gray-900"
          >
            ← Back to History
          </Link>

          <div className="mt-5 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Resume Match Analysis
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                {analysis.resumeName}
              </p>

              <p className="mt-1 text-xs text-gray-400">
                {analysis.createdAt.toLocaleString()}
              </p>
            </div>

            <div
              className={`rounded-full px-6 py-3 text-lg font-bold ${scoreClass}`}
            >
              {score}% Match
            </div>
          </div>
        </div>

        {/* Summary */}
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Overall Summary
          </h2>

          <p className="mt-3 leading-7 text-gray-600">
            {analysis.summary}
          </p>
        </section>

        {/* Skills */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">

          <SkillSection
            title="Candidate Skills"
            description="Skills identified from your resume."
            items={candidateSkills}
          />

          <SkillSection
            title="Matching Skills"
            description="Skills that match the job requirements."
            items={matchingSkills}
          />

          <SkillSection
            title="Missing Skills"
            description="Important requirements not demonstrated in your resume."
            items={missingSkills}
            danger
          />

          <SkillSection
            title="Job Requirements"
            description="Important requirements extracted from the job description."
            items={jobRequirements}
          />

        </div>

        {/* Recommendations */}
        <section className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Recommendations
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Suggested areas to improve before applying.
          </p>

          {recommendations.length === 0 ? (
            <p className="mt-5 text-sm text-gray-400">
              No recommendations available.
            </p>
          ) : (
            <div className="mt-5 space-y-3">
              {recommendations.map(
                (recommendation: string, index: number) => (
                  <div
                    key={`${recommendation}-${index}`}
                    className="flex gap-3 rounded-xl bg-gray-50 p-4"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                      {index + 1}
                    </span>

                    <p className="text-sm leading-6 text-gray-700">
                      {recommendation}
                    </p>
                  </div>
                )
              )}
            </div>
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

        {/* Actions */}
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/resume-matcher"
            className="rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            New Analysis
          </Link>

          <Link
            href="/resume-matcher/history"
            className="rounded-lg border bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            View History
          </Link>
        </div>

      </div>
    </main>
  );
}

/**
 * Safely converts JSON/unknown database values
 * into a string array.
 */
function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is string => typeof item === "string"
  );
}

function SkillSection({
  title,
  description,
  items,
  danger = false,
}: {
  title: string;
  description: string;
  items: string[];
  danger?: boolean;
}) {
  return (
    <section className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">
        {title}
      </h2>

      <p className="mt-1 text-sm text-gray-500">
        {description}
      </p>

      {items.length === 0 ? (
        <p className="mt-5 text-sm text-gray-400">
          None identified.
        </p>
      ) : (
        <div className="mt-5 flex flex-wrap gap-2">
          {items.map((skill, index) => (
            <span
              key={`${skill}-${index}`}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                danger
                  ? "bg-red-50 text-red-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {skill}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}