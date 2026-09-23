import {
  SignInButton,
  SignUpButton,
  UserButton,
  Show,
} from "@clerk/nextjs";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold">
        JobTrack AI
      </h1>

      <p className="text-gray-600">
        Track your job search with AI.
      </p>

      <Show when="signed-out">
        <div className="flex gap-4">
          <SignInButton>
            <button className="rounded-lg bg-black px-5 py-3 text-white">
              Sign In
            </button>
          </SignInButton>

          <SignUpButton>
            <button className="rounded-lg border px-5 py-3">
              Sign Up
            </button>
          </SignUpButton>
        </div>
      </Show>

      <Show when="signed-in">
        <div className="flex flex-col items-center gap-4">
          <p>You are signed in.</p>

          <UserButton />

          <a
            href="/dashboard"
            className="rounded-lg bg-black px-5 py-3 text-white"
          >
            Go to Dashboard
          </a>
        </div>
      </Show>
    </main>
  );
}