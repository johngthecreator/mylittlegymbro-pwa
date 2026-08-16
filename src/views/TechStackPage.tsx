import type { ReactElement } from "react";
import { ArrowLeft, Database, HandCoins, Lock, Rocket, Sparkles } from "lucide-react";

const mono = "font-['IBM_Plex_Mono']";
const display = "font-['Archivo']";

const STACK = [
  {
    name: "React + Vite + TypeScript",
    role: "Frontend",
    note: "A fast, type-safe PWA that ships as static files.",
  },
  {
    name: "Dexie (IndexedDB)",
    role: "Local database",
    note: "Every food, log, and recipe lives in your browser.",
  },
  {
    name: "shadcn/ui + Tailwind CSS",
    role: "UI",
    note: "Accessible components, consistent design system.",
  },
  {
    name: "wouter",
    role: "Routing",
    note: "Tiny client-side router for the single-page app.",
  },
  {
    name: "Open Food Facts",
    role: "Barcode data",
    note: "Free, open product database behind every scan.",
  },
  {
    name: "Google Gemini",
    role: "AI",
    note: "Nutrition-label reading and web food search — you bring your own key.",
  },
];

function Card({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Rocket;
  title: string;
  body: string;
}) {
  return (
    <div className="border-t-2 border-black p-4">
      <Icon className="size-5" />
      <h3 className={`mt-3 ${display} text-sm font-black uppercase tracking-[0.02em]`}>
        {title}
      </h3>
      <p className="mt-2 text-xs leading-[1.8] text-black/55">{body}</p>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2
        className={`${display} text-xl font-black uppercase tracking-[0.02em]`}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function TechStackPage(): ReactElement {
  return (
    <div
      className={`mx-auto w-full max-w-[1600px] px-4 py-8 ${mono} text-[0.875rem] leading-[1.8] tracking-[0.06rem]`}
    >
      <div className="mb-8 flex items-center gap-3">
        <button
          type="button"
          onClick={() => history.back()}
          aria-label="Back"
          className="flex size-10 items-center justify-center border border-black transition hover:bg-black hover:text-white"
        >
          <ArrowLeft className="size-4" />
        </button>
        <h1 className={`${display} text-2xl font-black uppercase tracking-[0.02em]`}>
          Tech stack
        </h1>
      </div>

      <div className="space-y-12">
        <Section title="Local-first by design">
          <div className="space-y-4 text-black/55">
            <p>
              MyLittleGymBro is built as a{" "}
              <strong className="text-black">progressive web app</strong> that
              runs entirely in your browser. There is no account, no backend
              server, and no cloud database. Your food library, daily logs, and
              recipes are stored locally on your device with Dexie on top of
              IndexedDB.
            </p>
            <p>
              The only external calls are deliberate and minimal: Open Food Facts
              for barcode lookups, and Google Gemini for the AI features — which
              use your own API key, so no shared infrastructure needs to be paid
              for or provisioned.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <Card
              icon={Lock}
              title="Privacy"
              body="Your data never leaves your device. No ads, no tracking, no account to compromise."
            />
            <Card
              icon={Database}
              title="Yours"
              body="Export your whole library to JSON anytime. Nothing is locked into a proprietary cloud."
            />
          </div>
        </Section>

        <Section title="The stack">
          <div className="grid gap-6 sm:grid-cols-2">
            {STACK.map((item) => (
              <div key={item.name} className="border-t-2 border-black p-4">
                <p className="text-[0.6875rem] uppercase tracking-[0.13em] text-black/55">
                  {item.role}
                </p>
                <h3
                  className={`mt-2 ${display} text-sm font-black uppercase tracking-[0.02em]`}
                >
                  {item.name}
                </h3>
                <p className="mt-2 text-xs leading-[1.8] text-black/55">{item.note}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Why it costs pennies to run">
          <div className="space-y-4 text-black/55">
            <p>
              Because there is no backend, there is nothing to provision, scale,
              or secure on our side. The entire app is{" "}
              <strong className="text-black">static files</strong> served from a
              CDN — hosting that costs fractions of a cent per request and
              handles any amount of traffic automatically.
            </p>
            <p>
              The barcode database comes from{" "}
              <strong className="text-black">Open Food Facts</strong>, which is
              free and open. AI inference is paid for by the person using it,
              through their own Gemini API key. That means the operating cost of
              this service is effectively the static hosting — cents a month —
              while delivering the core of what subscription health brands charge
              for.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <Card
              icon={HandCoins}
              title="Cost-effective"
              body="No servers, no database fees, no per-user infrastructure. Just static hosting."
            />
            <Card
              icon={Sparkles}
              title="AI without the bill"
              body="Bring-your-own Gemini key means AI features cost you what you use — not a platform markup."
            />
          </div>
        </Section>

        <Section title="The 80%">
          <p className="text-black/55">
            Scan a product, log your meals, track calories and macros by the
            gram, weigh home-cooked recipes, and ask AI about any restaurant
            order. That covers the day-to-day core of what big health apps do —
            minus the subscription, the ads, and the data harvesting.
          </p>
        </Section>
      </div>
    </div>
  );
}
