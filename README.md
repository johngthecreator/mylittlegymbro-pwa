# MyLittleGymBro

A free, local-first, AI-assisted macro tracker. Scan groceries, weigh your
home-cooked meals, and ask AI about anything you eat — all without a
subscription, an account, or a cloud database.

## How AI shaped this repo

> This project was built with heavy AI assistance. LLMs (via
> [OpenCode](https://opencode.ai)) served as a proxy for the actual code
> writing — implementing features, components, and fixes from human direction.
> Every technical and architectural decision, however, is human-made: the
> local-first architecture, the tech stack, the data model, the scope, and the
> trade-offs that keep this service free to run.
>
> **Harness:** OpenCode
>
> **Model:** DeepSeek V4 Flash 0731

Heavy AI-assisted development has meaningfully offset the cost of building
this product — the large majority of implementation work was done by an LLM
under human direction. That drop in the cost of technical implementation is a
big part of why this application can be offered for free.

This repo doubles as a case study: can reducing the cost of implementing
consumer tech allow for more cost-effective — and smaller-scale — deployment?
The answer so far leans yes, but only when it's coupled with cost-effective
architectural patterns. Local-first (data on the device) and local-only (no
backend to run) keep the operating cost near zero: static hosting, a free open
data source, and user-supplied AI keys. Cheap to build, cheap to run — that's
the combination that makes "free" sustainable.

## What it is

MyLittleGymBro is a progressive web app that runs entirely in your browser.
There is no backend, no account, and no cloud database — your food library,
daily logs, and recipes live on your device. It covers the day-to-day core of
what subscription health brands charge for: barcode scanning, per-gram
logging, home-cooked meal math, and AI food search.

It's positioned as the entry point for the casual to semi-serious macro
tracker just starting out. It's not a replacement for science-backed,
performance-focused tools like MacroFactor — it's the free on-ramp to them.

## Features

- **Scan barcodes** — point your camera at any package and pull macros from
  Open Food Facts.
- **Log by the gram** — track calories, protein, carbs, and fat for each day.
- **Home-cook mode** — weigh your ingredients and get calories per gram of the
  finished meal, then save it as a loggable recipe.
- **Ask the AI** — web-search any food or restaurant order and add it with one
  tap (bring your own Gemini API key).
- **Nutrition-label autofill** — when a barcode isn't found, photograph the
  label and let AI pre-fill the food.
- **Offline-friendly data** — everything is stored locally in your browser;
  export your entire library to JSON anytime.

## Why it's free

Deliberate trade-offs keep the cost at pennies a month:

- **No servers.** The app is static files served from a CDN.
- **No cloud database.** Data lives in your browser via IndexedDB.
- **Free open data.** Barcode lookups use Open Food Facts.
- **BYOK AI.** Gemini calls use your own API key — no shared infrastructure
  to provision or bill.

For more detail, see the [Tech stack](/tech) page inside the app.

## Tech stack

- **React + Vite + TypeScript** — fast, type-safe PWA
- **Dexie** — IndexedDB wrapper for on-device storage
- **shadcn/ui + Tailwind CSS** — accessible component design system
- **wouter** — tiny client-side router
- **Open Food Facts** — free open barcode/food database
- **Google Gemini (`@google/genai`)** — AI label parsing + web food search

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check + production build
npm run lint     # oxlint
npm run preview  # preview the production build
```

AI features require a Gemini API key, added by the user in **Settings → Gemini
AI**. The key is stored only in that browser's localStorage and is never sent
anywhere except Google's API.

## Project structure

```
src/
  core/          # types, interfaces, constants, errors
  data/          # Dexie db + repositories
  services/      # business logic (food, log, recipe, AI, scanner)
  controllers/   # React hooks wrapping services
  components/    # feature + UI components
  views/         # pages (Today, Scan, Foods, Cook, Ask, Settings, Landing, Legal, Tech Stack)
  di/            # manual dependency injection
```

## Legal

- [Terms of Service](/legal#terms)
- [Privacy Policy](/legal#privacy)

The app is mostly local, with no outside calls aside from Open Food Facts and
your own Gemini API key. Per the terms, we reserve the right to use images,
web searches, and other app data for future products, commercial or
non-commercial.

## License

See the repository license for details.
