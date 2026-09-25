
"use client";

import { useCallback, useEffect, useState } from "react";
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
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
      }}
      className="rounded-xl border bg-white p-4 shadow-sm"
    >
      <div
        {...attributes}
        {...listeners}
        className="mb-3 cursor-grab touch-none select-none
                   rounded-md bg-gray-100 px-3 py-2
                   text-center text-xs text-gray-600
                   active:cursor-grabbing"
      >
        ⠿ Drag to change status
      </div>

      <h3 className="font-semibold text-gray-900">
        {application.company}
      </h3>

      <p className="mt-1 text-sm text-gray-600">
        {application.jobTitle}
      </p>

      {application.location && (
        <p className="mt-3 text-xs text-gray-500">
          📍 {application.location}
        </p>
      )}

      {application.appliedDate && (
        <p className="mt-2 text-xs text-gray-500">
          Applied: {application.appliedDate}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between border-t pt-3">
        <Link
          href={`/applications/${application.id}/edit`}
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          Edit
        </Link>

        {application.jobUrl && (
          <a
            href={application.jobUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-600 hover:underline"
          >
            View Job ↗
          </a>
        )}
      </div>
    </div>
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
      className={`min-h-80 w-64 shrink-0 rounded-xl p-3
        ${isOver ? "bg-blue-100 ring-2 ring-blue-400" : "bg-gray-100"}`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold">
          {labels[status]}
        </h2>

        <span className="rounded-full bg-white px-2 py-1 text-xs">
          {applications.length}
        </span>
      </div>

      <div className="space-y-3">
        {applications.map((application) => (
          <ApplicationCard
            key={application.id}
            application={application}
            disabled={saving}
          />
        ))}

        {applications.length === 0 && (
          <div className="rounded-lg border border-dashed
                          border-gray-300 p-5 text-center
                          text-xs text-gray-500">
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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
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
        err instanceof Error ? err.message : "Something went wrong"
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

    if (!over || saving) return;

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

    // Move the card immediately.
    setApplications((current) =>
      current.map((item) =>
        item.id === applicationId
          ? { ...item, status: newStatus }
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
        throw new Error("Could not save the new status");
      }

      const updated: Application = await response.json();

      setApplications((current) =>
        current.map((item) =>
          item.id === applicationId ? updated : item
        )
      );
    } catch (err) {
      // Restore the card if saving fails.
      setApplications(previousApplications);

      setError(
        err instanceof Error ? err.message : "Status update failed"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="p-8">
        Loading your applications...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mb-8 flex flex-wrap items-center
                      justify-between gap-4">
        <div>
          <Link
            href="/dashboard"
            className="text-sm text-gray-500 hover:underline"
          >
            ← Dashboard
          </Link>

          <h1 className="mt-3 text-3xl font-bold">
            Application Board
          </h1>

          <p className="mt-2 text-gray-500">
            Drag applications between stages to update their status.
          </p>
        </div>

        <Link
          href="/applications/new"
          className="rounded-lg bg-black px-5 py-3
                     text-sm font-medium text-white"
        >
          + Add Application
        </Link>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-5 rounded-lg bg-red-50 p-4 text-red-700"
        >
          {error}
        </div>
      )}

      {saving && (
        <p className="mb-4 text-sm text-blue-600">
          Saving status...
        </p>
      )}

      <DndContext
        sensors={sensors}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-8">
          {statuses.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              saving={saving}
              applications={applications.filter(
                (application) => application.status === status
              )}
            />
          ))}
        </div>
      </DndContext>
    </main>
  );
}