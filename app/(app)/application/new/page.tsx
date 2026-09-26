"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const statuses = [
  "Wishlist",
  "Applied",
  "OA",
  "Interview",
  "HR",
  "Offer",
  "Rejected",
];

export default function NewApplicationPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    company: "",
    jobTitle: "",
    location: "",
    jobUrl: "",
    salary: "",
    status: "Wishlist",
    appliedDate: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    setForm((current) => ({
      ...current,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,

          // Important:
          // Never send an empty string to PostgreSQL DATE columns.
          appliedDate: form.appliedDate || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to create application"
        );
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error(error);

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
      <div className="mx-auto max-w-3xl">

        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-gray-500 transition hover:text-gray-900"
          >
            ← Back to Dashboard
          </Link>

          <div className="mt-5">
            <p className="text-sm font-medium text-blue-600">
              Job Tracker
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">
              Add Application
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Keep all the important details about your job application in one place.
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <p className="font-semibold">
              Could not save application
            </p>

            <p className="mt-1">
              {error}
            </p>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-2xl border bg-white shadow-sm"
        >

          {/* Basic Information */}
          <section className="border-b p-6 md:p-8">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Basic Information
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Tell us about the company and position.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">

              {/* Company */}
              <div>
                <label
                  htmlFor="company"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Company <span className="text-red-500">*</span>
                </label>

                <input
                  id="company"
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  placeholder="e.g. Google"
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Job Title */}
              <div>
                <label
                  htmlFor="jobTitle"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Job Title <span className="text-red-500">*</span>
                </label>

                <input
                  id="jobTitle"
                  name="jobTitle"
                  value={form.jobTitle}
                  onChange={handleChange}
                  placeholder="e.g. Software Engineer"
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Location */}
              <div>
                <label
                  htmlFor="location"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Location
                </label>

                <input
                  id="location"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Mumbai / Bengaluru / Remote"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Salary */}
              <div>
                <label
                  htmlFor="salary"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Salary
                </label>

                <input
                  id="salary"
                  name="salary"
                  value={form.salary}
                  onChange={handleChange}
                  placeholder="e.g. ₹8 LPA"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </section>

          {/* Application Details */}
          <section className="border-b p-6 md:p-8">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Application Details
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Track the current stage of your application.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">

              {/* Status */}
              <div>
                <label
                  htmlFor="status"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Current Status
                </label>

                <select
                  id="status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  {statuses.map((status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {status === "OA"
                        ? "Online Assessment"
                        : status}
                    </option>
                  ))}
                </select>
              </div>

              {/* Applied Date */}
              <div>
                <label
                  htmlFor="appliedDate"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Applied Date
                </label>

                <input
                  id="appliedDate"
                  type="date"
                  name="appliedDate"
                  value={form.appliedDate}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <p className="mt-1.5 text-xs text-gray-400">
                  Leave empty if you haven't applied yet.
                </p>
              </div>

              {/* Job URL */}
              <div className="md:col-span-2">
                <label
                  htmlFor="jobUrl"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Job URL
                </label>

                <input
                  id="jobUrl"
                  type="url"
                  name="jobUrl"
                  value={form.jobUrl}
                  onChange={handleChange}
                  placeholder="https://company.com/jobs/..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </section>

          {/* Notes */}
          <section className="p-6 md:p-8">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Notes
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Add anything you want to remember about this application.
              </p>
            </div>

            <textarea
              id="notes"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="e.g. Referral from a friend, recruiter contact, interview preparation notes..."
              rows={5}
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </section>

          {/* Footer */}
          <div className="flex flex-col-reverse gap-3 border-t bg-gray-50 p-6 sm:flex-row sm:items-center sm:justify-end md:px-8">

            <Link
              href="/dashboard"
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-black px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : "Add Application"}
            </button>
          </div>
        </form>

        <p className="mt-4 text-center text-xs text-gray-400">
          Your application data is private to your account.
        </p>
      </div>
    </main>
  );
}