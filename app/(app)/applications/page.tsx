"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  TouchSensor,
  useDroppable,
  useSensor,
  useSensors,
  useDraggable,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

type Application = {
  id: number;
  company: string;
  jobTitle: string;
  location: string | null;
  jobUrl: string | null;
  salary: string | null;
  status: string;
  appliedDate: string | null;
  notes: string | null;
};

const statuses = [
  "Wishlist",
  "Applied",
  "OA",
  "Interview",
  "HR",
  "Offer",
  "Rejected",
] as const;

const labels: Record<string, string> = {
  Wishlist: "Wishlist",
  Applied: "Applied",
  OA: "Online Assessment",
  Interview: "Interview",
  HR: "HR",
  Offer: "Offer",
  Rejected: "Rejected",
};

const statusStyles: Record<string, string> = {
  Wishlist: "bg-gray-100 text-gray-700",
  Applied: "bg-blue-50 text-blue-700",
  OA: "bg-purple-50 text-purple-700",
  Interview: "bg-yellow-50 text-yellow-700",
  HR: "bg-orange-50 text-orange-700",
  Offer: "bg-green-50 text-green-700",
  Rejected: "bg-red-50 text-red-700",
};

function ApplicationCard({
  application,
  disabled,
}: {
  application: Application;
  disabled: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `application-${application.id}`,
    disabled,
  });

  return (
    <article
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.45 : 1,
      }}
      className={`group rounded-xl border bg-white p-4 shadow-sm transition ${isDragging
        ? "rotate-1 shadow-lg"
        : "hover:-translate-y-0.5 hover:shadow-md"
        }`}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="mb-4 flex cursor-grab touch-none select-none items-center justify-center gap-2 rounded-lg border border-dashed bg-gray-50 px-3 py-2 text-xs text-gray-400 transition hover:bg-gray-100 active:cursor-grabbing"
      >
        <span className="text-sm">⋮⋮</span>
        Drag to change status
      </div>

      {/* Company */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-gray-900">
            {application.company}
          </h3>

          <p className="mt-1 line-clamp-2 text-sm text-gray-600">
            {application.jobTitle}
          </p>
        </div>

        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusStyles[application.status] ||
            "bg-gray-100 text-gray-700"
            }`}
        >
          {application.status}
        </span>
      </div>

      {/* Details */}
      <div className="mt-4 space-y-2">
        {application.location && (
          <p className="flex items-center gap-2 text-xs text-gray-500">
            <span>📍</span>
            {application.location}
          </p>
        )}

        {application.salary && (
          <p className="flex items-center gap-2 text-xs text-gray-500">
            <span>💰</span>
            {application.salary}
          </p>
        )}

        {application.appliedDate && (
          <p className="flex items-center gap-2 text-xs text-gray-500">
            <span>📅</span>
            Applied {application.appliedDate}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center justify-between border-t pt-3">
        <Link
          href={`/applications/${application.id}/edit`}
          className="rounded-md px-2 py-1 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
        >
          Edit
        </Link>

        {application.jobUrl ? (
          <a
            href={application.jobUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md px-2 py-1 text-sm text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
          >
            View Job ↗
          </a>
        ) : (
          <span className="text-xs text-gray-300">
            No job link
          </span>
        )}
      </div>
    </article>
  );
}

function KanbanColumn({
  status,
  applications,
  saving,
}: {
  status: string;
  applications: Application[];
  saving: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <section
      ref={setNodeRef}
      className={`flex min-h-[520px] w-[290px] shrink-0 flex-col rounded-2xl border p-3 transition ${isOver
        ? "border-blue-300 bg-blue-50 ring-2 ring-blue-200"
        : "border-gray-200 bg-gray-100/80"
        }`}
    >
      {/* Column Header */}
      <div className="mb-4 flex items-center justify-between px-1">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">
            {labels[status]}
          </h2>

          <p className="mt-0.5 text-[11px] text-gray-400">
            {applications.length === 1
              ? "1 application"
              : `${applications.length} applications`}
          </p>
        </div>

        <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-white px-2 text-xs font-semibold text-gray-600 shadow-sm">
          {applications.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex-1 space-y-3">
        {applications.map((application) => (
          <ApplicationCard
            key={application.id}
            application={application}
            disabled={saving}
          />
        ))}

        {applications.length === 0 && (
          <div className="flex min-h-28 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white/50 p-5 text-center text-xs text-gray-400">
            Drop applications here
          </div>
        )}
      </div>
    </section>
  );
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    })
  );

  const fetchApplications = useCallback(async () => {
    try {
      setError("");

      const response = await fetch("/api/applications", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load applications");
      }

      const data: Application[] = await response.json();

      setApplications(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || saving) {
      return;
    }

    const applicationId = Number(
      String(active.id).replace("application-", "")
    );

    const newStatus = String(over.id);

    if (!statuses.some((status) => status === newStatus)) {
      return;
    }

    const application = applications.find(
      (item) => item.id === applicationId
    );

    if (!application || application.status === newStatus) {
      return;
    }

    const previousApplications = [...applications];

    // Optimistic update
    setApplications((current) =>
      current.map((item) =>
        item.id === applicationId
          ? {
            ...item,
            status: newStatus,
          }
          : item
      )
    );

    setSaving(true);
    setError("");

    try {
      const response = await fetch(
        `/api/applications/${applicationId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...application,
            status: newStatus,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Could not save the new status"
        );
      }

      const updated: Application =
        await response.json();

      setApplications((current) =>
        current.map((item) =>
          item.id === applicationId
            ? updated
            : item
        )
      );
    } catch (err) {
      // Rollback
      setApplications(previousApplications);

      setError(
        err instanceof Error
          ? err.message
          : "Status update failed"
      );
    } finally {
      setSaving(false);
    }
  }

  const locations = useMemo(() => {
    const uniqueLocations = applications
      .map((application) => application.location?.trim())
      .filter(
        (location): location is string =>
          Boolean(location)
      );

    return Array.from(new Set(uniqueLocations)).sort();
  }, [applications]);

  const filteredApplications = useMemo(() => {
    const query = search.trim().toLowerCase();

    return applications.filter((application) => {
      const matchesSearch =
        !query ||
        application.company
          .toLowerCase()
          .includes(query) ||
        application.jobTitle
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        application.status === statusFilter;

      const matchesLocation =
        locationFilter === "All" ||
        application.location === locationFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesLocation
      );
    });
  }, [
    applications,
    search,
    statusFilter,
    locationFilter,
  ]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-6 md:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse">
            <div className="h-8 w-64 rounded bg-gray-200" />
            <div className="mt-3 h-4 w-96 max-w-full rounded bg-gray-200" />

            <div className="mt-8 flex gap-4 overflow-hidden">
              {statuses.slice(0, 4).map((status) => (
                <div
                  key={status}
                  className="h-[500px] w-[290px] shrink-0 rounded-2xl bg-gray-200"
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-5 md:p-8">
      <div className="mx-auto max-w-[1800px]">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-gray-500 transition hover:text-gray-900"
            >
              ← Dashboard
            </Link>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
              Application Board
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Drag applications between stages to update their status.
            </p>
          </div>

          <Link
            href="/application/new"
            className="inline-flex items-center justify-center rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800"
          >
            + Add Application
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="mb-5 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <span>{error}</span>

            <button
              onClick={() => setError("")}
              className="font-semibold hover:text-red-900"
            >
              ×
            </button>
          </div>
        )}

        {/* Saving */}
        {saving && (
          <div className="mb-4 flex items-center gap-2 text-sm text-blue-600">
            <span className="h-2 w-2 animate-pulse rounded-full bg-blue-600" />
            Saving status...
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 rounded-2xl border bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-[1fr_190px_190px_auto]">

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search company or job title..."
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pl-10 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                🔍
              </span>
            </div>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="All">All Statuses</option>

              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status === "OA"
                    ? "Online Assessment"
                    : status}
                </option>
              ))}
            </select>

            {/* Location */}
            <select
              value={locationFilter}
              onChange={(e) =>
                setLocationFilter(e.target.value)
              }
              className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="All">All Locations</option>

              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>

            {/* Clear */}
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("All");
                setLocationFilter("All");
              }}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Clear
            </button>
          </div>

          <div className="mt-3 text-xs text-gray-500">
            Showing{" "}
            <span className="font-semibold text-gray-700">
              {filteredApplications.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-700">
              {applications.length}
            </span>{" "}
            applications
          </div>
        </div>

        {/* Board */}
        <DndContext
          sensors={sensors}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 overflow-x-auto pb-6">
            {statuses.map((status) => (
              <KanbanColumn
                key={status}
                status={status}
                saving={saving}
                applications={filteredApplications.filter(
                  (application) =>
                    application.status === status
                )}
              />
            ))}
          </div>
        </DndContext>

        {/* Footer Hint */}
        <div className="mt-2 rounded-xl border border-dashed bg-white px-5 py-4 text-center text-xs text-gray-400">
          💡 Tip: Drag an application card to another column to update its status.
        </div>
      </div>
    </main>
  );
}