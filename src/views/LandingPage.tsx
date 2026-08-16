import { useEffect, useState } from "react";
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

const ACCENT = "#3100e0";

const TONES = [
  "bg-gradient-to-br from-[#3100e0] to-[#6a45ff]",
  "bg-gradient-to-br from-[#1e3a8a] to-[#3b82f6]",
  "bg-gradient-to-br from-[#4f46e5] to-[#818cf8]",
  "bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8]",
  "bg-gradient-to-br from-[#312e81] to-[#4f46e5]",
];

interface BentoCell {
  icon: LucideIcon;
  title: string;
  body: string;
  tone: string;
  span?: string;
  big?: boolean;
}

const BENTO: BentoCell[] = [
  {
    icon: Globe,
    title: "Powered by Open Food Facts",
    body: "The free, open barcode database behind every scan — so you're never locked into a paid catalog.",
    tone: TONES[0],
    span: "col-span-2 md:row-span-2",
    big: true,
  },
  {
    icon: ShieldCheck,
    title: "Private",
    body: "Everything lives in your browser. No account, no ads, no cloud, no tracking.",
    tone: TONES[1],
    span: "col-span-2",
    big: true,
  },
  {
    icon: KeyRound,
    title: "Gemini AI search",
    body: "Ask about any food or restaurant order — web search, then log it in one tap. Bring your own key.",
    tone: TONES[2],
    span: "col-span-2",
    big: true,
  },
  {
    icon: ScanLine,
    title: "Scan barcodes",
    body: "Instant macros from any package.",
    tone: TONES[3],
  },
  {
    icon: ChefHat,
    title: "Home-cook meals",
    body: "Weigh in, get real per-gram macros.",
    tone: TONES[4],
  },
  {
    icon: GitFork,
    title: "Free & open source",
    body: "Extend it, host it yourself, and take your data with you. It's yours.",
    tone: TONES[2],
  },
  {
    icon: NotebookPen,
    title: "Today's log",
    body: "Calories, protein, carbs, fat — reset at midnight.",
    tone: TONES[3],
  },
];

