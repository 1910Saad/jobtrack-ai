import Link from "next/link";

export default function ApplicationsPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="mx-auto max-w-6xl">

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Applications
            </h1>

            <p className="mt-2 text-gray-600">
              Manage your job and internship applications.
            </p>
          </div>

          <Link
            href="/application/new"
            className="rounded-lg bg-black px-5 py-3 font-medium text-white hover:bg-gray-800"
          >
            + Add Application
          </Link>
        </div>

        <div className="rounded-xl bg-white p-10 text-center shadow">
          <h2 className="text-xl font-semibold">
            No applications yet
          </h2>

          <p className="mt-2 text-gray-500">
            Add your first job application to get started.
          </p>

          <Link
            href="/applications/new"
            className="mt-6 inline-block rounded-lg bg-black px-5 py-3 text-white"
          >
            Add Application
          </Link>
        </div>

      </div>
    </main>
  );
}