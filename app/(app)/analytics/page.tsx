import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { applications } from "@/db/schema";
import { eq } from "drizzle-orm";
import AnalyticsCharts from "@/components/analytics/AnalyticsCharts";

const statuses = [
  "Wishlist",
  "Applied",
  "OA",
  "Interview",
  "HR",
  "Offer",
  "Rejected",
];

export default async function AnalyticsPage() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const userApplications = await db
    .select()
    .from(applications)
    .where(eq(applications.userId, userId));

  const chartData = statuses.map((status) => ({
    status,
    count: userApplications.filter(
      (application) => application.status === status
    ).length,
  }));

  const total = userApplications.length;

  const offers = userApplications.filter(
    (application) => application.status === "Offer"
  ).length;

  const interviews = userApplications.filter(
    (application) =>
      application.status === "Interview" ||
      application.status === "HR"
  ).length;

  const rejected = userApplications.filter(
    (application) => application.status === "Rejected"
  ).length;

  const activeApplications = userApplications.filter(
    (application) =>
      !["Rejected", "Offer"].includes(application.status)
  ).length;

  const offerRate =
    total > 0
      ? Math.round((offers / total) * 100)
      : 0;

  const interviewRate =
    total > 0
      ? Math.round((interviews / total) * 100)
      : 0;

  return (
    <main className="min-h-screen bg-gray-50 p-5 md:p-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-gray-500 transition hover:text-gray-900"
          >
            ← Dashboard
          </Link>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Analytics
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Understand your job search activity and application pipeline.
              </p>
            </div>

            <Link
              href="/applications"
              className="inline-flex items-center justify-center rounded-lg border bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
            >
              View Application Board →
            </Link>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <MetricCard
            title="Total Applications"
            value={total}
            description="All tracked applications"
          />

          <MetricCard
            title="Active Applications"
            value={activeApplications}
            description="Currently in your pipeline"
          />

          <MetricCard
            title="Interviews"
            value={interviews}
            description={`${interviewRate}% of applications`}
          />

          <MetricCard
            title="Offers"
            value={offers}
            description={`${offerRate}% of applications`}
          />

        </div>

        {/* Charts */}
        <div className="mt-6">
          <AnalyticsCharts data={chartData} />
        </div>

        {/* Additional Insights */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">

          {/* Conversion */}
          <section className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Conversion Overview
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              How your applications are progressing through the pipeline.
            </p>

            <div className="mt-6 space-y-5">

              <ProgressRow
                label="Applications → Interviews"
                value={interviewRate}
              />

              <ProgressRow
                label="Applications → Offers"
                value={offerRate}
              />

            </div>
          </section>

          {/* Outcome */}
          <section className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Search Outcomes
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Current outcomes from your tracked applications.
            </p>

            <div className="mt-6 space-y-4">

              <SummaryRow
                label="Offers"
                value={offers}
              />

              <SummaryRow
                label="Interviews / HR"
                value={interviews}
              />

              <SummaryRow
                label="Rejected"
                value={rejected}
              />

              <SummaryRow
                label="Still Active"
                value={activeApplications}
              />

            </div>
          </section>

        </div>

        {/* Empty State */}
        {total === 0 && (
          <div className="mt-6 rounded-2xl border border-dashed bg-white p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-xl">
              📊
            </div>

            <h2 className="mt-4 text-lg font-semibold text-gray-900">
              No analytics yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
              Add some job applications to start seeing your job search
              statistics and conversion data.
            </p>

            <Link
              href="/application/new"
              className="mt-5 inline-flex rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              Add Application
            </Link>
          </div>
        )}

      </div>
    </main>
  );
}

function MetricCard({
  title,
  value,
  description,
}: {
  title: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
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

function ProgressRow({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm text-gray-600">
          {label}
        </span>

        <span className="text-sm font-semibold text-gray-900">
          {value}%
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-blue-600 transition-all"
          style={{
            width: `${Math.min(value, 100)}%`,
          }}
        />
      </div>
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
    <div className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-gray-600">
        {label}
      </span>

      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
        {value}
      </span>
    </div>
  );
}