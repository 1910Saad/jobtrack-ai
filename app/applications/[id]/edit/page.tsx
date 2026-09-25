"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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
        const response = await fetch(`/api/applications/${id}`);

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
        setError("Failed to load application");
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update application");
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
      <div className="p-8">
        <p>Loading application...</p>
      </div>
    );
  }

  if (error && !formData.company) {
    return (
      <div className="p-8">
        <p className="text-red-500">{error}</p>

        <button
          onClick={() => router.push("/dashboard")}
          className="mt-4 rounded bg-black px-4 py-2 text-white"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-white text-black">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <button
            onClick={() => router.push("/dashboard")}
            className="mb-4 text-sm text-gray-600 hover:text-black"
          >
            ← Back to Dashboard
          </button>

          <h1 className="text-3xl font-bold">
            Edit Application
          </h1>

          <p className="mt-2 text-gray-500">
            Update your job application details.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-xl border p-6 shadow-sm"
        >
          <div>
            <label className="mb-2 block text-sm font-medium">
              Company *
            </label>

            <input
              name="company"
              value={formData.company}
              onChange={handleChange}
              required
              className="w-full rounded-md border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Job Title *
            </label>

            <input
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleChange}
              required
              className="w-full rounded-md border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Location
            </label>

            <input
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full rounded-md border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Job URL
            </label>

            <input
              name="jobUrl"
              type="url"
              value={formData.jobUrl}
              onChange={handleChange}
              className="w-full rounded-md border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Salary
            </label>

            <input
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              className="w-full rounded-md border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Status
            </label>

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-md border px-3 py-2"
            >
              <option value="Wishlist">Wishlist</option>
              <option value="Applied">Applied</option>
              <option value="OA">Online Assessment</option>
              <option value="Interview">Interview</option>
              <option value="HR">HR</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Applied Date
            </label>

            <input
              name="appliedDate"
              type="date"
              value={formData.appliedDate}
              onChange={handleChange}
              className="w-full rounded-md border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Notes
            </label>

            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={5}
              className="w-full rounded-md border px-3 py-2"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="rounded-md border px-5 py-2"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-black px-5 py-2 text-white disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}