export default function LandingPage(): ReactElement {
  const openUrl = typeof window !== "undefined" ? window.location.href : "";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = (): void => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-dvh bg-[#fbfbf9] text-[#211922]">
      <header
        className={`sticky top-0 z-40 border-b transition-colors ${
          scrolled
            ? "border-[#e5e5e0] bg-white/80 backdrop-blur"
            : "border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 w-full max-w-screen-xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="mylittlegymbro logo"
              className="size-6 rounded-md"
            />
            <span className="text-base font-bold tracking-tight">mylittlegymbro</span>
          </div>
          <a
            href="#open-on-phone"
            className="flex h-10 items-center justify-center rounded-full px-4 text-sm font-bold text-white transition"
            style={{ backgroundColor: ACCENT }}
          >
            Open on your phone
          </a>
        </div>
      </header>

      <section className="relative mx-auto w-full max-w-screen-xl px-4 pb-10 text-center sm:px-6">
        <div className="pointer-events-none -mt-4 flex items-start justify-center">
          <img
            src="/logo.png"
            alt="mylittlegymbro logo"
            className="size-44 sm:size-64"
          />
        </div>
        <h1 className="mx-auto mt-3 max-w-3xl text-3xl font-bold tracking-[-1.5px] sm:text-5xl sm:leading-[1.1]">
          A free AI macro tracker — because no one should have to pay to
          remember the food they ate.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[#62625b]">
          Scan groceries with your camera, fix the wrong nutrition facts, and
          know your per-gram macros. No subscriptions, no ads, no account.
        </p>
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="#open-on-phone"
            className="flex h-12 w-full max-w-xs items-center justify-center rounded-full px-6 text-sm font-bold text-white transition sm:w-auto"
            style={{ backgroundColor: ACCENT }}
          >
            Open on your phone
          </a>
          <a
            href="#features"
            className="flex h-12 w-full max-w-xs items-center justify-center rounded-full bg-[#e5e5e0] px-6 text-sm font-bold text-black transition hover:bg-[#dcdcd6] sm:w-auto"
          >
            See how it works
          </a>
        </div>
      </section>

      <section id="open-on-phone" className="mx-auto w-full max-w-screen-xl px-4 pb-12 sm:px-6">
        <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-6 text-center ring-1 ring-[#e5e5e0]">
          <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-white ring-1 ring-[#e5e5e0]">
            <Smartphone className="size-5" style={{ color: ACCENT }} />
          </div>
          <h2 className="mt-3 text-lg font-bold tracking-tight">
            Open this on your phone
          </h2>
          <p className="mt-1 text-sm text-[#62625b]">
            Scan the QR code to launch the app on your phone.
          </p>
          <div className="mx-auto mt-4 w-fit rounded-2xl bg-white p-3 ring-1 ring-[#e5e5e0]">
            <QRCodeSVG value={openUrl} size={168} marginSize={2} />
          </div>
          {openUrl && (
            <p className="mt-3 break-all font-mono text-xs text-[#62625b]">
              {openUrl}
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto w-full max-w-screen-xl px-4 pb-12 sm:px-6">
        <div className="flex flex-col items-center justify-center gap-6 rounded-2xl bg-white p-8 ring-1 ring-[#e5e5e0] sm:flex-row sm:gap-12">
          <div className="text-center">
            <Globe className="mx-auto size-6" style={{ color: ACCENT }} />
            <p className="mt-2 text-sm font-semibold">Open Food Facts</p>
            <p className="mt-0.5 text-xs text-[#62625b]">
              Powers barcode scanning & the food database
            </p>
          </div>
          <div className="hidden h-10 w-px bg-[#e5e5e0] sm:block" />
          <div className="text-center">
            <Sparkles className="mx-auto size-6" style={{ color: ACCENT }} />
            <p className="mt-2 text-sm font-semibold">Gemini</p>
            <p className="mt-0.5 text-xs text-[#62625b]">
              Powers the AI food search — bring your own key
            </p>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto w-full max-w-screen-xl px-4 pb-14 sm:px-6">
        <h2 className="text-center text-2xl font-bold tracking-[-1px] sm:text-3xl">
          Free, private, and built to fix what other trackers get wrong.
        </h2>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {BENTO.map(({ icon: Icon, title, body, tone, span, big }) => (
            <div
              key={title}
              className={`flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-[#e5e5e0] ${span ?? ""}`}
            >
              <div
                className={`flex min-h-[7rem] flex-1 items-center justify-center ${tone}`}
              >
                <Icon className="size-8 text-white" />
              </div>
              <div className={big ? "min-h-[6.5rem] p-5" : "h-[6.75rem] p-4"}>
                <h3 className={big ? "text-lg font-bold" : "text-base font-semibold"}>
                  {title}
                </h3>
                <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-[#62625b]">
                  {body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-screen-xl px-4 pb-14 sm:px-6">
        <div className="grid items-center gap-8 rounded-2xl bg-white p-8 ring-1 ring-[#e5e5e0] sm:grid-cols-2 sm:gap-12 sm:p-12">
          <div>
            <h2 className="text-2xl font-bold tracking-[-1px] sm:text-3xl">
              Why is it free?
            </h2>
            <div className="mt-4 space-y-4 text-base leading-relaxed text-[#62625b]">
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
          <div className="rounded-2xl bg-[#f6f6f3] p-6">
            <p className="text-lg font-semibold leading-snug">
              Free forever — and honest about what it is.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[#62625b]">
              Deliberate trade-offs make the free possible: no servers to run,
              no cloud database to bill, a free open barcode database, and AI
              that uses your own key — keeping hosting cost to pennies.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[#62625b]">
              It also won't replace science-backed performance trackers like
              MacroFactor. This is the free on-ramp that gets you there.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#262622] text-white">
        <div className="mx-auto w-full max-w-screen-xl px-4 py-14 text-center sm:px-6">
          <h2 className="text-3xl font-bold tracking-[-1px]">
            Free. Because no one should have to pay to remember the food they
            ate.
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-white/70">
            No subscriptions. No ads. Just a tracker that works.
          </p>
          <a
            href="#open-on-phone"
            className="mt-7 inline-flex h-12 items-center justify-center rounded-full px-8 text-sm font-bold text-white transition"
            style={{ backgroundColor: ACCENT }}
          >
            Open on your phone
          </a>
        </div>
      </section>

      <footer className="mx-auto w-full max-w-screen-xl px-4 py-8 sm:px-6">
        <div className="border-t border-[#e5e5e0] pt-6 text-xs text-[#62625b]">
          <p className="font-semibold text-[#211922]">MyLittleGymBro</p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            <a href="/tech" className="hover:text-[#211922]">
              Tech stack
            </a>
            <a href="/legal#terms" className="hover:text-[#211922]">
              Terms
            </a>
            <a href="/legal#privacy" className="hover:text-[#211922]">
              Privacy
            </a>
          </div>
          <p className="mt-2">
            © 2026 MyLittleGymBro · Free & open source · Powered by Open Food
            Facts, AI search by Gemini.
          </p>
        </div>
      </footer>
    </div>
  );
}
