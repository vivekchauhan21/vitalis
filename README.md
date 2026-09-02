# Health & Safety Companion

A calm, accessible multimodal first-aid companion for minor campus medical emergencies and safety hazards.

## Setup

Install dependencies with `pnpm install`, copy `.env.example` to `.env.local`, and set the server-only `GEMINI_API_KEY`. Start the development server with `pnpm dev`.

## Safety

The app is not a replacement for emergency services or professional medical care. The Gemini key is read only by server routes; descriptions and contacts are never logged.

## Checks

Run `pnpm lint`, `pnpm test`, and `pnpm build` before shipping. For Cloud Run, build the Next app in a Node 20 container, provide `GEMINI_API_KEY` through Secret Manager, expose port 8080, and run `pnpm start`.
