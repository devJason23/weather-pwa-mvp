import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";

const heroBullets = [
  "Stats that turn performance into something measurable",
  "Film review that helps players actually see the game",
  "Feedback that builds confidence, accountability, and basketball IQ"
];

const featurePoints = [
  "Exclusive platform access for program families and players",
  "Built around development, not just box scores",
  "Clearer teaching moments for coaches",
  "A visible connection between effort, execution, and results"
];

const benefits = [
  {
    title: "Faster player development",
    body:
      "When players can review what happened and get clear feedback, improvement happens faster. Film and stats shorten the gap between a mistake, the lesson, and the next better rep."
  },
  {
    title: "Better basketball IQ",
    body:
      "Reviewing possessions helps athletes read the floor, understand spacing, recognize patterns, and make smarter decisions over time."
  },
  {
    title: "Objective performance feedback",
    body:
      "Film and stats create a shared view of what actually happened, leading to more honest coaching and more productive growth."
  },
  {
    title: "More accountability",
    body:
      "When effort, execution, and results are visible, players learn to take ownership and grow into more dependable teammates."
  },
  {
    title: "Stronger team learning",
    body:
      "One game can teach an entire team more clearly when film and stat review expose tendencies, spacing, transition habits, and defensive discipline."
  },
  {
    title: "Progress you can actually see",
    body:
      "Over time, players and families can track growth in decision-making, consistency, shot selection, effort habits, and role execution."
  }
];

const miniPoints = [
  "Track patterns over time",
  "Review possessions with purpose",
  "Make coaching easier to understand",
  "Turn progress into something visible"
];

const sections = [
  {
    id: "players",
    title: "For players who want more than just minutes",
    body:
      "If a player wants to separate himself, he has to become a student of the game. HoopSmith helps athletes understand their strengths, spot weaknesses faster, and build real confidence through honest feedback and better preparation."
  },
  {
    id: "families",
    title: "For families who want real development",
    body:
      "Families invest time, energy, money, and trust into a program. They deserve more than generic promises. HoopSmith gives them a clearer view of teaching, measurable growth, and long-term development."
  },
  {
    id: "philosophy",
    title: "Built for growth on and off the court",
    body:
      "The goal is bigger than stats. It is about disciplined habits, coachability, leadership, and preparing athletes for bigger opportunities in basketball and in life."
  },
  {
    id: "research",
    title: "Why this approach works",
    body:
      "Video analysis and performance review make feedback more objective, immediate, and easier to understand. That supports better technical development, stronger tactical understanding, and clearer communication between coaches and players."
  }
];

