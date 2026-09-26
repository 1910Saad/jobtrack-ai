"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">

        {/* Sidebar */}
        <aside className="hidden w-64 border-r bg-white md:flex md:flex-col">

          {/* Logo */}
          <div className="border-b px-6 py-5">
            <Link
              href="/dashboard"
              className="text-xl font-bold tracking-tight"
            >
              JobTrack{" "}
              <span className="text-blue-600">AI</span>
            </Link>

            <p className="mt-1 text-xs text-gray-500">
              Your job search companion
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-5">

            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Workspace
            </p>

            <NavItem
              href="/dashboard"
              icon="⌂"
              label="Dashboard"
            />

            <NavItem
              href="/applications"
              icon="▣"
              label="Applications"
            />

            <NavItem
              href="/application/new"
              icon="+"
              label="Add Application"
            />

            <div className="my-6 border-t" />

            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              AI Tools
            </p>

            <ComingSoonItem
              icon="✦"
              label="AI Job Analyzer"
            />

            <ComingSoonItem
              icon="▤"
              label="Resume Matcher"
            />

            <ComingSoonItem
              icon="◉"
              label="Interview Prep"
            />

            <div className="my-6 border-t" />

            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Insights
            </p>

            <ComingSoonItem
              icon="▥"
              label="Analytics"
            />

            <ComingSoonItem
              icon="◷"
              label="Reminders"
            />

            <div className="my-6 border-t" />

            <NavItem
              href="/settings"
              icon="⚙"
              label="Settings"
            />

          </nav>

          {/* User */}
          <div className="border-t p-4">
            <div className="flex items-center gap-3">
              <UserButton />

              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  Account
                </p>

                <p className="text-xs text-gray-500">
                  Manage profile
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex min-w-0 flex-1 flex-col">

          {/* Mobile Header */}
          <header className="flex items-center justify-between border-b bg-white px-5 py-4 md:hidden">
            <Link
              href="/dashboard"
              className="text-lg font-bold"
            >
              JobTrack{" "}
              <span className="text-blue-600">AI</span>
            </Link>

            <UserButton />
          </header>

          <main className="flex-1">
            {children}
          </main>

        </div>
      </div>
    </div>
  );
}

function NavItem({
  href,
  icon,
  label,
}: {
  href: string;
  icon: string;
  label: string;
}) {
  const pathname = usePathname();

  const isActive =
    pathname === href ||
    (href !== "/dashboard" &&
      pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
        isActive
          ? "bg-blue-50 text-blue-700"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-md text-base ${
          isActive
            ? "bg-blue-100"
            : "bg-gray-100"
        }`}
      >
        {icon}
      </span>

      {label}
    </Link>
  );
}

function ComingSoonItem({
  icon,
  label,
}: {
  icon: string;
  label: string;
}) {
  return (
    <div className="mb-1 flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-400">
      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gray-50 text-sm">
        {icon}
      </span>

      <span className="flex-1">
        {label}
      </span>

      <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-gray-400">
        Soon
      </span>
    </div>
  );
}