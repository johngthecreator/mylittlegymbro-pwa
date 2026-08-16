import type { ReactElement } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ChefHat,
  GitFork,
  Globe,
  KeyRound,
  NotebookPen,
  ScanLine,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface BentoCell {
  icon: LucideIcon;
  title: string;
  body: string;
}

const BENTO: BentoCell[] = [
  {
    icon: Globe,
    title: "Powered by Open Food Facts",
    body: "The free, open barcode database behind every scan — so you're never locked into a paid catalog.",
  },
  {
    icon: ShieldCheck,
    title: "Private",
    body: "Everything lives in your browser. No account, no ads, no cloud, no tracking.",
  },
  {
    icon: KeyRound,
    title: "Gemini AI search",
    body: "Ask about any food or restaurant order — web search, then log it in one tap. Bring your own key.",
  },
  {
    icon: ScanLine,
    title: "Scan barcodes",
    body: "Instant macros from any package.",
  },
  {
    icon: ChefHat,
    title: "Home-cook meals",
    body: "Weigh in, get real per-gram macros.",
  },
  {
    icon: GitFork,
    title: "Free & open source",
    body: "Extend it, host it yourself, and take your data with you. It's yours.",
  },
  {
    icon: NotebookPen,
    title: "Today's log",
    body: "Calories, protein, carbs, fat — reset at midnight.",
  },
];

const mono = "font-['IBM_Plex_Mono']";
const display = "font-['Archivo']";
const eyebrow = `text-[0.6875rem] uppercase tracking-[0.13em] text-black/55`;