function Section({
  id,
  title,
  children,
  dark = false
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <section id={id} className={dark ? "bg-brand-ink text-white" : "bg-transparent text-brand-ink"}>
      <div className="hs-page hs-section">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-black tracking-[-0.04em] sm:text-4xl">{title}</h2>
        </div>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-brand-page text-brand-ink">
      <header className="sticky top-0 z-30 border-b border-brand-green/10 bg-white/88 backdrop-blur">
        <div className="hs-page flex items-center justify-between py-4">
          <BrandMark href="/" compact />
          <nav className="hidden items-center gap-6 text-sm font-semibold text-brand-ink-soft lg:flex">
            <a href="#advantage" className="hover:text-brand-green">Why it works</a>
            <a href="#players" className="hover:text-brand-green">Players</a>
            <a href="#families" className="hover:text-brand-green">Families</a>
            <a href="#research" className="hover:text-brand-green">Research</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hs-button-secondary hidden sm:inline-flex">
              Family Login
            </Link>
            <a href="#advantage" className="hs-button">
              See the platform
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="overflow-hidden bg-[linear-gradient(135deg,rgba(16,20,24,0.98),rgba(24,30,36,0.97)),radial-gradient(circle_at_top_right,rgba(45,138,77,0.18),transparent_34%)] text-white">
          <div className="hs-page grid gap-14 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold tracking-[0.16em] text-brand-silver">A premium basketball intelligence platform</p>
              <h1 className="mt-5 text-5xl font-black tracking-[-0.06em] sm:text-6xl">
                The Most Advanced Basketball Development Platform in the World
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/78">
                Every game becomes a teaching tool. HoopSmith combines advanced stat tracking, film review, and structured feedback so players can improve faster, think smarter, and grow with purpose.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a href="#advantage" className="hs-button">
                  Explore HoopSmith
                </a>
                <Link href="/login" className="hs-button-ghost">
                  Family Login
                </Link>
              </div>
              <div className="mt-10 grid gap-3">
                {heroBullets.map((bullet) => (
                  <div key={bullet} className="flex items-start gap-3">
                    <span className="mt-2 inline-block h-2.5 w-2.5 rounded-full bg-brand-green-soft" />
                    <p className="text-sm leading-7 text-white/74">{bullet}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 rounded-[2rem] bg-brand-green/10 blur-3xl" />
              <div className="relative rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.38)] backdrop-blur sm:p-7">
                <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-silver">HoopSmith overview</p>
                    <p className="mt-2 text-2xl font-black tracking-[-0.04em]">Stats, film, and feedback in one system</p>
                  </div>
                  <span className="rounded-full border border-white/12 bg-white/6 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/84">
                    Premium access
                  </span>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  {[
                    { value: "1", label: "Connected workflow" },
                    { value: "Every game", label: "A teaching opportunity" },
                    { value: "Clearer growth", label: "For players and families" }
                  ].map((item) => (
                    <div key={item.label} className="rounded-[1.3rem] border border-white/10 bg-black/20 p-4">
                      <p className="text-3xl font-black tracking-[-0.04em]">{item.value}</p>
                      <p className="mt-2 text-sm leading-6 text-white/72">{item.label}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-[linear-gradient(145deg,rgba(31,107,58,0.22),rgba(255,255,255,0.03))] p-6">
                  <div className="space-y-4">
                    {featurePoints.map((item) => (
                      <div key={item} className="flex items-start gap-3">
                        <span className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-green text-xs font-black text-white">
                          H
                        </span>
                        <p className="text-sm leading-7 text-white/86">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Section title="Most programs play games. HoopSmith turns games into growth.">
          <div className="grid gap-10 lg:grid-cols-[1.02fr_0.98fr]">
            <div className="max-w-2xl space-y-6 text-lg leading-8 text-brand-ink-soft">
              <p>
                Too many teams move from one game to the next without ever turning performance into real learning. HoopSmith changes that by combining game film, stat tracking, and structured feedback in one development environment.
              </p>
              <p>
                Players do not have to rely on memory alone. Coaches do not have to rely on vague impressions alone. Families do not have to wonder whether progress is happening. The result is a clearer process built on consistency, accountability, and teaching that lasts.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {["Clarity after every game", "Consistency across a season", "Visible accountability", "A stronger learning loop"].map((item) => (
                <div key={item} className="hs-card p-6">
                  <p className="text-2xl font-black tracking-[-0.04em] text-brand-ink">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section id="advantage" title="Proprietary technology. Purpose-driven development." dark>
          <div className="grid gap-10 lg:grid-cols-[0.96fr_1.04fr]">
            <div className="max-w-2xl space-y-6 text-lg leading-8 text-white/76">
              <p>
                This platform was built to give athletes a better way to learn the game. It connects performance data, film study, and coaching feedback so players can understand what happened, why it happened, and how to improve.
              </p>
              <p>
                The value is not in collecting numbers for their own sake. The value is in helping athletes build stronger habits, sharper awareness, better decision-making, and more confidence over the course of a season.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {benefits.slice(0, 4).map((item) => (
                <div key={item.title} className="rounded-[1.4rem] border border-white/10 bg-white/5 p-5">
                  <h3 className="text-xl font-black tracking-[-0.03em] text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/72">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section title="The development advantages that separate a serious environment from a generic one.">
          <div className="grid gap-5 lg:grid-cols-3">
            {benefits.map((benefit) => (
              <article key={benefit.title} className="hs-card p-6 transition hover:-translate-y-1 hover:shadow-panel">
                <h3 className="text-2xl font-black tracking-[-0.04em] text-brand-ink">{benefit.title}</h3>
                <p className="mt-4 text-sm leading-7 text-brand-muted">{benefit.body}</p>
              </article>
            ))}
          </div>
        </Section>

        <Section title="Stats show the pattern. Film shows the truth.">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.92fr]">
            <div className="hs-card p-7 sm:p-8">
              <div className="max-w-2xl space-y-5 text-lg leading-8 text-brand-ink-soft">
                <p>
                  A stat line can reveal what happened. Film helps explain why it happened. Together, they create a much stronger development environment for players and coaches.
                </p>
                <p>
                  Missed rotations, rushed shots, smart cuts, strong closeouts, and repeated habits all become easier to identify, teach, and improve when stats and video work together.
                </p>
              </div>
            </div>
            <div className="grid gap-4">
              {miniPoints.map((point) => (
                <div key={point} className="hs-subtle p-5">
                  <p className="text-xl font-black tracking-[-0.03em] text-brand-ink">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {sections.map((section, index) => (
          <Section key={section.id} id={section.id} title={section.title} dark={index === 0 || index === 3}>
            <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr]">
              <div className={`max-w-2xl text-lg leading-8 ${index === 0 || index === 3 ? "text-white/76" : "text-brand-ink-soft"}`}>
                <p>{section.body}</p>
              </div>
              <div className={index === 0 || index === 3 ? "grid gap-4 sm:grid-cols-2" : "grid gap-4"}>
                {(section.id === "players"
                  ? ["Study the game", "Compete with confidence", "See strengths clearly", "Improve faster"]
                  : section.id === "families"
                    ? ["A visible window into growth", "More confidence in the process", "Stronger accountability"]
                    : section.id === "philosophy"
                      ? ["Disciplined habits", "Coachability", "Leadership", "Preparedness"]
                      : ["Objective feedback", "Stronger tactical understanding", "Better communication", "Smarter execution"]
                ).map((item) => (
                  <div
                    key={item}
                    className={
                      index === 0 || index === 3
                        ? "rounded-[1.35rem] border border-white/10 bg-white/5 p-5 text-white"
                        : "hs-subtle p-5 text-brand-ink"
                    }
                  >
                    <p className="text-lg font-black tracking-[-0.03em]">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        ))}

        <section className="hs-section">
          <div className="hs-page">
            <div className="hs-panel bg-[linear-gradient(135deg,rgba(31,107,58,0.12),rgba(255,255,255,0.96))] p-8 sm:p-12">
              <div className="max-w-3xl">
                <h2 className="text-4xl font-black tracking-[-0.05em] text-brand-ink sm:text-5xl">
                  Built for players who want to grow
                </h2>
                <p className="mt-5 text-lg leading-8 text-brand-ink-soft">
                  HoopSmith gives families, players, and coaches a more intentional development standard by turning stats, film, and feedback into a connected learning system.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <a href="#advantage" className="hs-button">
                    Explore HoopSmith
                  </a>
                  <Link href="/login" className="hs-button-secondary">
                    Log in
                  </Link>
                </div>
                <p className="mt-8 max-w-2xl text-sm leading-7 text-brand-muted">
                  A serious basketball development environment should make growth easier to see, easier to teach, and easier to trust.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-brand-green/10 bg-brand-ink text-white">
        <div className="hs-page flex flex-col gap-6 py-10 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <BrandMark href="/" tone="light" compact />
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/68">
              A basketball intelligence platform that turns stats, film, and feedback into faster player growth.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/login" className="hs-button-ghost">
              Family Login
            </Link>
            <a href="#advantage" className="hs-button">
              See the platform
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
