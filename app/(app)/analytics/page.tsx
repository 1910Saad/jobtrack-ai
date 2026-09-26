import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { applications } from "@/db/schema";
import { eq } from "drizzle-orm";

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
  Wishlist: "bg-gray-100 text-gray-700",
  Applied: "bg-blue-50 text-blue-700",
  OA: "bg-purple-50 text-purple-700",
  Interview: "bg-yellow-50 text-yellow-700",
  HR: "bg-orange-50 text-orange-700",
  Offer: "bg-green-50 text-green-700",
  Rejected: "bg-red-50 text-red-700",
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

  const count = (status: string) =>
    userApplications.filter(
      (application) => application.status === status
    ).length;

  const applied = count("Applied");
  const oa = count("OA");
  const interviews =
    count("Interview") + count("HR");
  const offers = count("Offer");
  const rejected = count("Rejected");

  const applicationToOA =
    applied > 0
      ? Math.round((oa / applied) * 100)
      : 0;

  const oaToInterview =
    oa > 0
      ? Math.round((interviews / oa) * 100)
      : 0;

  const interviewToOffer =
    interviews > 0
      ? Math.round((offers / interviews) * 100)
      : 0;

  const rejectionRate =
    total > 0
      ? Math.round((rejected / total) * 100)
      : 0;

  const companyCounts = userApplications.reduce<
    Record<string, number>
  >((acc, application) => {
    acc[application.company] =
      (acc[application.company] || 0) + 1;

    return acc;
  }, {});

  const topCompanies = Object.entries(companyCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

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

          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Job Search Analytics
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Understand your application pipeline and job search progress.
              </p>
            </div>

            <Link
              href="/applications"
              className="rounded-lg border bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              View Application Board
            </Link>
          </div>
        </div>

        {/* Overview */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <MetricCard
            title="Total Applications"
            value={total}
            description="All tracked applications"
          />

          <MetricCard
            title="Applications → OA"
            value={`${applicationToOA}%`}
            description="Conversion rate"
          />

          <MetricCard
            title="OA → Interview"
            value={`${oaToInterview}%`}
            description="Conversion rate"
          />

          <MetricCard
            title="Interview → Offer"
            value={`${interviewToOffer}%`}
            description="Conversion rate"
          />

        </div>

        {/* Main analytics */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">

          {/* Status distribution */}
          <section className="rounded-xl border bg-white p-6 shadow-sm">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Application Distribution
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Current status of your applications.
              </p>
            </div>

            <div className="mt-6 space-y-4">
              {statuses.map((status) => {
                const value = count(status);

                const percentage =
                  total > 0
                    ? Math.round((value / total) * 100)
                    : 0;

                return (
                  <div key={status}>
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            statusStyles[status]
                          }`}
                        >
                          {status}
                        </span>

                        <span className="text-sm text-gray-500">
                          {value}
                        </span>
                      </div>

                      <span className="text-xs text-gray-400">
                        {percentage}%
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-gray-900 transition-all"
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

          {/* Funnel */}
          <section className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Application Funnel
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              How applications progress through your pipeline.
            </p>

            <div className="mt-6 space-y-4">

              <FunnelRow
                label="Applications"
                value={total}
              />

              <FunnelRow
                label="Online Assessments"
                value={oa}
              />

              <FunnelRow
                label="Interviews"
                value={interviews}
              />

              <FunnelRow
                label="Offers"
                value={offers}
              />

            </div>

            <div className="mt-6 rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">
                Rejection rate
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-900">
                {rejectionRate}%
              </p>
            </div>
          </section>
        </div>

        {/* Companies */}
        <section className="mt-6 rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Companies Applied To
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Companies with the most applications in your tracker.
          </p>

          {topCompanies.length === 0 ? (
            <p className="mt-6 text-sm text-gray-500">
              No applications yet.
            </p>
          ) : (
            <div className="mt-6 space-y-3">
              {topCompanies.map(
                ([company, value], index) => (
                  <div
                    key={company}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold">
                        {index + 1}
                      </span>

                      <span className="font-medium text-gray-900">
                        {company}
                      </span>
                    </div>

                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                      {value}{" "}
                      {value === 1
                        ? "application"
                        : "applications"}
                    </span>
                  </div>
                )
              )}
            </div>
          )}
        </section>

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
  value: string | number;
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

function FunnelRow({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <span className="text-sm font-medium text-gray-700">
        {label}
      </span>

      <span className="text-xl font-bold text-gray-900">
        {value}
      </span>
    </div>
  );
}