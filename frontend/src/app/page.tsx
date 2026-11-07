import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Globe2,
  Lightbulb,
  Sparkles,
} from 'lucide-react';

const learningBenefits = [
  {
    icon: BookOpen,
    title: 'Made for your curriculum',
    description:
      'Explore science, maths, history, and digital skills at a level that makes sense for you.',
    className: 'bg-amber-100 text-amber-950',
  },
  {
    icon: BrainCircuit,
    title: 'A tutor that listens',
    description:
      'Ask follow-up questions and get a patient explanation grounded in what you are learning.',
    className: 'bg-teal-100 text-teal-950',
  },
  {
    icon: Globe2,
    title: 'Learn in your language',
    description:
      'Switch between English and Pidgin to find the explanation that feels clearest.',
    className: 'bg-sky-100 text-sky-950',
  },
];

const steps = [
  {
    number: '01',
    title: 'Choose a lesson',
    description: 'Pick a topic and start with a short, guided lesson.',
    icon: BookOpen,
  },
  {
    number: '02',
    title: 'Explore the idea',
    description: 'Watch, experiment with a 3D model, and learn at your pace.',
    icon: Lightbulb,
  },
  {
    number: '03',
    title: 'Ask anything',
    description: 'Your AI tutor can explain a tricky part in a new way.',
    icon: BrainCircuit,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-background text-foreground">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
        <Link
          href="/"
          aria-label="EduBridge AI home"
          className="rounded-xl focus-visible:outline-offset-4"
        >
          <Image
            src="/edubridge_logo1.png"
            alt="EduBridge AI"
            width={300}
            height={300}
            priority
            className="h-12 w-auto object-contain object-left"
          />
        </Link>
        <nav aria-label="Main navigation" className="flex items-center gap-3 sm:gap-7">
          <Link
            href="#how-it-works"
            className="hidden rounded-lg px-2 py-2 text-sm font-semibold text-muted transition-colors hover:text-foreground sm:inline-flex"
          >
            How it works
          </Link>
          <Link
            href="/sign-in"
            className="rounded-lg px-2 py-2 text-sm font-semibold text-foreground transition-colors hover:text-brand"
          >
            Sign in
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-hover"
          >
            Start learning <ArrowRight aria-hidden="true" size={16} />
          </Link>
        </nav>
      </header>

      <main>
        <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-10 sm:px-8 sm:pb-24 sm:pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-10 lg:pb-28 lg:pt-20">
          <div className="relative z-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-2 text-sm font-semibold text-amber-950">
              <Sparkles aria-hidden="true" size={16} />
              Built for JSS &amp; SSS learners
            </div>
            <h1 className="max-w-3xl text-balance text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Big ideas, made{' '}
              <span className="relative inline-block whitespace-nowrap">
                <span className="relative z-10">clearer.</span>
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-1 -z-0 h-3 rounded-sm bg-amber-300/80 sm:bottom-2 sm:h-4"
                />
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted sm:text-xl">
              Learn science, maths, history, and AI through guided lessons, hands-on
              3D models, and a tutor who explains things your way.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/dashboard"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 font-bold text-white shadow-md transition hover:bg-brand-hover"
              >
                Explore lessons <ArrowRight aria-hidden="true" size={18} />
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-border bg-white px-6 py-3 font-bold text-foreground transition hover:border-brand hover:text-brand"
              >
                See how it works
              </Link>
            </div>
            <p className="mt-5 text-sm font-medium text-muted">
              Learn at your pace. Ask questions without feeling rushed.
            </p>
          </div>

          <div
            aria-label="An overview of EduBridge's interactive lessons and tutor"
            className="relative mx-auto w-full max-w-xl"
          >
            <div
              aria-hidden="true"
              className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-amber-200/70 blur-2xl"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-teal-200/70 blur-2xl"
            />
            <div className="relative rounded-[2rem] border border-white/80 bg-white p-4 shadow-[0_24px_70px_-32px_rgba(23,42,39,0.35)] sm:p-6">
              <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
                    Your learning space
                  </p>
                  <p className="mt-1 text-lg font-bold">Earth science</p>
                </div>
                <span className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-900">
                  Grade 7–10
                </span>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-[1.15fr_0.85fr]">
                <div className="flex min-h-56 flex-col justify-between overflow-hidden rounded-2xl bg-slate-950 p-5 text-white">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                    <Globe2 aria-hidden="true" size={17} />
                    Interactive 3D lesson
                  </div>
                  <div className="relative mx-auto flex h-32 w-32 items-center justify-center">
                    <div className="absolute h-32 w-32 rounded-full bg-sky-500/20 blur-xl" />
                    <div className="relative h-24 w-24 rounded-full bg-[radial-gradient(circle_at_34%_30%,#fde68a_0%,#fb923c_28%,#c2410c_62%,#7c2d12_100%)] shadow-[inset_-14px_-10px_24px_rgba(15,23,42,0.55),0_0_34px_rgba(56,189,248,0.25)]">
                      <span className="absolute left-3 top-8 h-3 w-5 rounded-full bg-amber-100/70" />
                      <span className="absolute bottom-5 right-4 h-4 w-4 rounded-full bg-red-950/60" />
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-slate-200">
                    Explore the layers of the Earth
                  </p>
                </div>
                <div className="flex flex-col justify-between gap-4">
                  <div className="rounded-2xl bg-amber-50 p-4">
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-amber-200 text-amber-950">
                      <Lightbulb aria-hidden="true" size={19} />
                    </div>
                    <p className="text-sm font-bold">A question, answered</p>
                    <p className="mt-1 text-xs leading-5 text-muted">
                      Get a clear explanation, then ask a follow-up.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-teal-50 p-4">
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-teal-200 text-teal-950">
                      <BrainCircuit aria-hidden="true" size={19} />
                    </div>
                    <p className="text-sm font-bold">Made for your pace</p>
                    <div
                      aria-hidden="true"
                      className="mt-3 h-2 overflow-hidden rounded-full bg-white"
                    >
                      <div className="h-full w-2/3 rounded-full bg-brand" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-white">
                  <Sparkles aria-hidden="true" size={17} />
                </span>
                <p className="text-sm leading-5 text-muted">
                  <span className="font-bold text-foreground">Your AI tutor</span>{' '}
                  is ready when you need a hand.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section aria-label="Learning benefits" className="border-y border-border bg-white">
          <div className="mx-auto grid max-w-7xl gap-4 px-5 py-8 sm:grid-cols-3 sm:px-8 lg:px-10">
            {learningBenefits.map(({ icon: Icon, title, description, className }) => (
              <article key={title} className="flex gap-4 rounded-2xl p-4">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${className}`}
                >
                  <Icon aria-hidden="true" size={21} />
                </div>
                <div>
                  <h2 className="font-bold">{title}</h2>
                  <p className="mt-1 text-sm leading-6 text-muted">{description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          id="how-it-works"
          className="mx-auto max-w-7xl scroll-mt-8 px-5 py-20 sm:px-8 sm:py-24 lg:px-10"
        >
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand">
              Learning that clicks
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Understand it, don’t just memorize it.
            </h2>
            <p className="mt-4 text-lg leading-7 text-muted">
              Build understanding one question, lesson, and discovery at a time.
            </p>
          </div>
          <ol className="mt-12 grid gap-5 md:grid-cols-3">
            {steps.map(({ number, title, description, icon: Icon }) => (
              <li
                key={number}
                className="rounded-3xl border border-border bg-white p-6 shadow-sm sm:p-7"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-brand">
                    <Icon aria-hidden="true" size={23} />
                  </span>
                  <span className="text-sm font-bold tracking-widest text-muted">
                    {number}
                  </span>
                </div>
                <h3 className="mt-6 text-xl font-bold">{title}</h3>
                <p className="mt-2 leading-7 text-muted">{description}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 text-center">
            <Link
              href="/dashboard"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 font-bold text-white shadow-md transition hover:bg-brand-hover"
            >
              Find your next lesson <ArrowRight aria-hidden="true" size={18} />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <p>© 2026 EduBridge AI. Learn at your pace.</p>
          <Link href="/sign-in" className="font-semibold text-brand hover:underline">
            Sign in to your learning space
          </Link>
        </div>
      </footer>
    </div>
  );
}