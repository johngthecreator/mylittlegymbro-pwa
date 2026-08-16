import type { ReactElement } from "react";
import { ArrowLeft, Database, HandCoins, Lock, Rocket, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <div className="rounded-2xl bg-muted p-5">
      <Icon className="size-6 text-primary" />
      <h3 className="mt-3 text-base font-bold">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

export default function TechStackPage(): ReactElement {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => history.back()}
          aria-label="Back"
        >
          <ArrowLeft />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Tech stack</h1>
      </div>

      <div className="space-y-8">
        <section className="space-y-3">
          <h2 className="text-xl font-bold tracking-tight">
            Local-first by design
          </h2>
          <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>
              MyLittleGymBro is built as a{" "}
              <strong className="text-foreground">progressive web app</strong>{" "}
              that runs entirely in your browser. There is no account, no
              backend server, and no cloud database. Your food library, daily
              logs, and recipes are stored locally on your device with Dexie on
              top of IndexedDB.
            </p>
            <p>
              The only external calls are deliberate and minimal: Open Food
              Facts for barcode lookups, and Google Gemini for the AI features —
              which use your own API key, so no shared infrastructure needs to be
              paid for or provisioned.
            </p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
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
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold tracking-tight">The stack</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {STACK.map((item) => (
              <div key={item.name} className="rounded-2xl bg-muted p-5">
                <p className="text-xs font-semibold tracking-wide text-primary uppercase">
                  {item.role}
                </p>
                <h3 className="mt-1 text-base font-bold">{item.name}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {item.note}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold tracking-tight">
            Why it costs pennies to run
          </h2>
          <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>
              Because there is no backend, there is nothing to provision,
              scale, or secure on our side. The entire app is{" "}
              <strong className="text-foreground">static files</strong> served
              from a CDN — hosting that costs fractions of a cent per request and
              handles any amount of traffic automatically.
            </p>
            <p>
              The barcode database comes from{" "}
              <strong className="text-foreground">Open Food Facts</strong>, which
              is free and open. AI inference is paid for by the person using it,
              through their own Gemini API key. That means the operating cost of
              this service is effectively the static hosting — cents a month —
              while delivering the core of what subscription health brands charge
              for.
          </p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
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
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold tracking-tight">The 80%</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Scan a product, log your meals, track calories and macros by the
            gram, weigh home-cooked recipes, and ask AI about any restaurant
            order. That covers the day-to-day core of what big health apps do —
            minus the subscription, the ads, and the data harvesting.
          </p>
        </section>
      </div>
    </div>
  );
}
