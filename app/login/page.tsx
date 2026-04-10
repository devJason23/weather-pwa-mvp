export const dynamic = 'force-dynamic';
import { signIn } from "@/lib/auth";
import { BrandMark } from "@/components/brand-mark";

export default async function LoginPage({
  searchParams
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const params = searchParams ? await searchParams : undefined;
  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,rgba(16,20,24,0.98),rgba(24,30,36,0.97)),radial-gradient(circle_at_top_right,rgba(45,138,77,0.18),transparent_34%)] px-4 py-12 text-white">
      <div className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="max-w-2xl">
          <BrandMark href="/" tone="light" />
          <h1 className="mt-6 text-5xl font-black tracking-[-0.05em] sm:text-6xl">
            HoopSmith keeps performance review, film context, and publishing in one disciplined workflow
          </h1>
          <p className="mt-6 text-lg leading-8 text-white/76">
            Secure access for the internal basketball operations workspace used to review games, confirm uncertain events, and publish trustworthy official stats.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {["Stats", "Film", "Feedback"].map((item) => (
              <div key={item} className="rounded-[1.4rem] border border-white/10 bg-white/5 p-5 backdrop-blur">
                <p className="text-2xl font-black tracking-[-0.04em] text-white">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="hs-panel w-full max-w-md justify-self-end bg-white/96 p-8 text-brand-ink shadow-[0_30px_70px_rgba(0,0,0,0.35)]">
          <p className="hs-kicker text-brand-green">Secure access</p>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.04em]">Family and admin login</h2>
          <p className="mt-3 text-sm leading-7 text-brand-muted">
            Sign in to access HoopSmith review tools, upload workflows, and operational reporting.
          </p>

          <form action={signIn} className="mt-8 grid gap-4">
            <input name="email" type="email" placeholder="Admin email" required />
            <input name="password" type="password" placeholder="Password" required />
            <button className="hs-button w-full">Sign in</button>
          </form>

          <p className="mt-4 text-xs text-danger">{params?.error === "invalid" ? "Invalid credentials." : null}</p>
        </div>
      </div>
    </div>
  );
}
