# 🧘 Plank Battle

A daily plank challenge between friends. Sign in with Google, run the once-a-day
plank timer, track your history, and compete on a shared tournament board ranked
by **total time**, **average time**, or **streak** (days in a row).

Built with React + Vite + TypeScript and Supabase (Postgres + Google auth).

## Get started

See **[SETUP.md](./SETUP.md)** for the full walkthrough (Supabase project,
Google login, running locally, and deploying so friends can join).

Quick version, once Supabase is configured:

```bash
cp .env.example .env.local   # paste your Supabase URL + anon key
npm run dev                  # http://localhost:5173
```

## Features

- **Google login** via Supabase Auth
- **Daily plank timer** — one saved run per person per day (enforced in the UI
  and by a database constraint)
- **My results** — personal history, newest on top, with a PR marker
- **Tournament board** — switch between total time / average / current streak
