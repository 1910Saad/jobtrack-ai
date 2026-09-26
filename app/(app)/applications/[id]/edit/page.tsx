"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const statuses = [
  "Wishlist",
  "Applied",
  "OA",
  "Interview",
  "HR",
  "Offer",
  "Rejected",
];

export default function EditApplicationPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    company: "",
    jobTitle: "",
    location: "",
    jobUrl: "",
    salary: "",
    status: "Wishlist",
    appliedDate: "",
    notes: "",
  });

  useEffect(() => {
    async function fetchApplication() {
      try {
        const response = await fetch(`/api/applications/${id}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Application not found");
        }

        const data = await response.json();

        setFormData({
          company: data.company || "",
          jobTitle: data.jobTitle || "",
          location: data.location || "",
          jobUrl: data.jobUrl || "",
          salary: data.salary || "",
          status: data.status || "Wishlist",
          appliedDate: data.appliedDate
            ? data.appliedDate.split("T")[0]
            : "",
          notes: data.notes || "",
        });
      } catch (error) {
        console.error(error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load application"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchApplication();
  }, [id]);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    setFormData((current) => ({
      ...current,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,

          // Prevent empty string from being sent
          // to a PostgreSQL DATE column.
          appliedDate: formData.appliedDate || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to update application"
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
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-5 md:p-8">
        <div className="mx-auto max-w-3xl animate-pulse">
          <div className="h-4 w-32 rounded bg-gray-200" />
          <div className="mt-5 h-9 w-64 rounded bg-gray-200" />
          <div className="mt-2 h-4 w-96 max-w-full rounded bg-gray-200" />

          <div className="mt-8 h-[650px] rounded-2xl bg-gray-200" />
        </div>
      </main>
    );
  }

  if (error && !formData.company) {
    return (
      <main className="min-h-screen bg-gray-50 p-5 md:p-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
              !
            </div>

            <h1 className="mt-4 text-lg font-semibold text-gray-900">
              Unable to load application
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              {error}
            </p>

            <button
              onClick={() => router.push("/dashboard")}
              className="mt-6 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-5 md:p-8">
      <div className="mx-auto max-w-3xl">

        {/* Header */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="text-sm font-medium text-gray-500 transition hover:text-gray-900"
          >
            ← Back to Dashboard
          </button>

          <div className="mt-5">
            <p className="text-sm font-medium text-blue-600">
              Job Tracker
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">
              Edit Application
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Update the details and current stage of your application.
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
              Could not save changes
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
                Update the company and position details.
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
                  value={formData.company}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                  value={formData.jobTitle}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                  value={formData.location}
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
                  value={formData.salary}
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
                Update the current stage and application information.
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
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
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
                  name="appliedDate"
                  type="date"
                  value={formData.appliedDate}
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
                  name="jobUrl"
                  type="url"
                  value={formData.jobUrl}
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
                Keep useful information about this application.
              </p>
            </div>

            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Recruiter details, referral, interview notes, preparation notes..."
              rows={5}
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </section>

          {/* Footer */}
          <div className="flex flex-col-reverse gap-3 border-t bg-gray-50 p-6 sm:flex-row sm:items-center sm:justify-end md:px-8">

            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-black px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>

        <p className="mt-4 text-center text-xs text-gray-400">
          Changes are saved to your JobTrack AI account.
        </p>
      </div>
    </main>
  );
}