import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { applications } from "@/db/schema";
import { eq } from "drizzle-orm";

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
    .slice(0, 5);

  return (
    <main className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Dashboard
            </h1>

            <p className="mt-2 text-gray-600">
              Track your job search with JobTrack AI.
            </p>
          </div>

          <UserButton />
        </div>

        {/* Overview */}
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Overview
          </h2>

          <Link
            href="/applications/new"
            className="rounded-lg bg-black px-5 py-3 font-medium text-white hover:bg-gray-800"
          >
            + Add Application
          </Link>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-4">

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">
              Applications
            </p>

            <p className="mt-2 text-3xl font-bold">
              {totalApplications}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">
              Online Assessments
            </p>

            <p className="mt-2 text-3xl font-bold">
              {oaCount}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">
              Interviews
            </p>

            <p className="mt-2 text-3xl font-bold">
              {interviewCount}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">
              Offers
            </p>

            <p className="mt-2 text-3xl font-bold">
              {offerCount}
            </p>
          </div>

        </div>

        {/* Recent Applications */}
        <div className="mt-8 rounded-xl bg-white p-6 shadow">

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                Recent Applications
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Your latest job applications
              </p>
            </div>

            <Link
              href="/applications"
              className="text-sm font-medium text-gray-600 hover:text-black"
            >
              View all →
            </Link>
          </div>

          {recentApplications.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-500">
                No applications yet.
              </p>

              <Link
                href="/applications/new"
                className="mt-4 inline-block rounded-lg bg-black px-5 py-3 text-white"
              >
                Add your first application
              </Link>
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b text-sm text-gray-500">
                    <th className="px-4 py-3">
                      Company
                    </th>

                    <th className="px-4 py-3">
                      Position
                    </th>

                    <th className="px-4 py-3">
                      Location
                    </th>

                    <th className="px-4 py-3">
                      Status
                    </th>

                    <th className="px-4 py-3">
                      Applied
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {recentApplications.map(
                    (application) => (
                      <tr
                        key={application.id}
                        className="border-b last:border-0 hover:bg-gray-50"
                      >
                        <td className="px-4 py-4 font-medium">
                          {application.company}
                        </td>

                        <td className="px-4 py-4">
                          {application.jobTitle}
                        </td>

                        <td className="px-4 py-4 text-gray-600">
                          {application.location || "—"}
                        </td>

                        <td className="px-4 py-4">
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium">
                            {application.status}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-gray-600">
                          {application.appliedDate || "—"}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </div>
    </main>
  );
}