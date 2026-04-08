import { signIn } from "@/lib/auth";

export default async function LoginPage({
  searchParams
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const params = searchParams ? await searchParams : undefined;
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(15,118,110,0.14),_transparent_30%),linear-gradient(180deg,_#e5eef4,_#f8fafc)] px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/70 bg-white p-8 shadow-panel">
        <p className="text-xs uppercase tracking-[0.3em] text-accent">CourtReview AI</p>
        <h1 className="mt-3 text-3xl font-semibold text-ink">Admin sign in</h1>
        <p className="mt-2 text-sm text-slate/70">
          Draft and in-review stats stay internal until reconciliation is complete.
        </p>

        <form action={signIn} className="mt-8 grid gap-4">
          <input name="email" type="email" placeholder="Admin email" required />
          <input name="password" type="password" placeholder="Password" required />
          <button className="rounded-xl bg-slate px-4 py-3 text-sm font-semibold text-white">Sign in</button>
        </form>

        <p className="mt-4 text-xs text-danger">{params?.error === "invalid" ? "Invalid credentials." : null}</p>
      </div>
    </div>
  );
}
