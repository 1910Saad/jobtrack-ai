import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { applications } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import AnalyticsCharts from "./AnalyticsCharts";

const statuses = [
  "Wishlist",
  "Applied",
  "OA",
  "Interview",
  "HR",
  "Offer",
  "Rejected",
];

const statusStyles: Record<string, string> = {
  Wishlist: "bg-gray-400",
  Applied: "bg-blue-500",
  OA: "bg-purple-500",
  Interview: "bg-yellow-500",
  HR: "bg-orange-500",
  Offer: "bg-green-500",
  Rejected: "bg-red-500",
};

export default async function AnalyticsPage() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const userApplications = await db
    .select()
    .from(applications)
    .where(eq(applications.userId, userId));

  const total = userApplications.length;

  const getCount = (status: string) =>
    userApplications.filter(
      (application) => application.status === status
    ).length;

  const applied = getCount("Applied");
  const oa = getCount("OA");
  const interview = getCount("Interview");
  const hr = getCount("HR");
  const offers = getCount("Offer");
  const rejected = getCount("Rejected");

  const activeApplications =
    total - offers - rejected;

  const interviewRate =
    total > 0
      ? Math.round(
        ((interview + hr + offers) / total) * 100
      )
      : 0;

  const offerRate =
    total > 0
      ? Math.round((offers / total) * 100)
      : 0;

  const rejectionRate =
    total > 0
      ? Math.round((rejected / total) * 100)
      : 0;

  return (
    <main className="min-h-screen bg-gray-50 p-5 md:p-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-gray-500 hover:text-gray-900"
          >
            ← Dashboard
          </Link>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900">
            Analytics
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Understand your job search activity and application pipeline.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            title="Total Applications"
            value={total}
            description="All tracked applications"
          />

          <StatCard
            title="Active Applications"
            value={activeApplications}
            description="Not offered or rejected"
          />

          <StatCard
            title="Interview Rate"
            value={`${interviewRate}%`}
            description="Reached interview or later"
          />

          <StatCard
            title="Offer Rate"
            value={`${offerRate}%`}
            description="Applications resulting in offers"
          />

        </div>

        {/* Charts */}
        <div className="mt-6">
          <AnalyticsCharts
            data={statuses.map((status) => ({
              status,
              count: getCount(status),
            }))}
          />
        </div>

        {/* Main Analytics */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">

          {/* Status Distribution */}
          <section className="rounded-2xl border bg-white p-6 shadow-sm">

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Application Distribution
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Applications by current status.
              </p>
            </div>

            <div className="mt-6 space-y-5">

              {statuses.map((status) => {
                const count = getCount(status);

                const percentage =
                  total > 0
                    ? Math.round((count / total) * 100)
                    : 0;

                return (
                  <div key={status}>

                    <div className="mb-2 flex items-center justify-between">

                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${statusStyles[status]
                            }`}
                        />

                        <span className="text-sm font-medium text-gray-700">
                          {status}
                        </span>
                      </div>

                      <span className="text-sm text-gray-500">
                        {count}
                      </span>

                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={`h-full rounded-full ${statusStyles[status]
                          }`}
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>

                  </div>
                );
              })}

            </div>
          </section>

          {/* Conversion */}
          <section className="rounded-2xl border bg-white p-6 shadow-sm">

            <h2 className="text-lg font-semibold text-gray-900">
              Conversion Overview
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              How applications are progressing through your pipeline.
            </p>

            <div className="mt-6 space-y-4">

              <ConversionRow
                label="Applied"
                value={applied}
                total={total}
              />

              <ConversionRow
                label="Online Assessment"
                value={oa}
                total={total}
              />

              <ConversionRow
                label="Interview"
                value={interview}
                total={total}
              />

              <ConversionRow
                label="HR"
                value={hr}
                total={total}
              />

              <ConversionRow
                label="Offers"
                value={offers}
                total={total}
              />

              <ConversionRow
                label="Rejected"
                value={rejected}
                total={total}
              />

            </div>

          </section>
        </div>

        {/* Search Performance */}
        <section className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">

          <h2 className="text-lg font-semibold text-gray-900">
            Job Search Performance
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            A quick overview of your current application funnel.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">

            <PerformanceCard
              title="Interview Conversion"
              value={`${interviewRate}%`}
              description="Applications reaching interviews or beyond"
            />

            <PerformanceCard
              title="Offer Conversion"
              value={`${offerRate}%`}
              description="Applications resulting in offers"
            />

            <PerformanceCard
              title="Rejection Rate"
              value={`${rejectionRate}%`}
              description="Applications marked as rejected"
            />

          </div>

        </section>

        {/* Empty State */}
        {total === 0 && (
          <section className="mt-6 rounded-2xl border border-dashed bg-white p-12 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-xl">
              📊
            </div>

            <h2 className="mt-4 font-semibold text-gray-900">
              No analytics yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
              Add some job applications to start seeing your job search
              analytics.
            </p>

            <Link
              href="/application/new"
              className="mt-5 inline-flex rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
            >
              Add Application
            </Link>

          </section>
        )}

      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
  description,
}: {
  title: string;
  value: number | string;
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

function ConversionRow({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  const percentage =
    total > 0
      ? Math.round((value / total) * 100)
      : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">

        <span className="text-sm font-medium text-gray-700">
          {label}
        </span>

        <span className="text-sm text-gray-500">
          {value} · {percentage}%
        </span>

      </div>

      <div className="h-2 rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-black transition-all"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}

function PerformanceCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border bg-gray-50 p-5">

      <p className="text-sm font-medium text-gray-500">
        {title}
      </p>

      <p className="mt-2 text-3xl font-bold text-gray-900">
        {value}
      </p>

      <p className="mt-2 text-xs leading-5 text-gray-400">
        {description}
      </p>

    </div>
  );
}