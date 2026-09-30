"use client";

import { useState } from "react";
import Link from "next/link";

export default function ResumeMatcherPage() {
  const [resume, setResume] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setResume(file);
  }

  async function handleAnalyze() {
    if (!resume || !jobDescription.trim()) {
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("resume", resume);
      formData.append("jobDescription", jobDescription);

      // API will be implemented in the next step.
      const response = await fetch("/api/resume-matcher", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to analyze resume"
        );
      }

      console.log(data);
    } catch (error) {
      console.error(error);
      alert(
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
            className="text-sm font-medium text-gray-500 hover:text-gray-900"
          >
            ← Dashboard
          </Link>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900">
            Resume Matcher
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Compare your resume with a job description and identify
            matching and missing skills.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">

          {/* Resume Upload */}
          <section className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Your Resume
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Upload your latest resume.
            </p>

            <label className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center transition hover:border-blue-400 hover:bg-blue-50">
              <div className="text-3xl">
                📄
              </div>

              <p className="mt-3 text-sm font-semibold text-gray-700">
                {resume
                  ? resume.name
                  : "Choose your resume"}
              </p>

              <p className="mt-1 text-xs text-gray-400">
                PDF or DOCX
              </p>

              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {resume && (
              <div className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
                ✓ Resume selected
              </div>
            )}
          </section>

          {/* Job Description */}
          <section className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Job Description
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Paste the job description you want to match against.
            </p>

            <textarea
              value={jobDescription}
              onChange={(event) =>
                setJobDescription(event.target.value)
              }
              placeholder="Paste the complete job description here..."
              rows={12}
              className="mt-5 w-full resize-y rounded-xl border border-gray-200 p-4 text-sm text-gray-900 outline-none transition focus:border-black focus:ring-2 focus:ring-gray-100"
            />

            <p className="mt-2 text-right text-xs text-gray-400">
              {jobDescription.length} characters
            </p>
          </section>
        </div>

        {/* Analyze */}
        <section className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">
                Resume Compatibility
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                AI will compare your resume against the job requirements.
              </p>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={
                loading ||
                !resume ||
                !jobDescription.trim()
              }
              className="rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Analyzing..."
                : "Analyze Match"}
            </button>
          </div>
        </section>

        {/* Planned Results */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <ResultCard
            title="Match Score"
            value="—"
          />

          <ResultCard
            title="Matching Skills"
            value="—"
          />

          <ResultCard
            title="Missing Skills"
            value="—"
          />

          <ResultCard
            title="Recommendations"
            value="—"
          />

        </section>
      </div>
    </main>
  );
}

function ResultCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">
        {title}
      </p>

      <p className="mt-3 text-2xl font-bold text-gray-900">
        {value}
      </p>
    </div>
  );
}