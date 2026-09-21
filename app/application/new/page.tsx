"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error("Failed to create application");
      }

      router.push("/applications");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-2 text-3xl font-bold">
          Add Application
        </h1>

        <p className="mb-8 text-gray-600">
          Track a new job or internship application.
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-xl bg-white p-6 shadow"
        >
          <div>
            <label className="mb-2 block font-medium">
              Company *
            </label>

            <input
              name="company"
              value={form.company}
              onChange={handleChange}
              placeholder="e.g. Google"
              required
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Job Title *
            </label>

            <input
              name="jobTitle"
              value={form.jobTitle}
              onChange={handleChange}
              placeholder="e.g. Software Engineer"
              required
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Location
            </label>

            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="e.g. Bengaluru / Remote"
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Job URL
            </label>

            <input
              type="url"
              name="jobUrl"
              value={form.jobUrl}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Salary
            </label>

            <input
              name="salary"
              value={form.salary}
              onChange={handleChange}
              placeholder="e.g. ₹6 LPA"
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Status
            </label>

            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full rounded-lg border p-3"
            >
              <option>Wishlist</option>
              <option>Applied</option>
              <option>OA</option>
              <option>Interview</option>
              <option>HR</option>
              <option>Offer</option>
              <option>Rejected</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Applied Date
            </label>

            <input
              type="date"
              name="appliedDate"
              value={form.appliedDate}
              onChange={handleChange}
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Notes
            </label>

            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Add notes..."
              rows={4}
              className="w-full rounded-lg border p-3"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-black px-4 py-3 font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Add Application"}
          </button>
        </form>
      </div>
    </div>
  );
}