export default function LandingPage(): ReactElement {
  const openUrl = "https://mylittlegymbro.getfinalform.com";

  return (
    <div
      className={`min-h-dvh bg-white text-black ${mono} text-[0.875rem] leading-[1.8] tracking-[0.06rem]`}
    >
      <header className="sticky top-0 z-40 border-b border-black/10 bg-white">
        <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between px-4 sm:px-8">
          <a
            href="#"
            className={`flex items-center gap-2 ${display} text-[0.8125rem] font-black uppercase tracking-[0.02em]`}
          >
            <img src="/logo.png" alt="mylittlegymbro logo" className="size-6" />
            mylittlegymbro
          </a>
          <a
            href="#open-on-phone"
            className="inline-flex h-10 items-center px-5 text-[0.75rem] uppercase tracking-[0.1em] bg-black text-white transition hover:opacity-75"
          >
            Get access
          </a>
        </div>
      </header>

      <section className="mx-auto w-full max-w-[1600px] px-4 pt-16 pb-10 text-center sm:px-8">
        <p className={eyebrow}>Free AI macro tracker • No subscriptions</p>
        <h1
          className={`mx-auto mt-5 max-w-4xl ${display} text-3xl font-black uppercase leading-[1.1] tracking-[-0.02em] sm:text-5xl`}
        >
          A free AI macro tracker — because no one should have to pay for one.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-[0.9375rem] text-black/55">
          Scan groceries with your camera, fix the wrong nutrition facts, and
          know your per-gram macros. No subscriptions, no ads, no account.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="#open-on-phone"
            className="inline-flex h-12 w-full max-w-xs items-center justify-center px-8 text-[0.75rem] uppercase tracking-[0.1em] bg-black text-white transition hover:opacity-75 sm:w-auto"
          >
            Open on your phone
          </a>
          <a
            href="#features"
            className="inline-flex h-12 w-full max-w-xs items-center justify-center border border-black bg-white px-8 text-[0.75rem] uppercase tracking-[0.1em] text-black transition hover:bg-[#f8f9f9] sm:w-auto"
          >
            See how it works
          </a>
        </div>
      </section>

      <section id="open-on-phone" className="mx-auto w-full max-w-[1600px] px-4 pb-14 sm:px-8">
        <div className="mx-auto w-full max-w-md border border-black/10 p-8 text-center">
          <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-[#f3f4f4]">
            <Smartphone className="size-5" />
          </div>
          <h2
            className={`mt-4 ${display} text-sm font-black uppercase tracking-[0.05em]`}
          >
            Open this on your phone
          </h2>
          <p className="mt-2 text-xs text-black/55">
            Scan the QR code to launch the app on your phone.
          </p>
          <div className="mx-auto mt-6 w-fit border border-black/10 p-3">
            <QRCodeSVG value={openUrl} size={168} marginSize={2} />
          </div>
          {openUrl && (
            <p className="mt-4 break-all text-[0.6875rem] text-black/55">{openUrl}</p>
          )}
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1600px] px-4 pb-14 sm:px-8">
        <div className="flex flex-col items-center justify-center gap-8 border-y border-black/10 py-8 sm:flex-row sm:gap-16">
          <div className="text-center">
            <Globe className="mx-auto size-5" />
            <p
              className={`mt-2 ${display} text-xs font-black uppercase tracking-[0.08em]`}
            >
              Open Food Facts
            </p>
            <p className="mt-1 text-[0.6875rem] uppercase tracking-[0.06em] text-black/55">
              Powers barcode scanning & the food database
            </p>
          </div>
          <div className="hidden h-10 w-px bg-black/10 sm:block" />
          <div className="text-center">
            <Sparkles className="mx-auto size-5" />
            <p
              className={`mt-2 ${display} text-xs font-black uppercase tracking-[0.08em]`}
            >
              Gemini
            </p>
            <p className="mt-1 text-[0.6875rem] uppercase tracking-[0.06em] text-black/55">
              Powers the AI food search — bring your own key
            </p>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto w-full max-w-[1600px] px-4 pb-16 sm:px-8">
        <h2
          className={`text-center ${display} text-2xl font-black uppercase tracking-[0.02em] sm:text-3xl`}
        >
          Free, private, and built to fix what other trackers get wrong.
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BENTO.map(({ icon: Icon, title, body }) => (
            <div key={title} className="border-t-2 border-black p-4 text-left">
              <Icon className="size-5" />
              <h3
                className={`mt-3 ${display} text-sm font-black uppercase tracking-[0.02em]`}
              >
                {title}
              </h3>
              <p className="mt-2 text-xs leading-[1.8] text-black/55">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1600px] px-4 pb-16 sm:px-8">
        <div className="grid gap-10 border-y border-black/10 py-10 sm:grid-cols-2 sm:gap-16">
          <div>
            <h2
              className={`${display} text-2xl font-black uppercase tracking-[0.02em] sm:text-3xl`}
            >
              Why is it free?
            </h2>
            <div className="mt-5 space-y-4 text-[0.9375rem] text-black/55">
              <p>
                I got tired of apps like MyFitnessPal and CalAI charging a
                premium just to tell me what I ate today. Tracking your food
                shouldn't be a subscription — it should be a habit.
              </p>
              <p>
                There are tools like MacroFactor that are genuinely grounded in
                science and built for serious performance. They're great — but
                that's not the starting line.
              </p>
              <p>
                This is the entry point: made for the casual to semi-serious
                person beginning their macro journey. Scan your food, log your
                meals, and get honest per-gram numbers — without paying to
                remember what you ate.
              </p>
            </div>
          </div>
          <div className="border-t-2 border-black p-4 sm:p-6">
            <p
              className={`${display} text-lg font-black uppercase leading-snug tracking-[0.02em]`}
            >
              Free forever — and honest about what it is.
            </p>
            <p className="mt-3 text-sm leading-[1.8] text-black/55">
              Deliberate trade-offs make the free possible: no servers to run, no
              cloud database to bill, a free open barcode database, and AI that
              uses your own key — keeping hosting cost to pennies.
            </p>
            <p className="mt-3 text-sm leading-[1.8] text-black/55">
              It also won't replace science-backed performance trackers like
              MacroFactor. This is the free on-ramp that gets you there.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-black text-white">
        <div className="mx-auto w-full max-w-[1600px] px-4 py-16 text-center sm:px-8">
          <h2
            className={`${display} text-3xl font-black uppercase tracking-[0.02em] sm:text-4xl`}
          >
            Free. Because no one should have to pay to remember the food they ate.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-white/70">
            No subscriptions. No ads. Just a tracker that works.
          </p>
          <a
            href="#open-on-phone"
            className="mt-8 inline-flex h-12 items-center justify-center px-8 text-[0.75rem] uppercase tracking-[0.1em] bg-white text-black transition hover:bg-[#f3f4f4]"
          >
            Open on your phone
          </a>
        </div>
      </section>

      <footer className="bg-black text-white/60">
        <div className="mx-auto w-full max-w-[1600px] px-4 py-10 sm:px-8">
          <div className="flex flex-wrap items-start justify-between gap-6 border-t border-white/20 pt-8">
            <div>
              <p
                className={`${display} font-black uppercase tracking-[0.08em] text-white`}
              >
                MyLittleGymBro
              </p>
              <p className="mt-2 text-xs">
                © 2026 MyLittleGymBro · Free & open source
              </p>
            </div>
            <div className="flex flex-col gap-2 text-xs uppercase tracking-[0.08em]">
              <a href="/tech" className="hover:text-white">
                Tech stack
              </a>
              <a href="/legal#terms" className="hover:text-white">
                Terms
              </a>
              <a href="/legal#privacy" className="hover:text-white">
                Privacy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
