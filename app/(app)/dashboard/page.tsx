import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { applications } from "@/db/schema";
import { eq } from "drizzle-orm";

const statusLabels: Record<string, string> = {
  Wishlist: "Wishlist",
  Applied: "Applied",
  OA: "Online Assessment",
  Interview: "Interview",
  HR: "HR",
  Offer: "Offer",
  Rejected: "Rejected",
};

const pipelineStatuses = [
  "Applied",
  "OA",
  "Interview",
  "HR",
  "Offer",
];

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const userApplications = await db
    .select()
    .from(applications)
    .where(eq(applications.userId, userId));

  const totalApplications = userApplications.length;

  const appliedCount = userApplications.filter(
    (application) => application.status === "Applied"
  ).length;

  const oaCount = userApplications.filter(
    (application) => application.status === "OA"
  ).length;

  const interviewCount = userApplications.filter(
    (application) =>
      application.status === "Interview" ||
      application.status === "HR"
  ).length;

  const offerCount = userApplications.filter(
    (application) => application.status === "Offer"
  ).length;

  const rejectedCount = userApplications.filter(
    (application) => application.status === "Rejected"
  ).length;

  const recentApplications = [...userApplications]
    .sort((a, b) => {
      const dateA = a.createdAt
        ? new Date(a.createdAt).getTime()
        : 0;

      const dateB = b.createdAt
        ? new Date(b.createdAt).getTime()
        : 0;

      return dateB - dateA;
    })
    .slice(0, 6);

  return (
    <div className="p-5 md:p-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">
              Job Search Dashboard
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">
              Your job search overview
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Keep track of every application and move closer to your next opportunity.
            </p>
          </div>

          <Link
            href="/analytics"
            className="rounded-lg border bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            📊 Analytics
          </Link>

          <Link
            href="/applications/new"
            className="inline-flex items-center justify-center rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800"
          >
            + Add Application
          </Link>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            title="Applications"
            value={totalApplications}
            description="Total applications"
          />

          <StatCard
            title="Online Assessments"
            value={oaCount}
            description="Assessments in progress"
          />

          <StatCard
            title="Interviews"
            value={interviewCount}
            description="Interview stages"
          />

          <StatCard
            title="Offers"
            value={offerCount}
            description="Offers received"
          />

        </div>

        {/* Main Grid */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">

          {/* Pipeline */}
          <section className="rounded-xl border bg-white p-6 shadow-sm lg:col-span-2">

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Application Pipeline
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Track where your applications currently stand.
                </p>
              </div>

              <Link
                href="/applications"
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                Open board →
              </Link>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-5">
              {pipelineStatuses.map((status) => {
                const count = userApplications.filter(
                  (application) =>
                    application.status === status
                ).length;

                return (
                  <div
                    key={status}
                    className="rounded-xl border bg-gray-50 p-4"
                  >
                    <p className="text-xs font-medium text-gray-500">
                      {statusLabels[status]}
                    </p>

                    <p className="mt-2 text-2xl font-bold text-gray-900">
                      {count}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Progress */}
            <div className="mt-6">
              <div className="mb-2 flex justify-between text-xs text-gray-500">
                <span>Applications → Offers</span>

                <span>
                  {totalApplications > 0
                    ? `${Math.round(
                      (offerCount / totalApplications) * 100
                    )}%`
                    : "0%"}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all"
                  style={{
                    width:
                      totalApplications > 0
                        ? `${Math.min(
                          (offerCount / totalApplications) * 100,
                          100
                        )}%`
                        : "0%",
                  }}
                />
              </div>
            </div>
          </section>

          {/* Quick Summary */}
          <section className="rounded-xl border bg-white p-6 shadow-sm">

            <h2 className="text-lg font-semibold text-gray-900">
              Quick Summary
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Your current job search activity.
            </p>

            <div className="mt-6 space-y-4">

              <SummaryRow
                label="Applied"
                value={appliedCount}
              />

              <SummaryRow
                label="Online Assessment"
                value={oaCount}
              />

              <SummaryRow
                label="Interviews"
                value={interviewCount}
              />

              <SummaryRow
                label="Offers"
                value={offerCount}
              />

              <SummaryRow
                label="Rejected"
                value={rejectedCount}
              />

            </div>

            <Link
              href="/applications"
              className="mt-6 block rounded-lg border px-4 py-2.5 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              View all applications
            </Link>
          </section>
        </div>

        {/* Recent Applications */}
        <section className="mt-6 rounded-xl border bg-white shadow-sm">

          <div className="flex flex-col gap-3 border-b p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Applications
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Your latest job applications.
              </p>
            </div>

            <Link
              href="/applications"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              View all →
            </Link>
          </div>

          {recentApplications.length === 0 ? (
            <div className="px-6 py-16 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-xl">
                +
              </div>

              <h3 className="mt-4 font-semibold text-gray-900">
                No applications yet
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
                Start tracking your job search by adding your first application.
              </p>

              <Link
                href="/application/new"
                className="mt-5 inline-flex rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
              >
                Add your first application
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">

                <thead>
                  <tr className="border-b bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                    <th className="px-6 py-3 font-medium">
                      Company
                    </th>

                    <th className="px-6 py-3 font-medium">
                      Position
                    </th>

                    <th className="px-6 py-3 font-medium">
                      Location
                    </th>

                    <th className="px-6 py-3 font-medium">
                      Status
                    </th>

                    <th className="px-6 py-3 font-medium">
                      Applied
                    </th>

                    <th className="px-6 py-3 font-medium">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {recentApplications.map((application) => (
                    <tr
                      key={application.id}
                      className="border-b last:border-0 hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900">
                          {application.company}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-700">
                        {application.jobTitle}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-500">
                        {application.location || "—"}
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge
                          status={application.status}
                        />
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-500">
                        {application.appliedDate || "—"}
                      </td>

                      <td className="px-6 py-4">
                        <Link
                          href={`/applications/${application.id}/edit`}
                          className="text-sm font-medium text-blue-600 hover:underline"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
}: {
  title: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">
        {title}
      </p>

      <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-gray-400">
        {description}
      </p>
    </div>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">
        {label}
      </span>

      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
        {value}
      </span>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const styles: Record<string, string> = {
    Wishlist: "bg-gray-100 text-gray-700",
    Applied: "bg-blue-50 text-blue-700",
    OA: "bg-purple-50 text-purple-700",
    Interview: "bg-yellow-50 text-yellow-700",
    HR: "bg-orange-50 text-orange-700",
    Offer: "bg-green-50 text-green-700",
    Rejected: "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status] || "bg-gray-100 text-gray-700"
        }`}
    >
      {statusLabels[status] || status}
    </span>
  );
}