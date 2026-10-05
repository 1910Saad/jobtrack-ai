"use client";

import { useState } from "react";
import Link from "next/link";

type AnalysisResult = {
  jobTitle?: string;
  summary?: string;
  requiredSkills?: string[];
  preferredSkills?: string[];
  keywords?: string[];
  preparationTopics?: string[];
  experience?: string;
  education?: string;
  responsibilities?: string[];
};

export default function AnalyzerPage() {
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");

  async function handleAnalyze() {
    if (!jobDescription.trim()) {
      setError("Please enter a job description.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/analyzer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobDescription,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to analyze job"
        );
      }

      setResult(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-5 md:p-8">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-gray-500 transition hover:text-gray-900"
          >
            ← Dashboard
          </Link>

          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                AI Job Analyzer
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Paste a job description and analyze the skills,
                requirements, and keywords.
              </p>
            </div>

            <Link
              href="/analyzer/history"
              className="inline-flex items-center justify-center rounded-lg border bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
            >
              View History
            </Link>
          </div>
        </div>

        {/* Input */}
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Job Description
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Paste the complete job description below.
            </p>
          </div>

          <textarea
            value={jobDescription}
            onChange={(e) =>
              setJobDescription(e.target.value)
            }
            placeholder={`Paste job description here...

Example:

We are looking for a Software Engineer Intern.

Requirements:
• Python
• React.js
• SQL
• REST APIs
• Git
• Docker`}
            rows={14}
            className="w-full resize-y rounded-xl border border-gray-200 p-4 text-sm text-gray-900 outline-none transition focus:border-black focus:ring-2 focus:ring-gray-100"
          />

          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              {jobDescription.length} characters
            </p>

            <button
              onClick={handleAnalyze}
              disabled={
                loading || !jobDescription.trim()
              }
              className="rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Analyzing..."
                : "Analyze Job"}
            </button>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="mt-6 space-y-6">

            {/* Summary */}
            <section className="rounded-2xl border bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-blue-600">
                AI Analysis
              </p>

              <h2 className="mt-1 text-2xl font-bold text-gray-900">
                {result.jobTitle || "Job Analysis"}
              </h2>

              {result.summary && (
                <p className="mt-3 text-sm leading-6 text-gray-600">
                  {result.summary}
                </p>
              )}
            </section>

            {/* Skills */}
            <div className="grid gap-6 lg:grid-cols-2">

              <ResultSection
                title="Required Skills"
                items={result.requiredSkills}
              />

              <ResultSection
                title="Preferred Skills"
                items={result.preferredSkills}
              />

              <ResultSection
                title="Important Keywords"
                items={result.keywords}
              />

              <ResultSection
                title="Preparation Topics"
                items={result.preparationTopics}
              />

            </div>

            {/* Experience + Education */}
            <div className="grid gap-6 md:grid-cols-2">

              <InfoCard
                title="Experience"
                value={result.experience}
              />

              <InfoCard
                title="Education"
                value={result.education}
              />

            </div>

            {/* Responsibilities */}
            <section className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">
                Responsibilities
              </h2>

              {result.responsibilities &&
                result.responsibilities.length > 0 ? (
                <ul className="mt-4 space-y-3">
                  {result.responsibilities.map(
                    (item, index) => (
                      <li
                        key={index}
                        className="flex gap-3 text-sm text-gray-600"
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

          </div>
        )}

        {/* Empty State */}
        {!result && !loading && !error && (
          <section className="mt-6 rounded-2xl border border-dashed bg-white p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-2xl">
              ✨
            </div>

            <h2 className="mt-4 text-lg font-semibold text-gray-900">
              Ready to analyze
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
              Paste a job description above and let AI
              identify the skills, keywords, requirements,
              and preparation topics.
            </p>
          </section>
        )}

        {/* Loading */}
        {loading && (
          <section className="mt-6 rounded-2xl border bg-white p-8 text-center shadow-sm">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black" />

            <p className="mt-4 text-sm font-medium text-gray-700">
              Analyzing job description...
            </p>

            <p className="mt-1 text-xs text-gray-400">
              This may take a few seconds.
            </p>
          </section>
        )}

      </div>
    </main>
  );
}

function ResultSection({
  title,
  items,
}: {
  title: string;
  items?: string[];
}) {
  return (
    <section className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">
        {title}
      </h2>

      {items && items.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {items.map((item, index) => (
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
  value?: string;
}) {
  return (
    <section className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">
        {title}
      </h2>

      <p className="mt-4 text-sm leading-6 text-gray-600">
        {value || "Not specified"}
      </p>
    </section>
  );
}