# Plank Battle — setup guide

A daily plank challenge web app: sign in with Google, run the once-a-day timer,
track your history, and battle friends on the tournament board (total time /
average / streak).

You'll do three things: (1) create a free Supabase project, (2) turn on Google
login, (3) run the app. Budget ~15 minutes the first time.

---

## 0. Prerequisites (already done on this machine)

- **Node.js** — installed via Homebrew. Check with `node --version`.
- Dependencies installed (`npm install` was already run).

If you ever move this folder to a new machine: install Node, then run
`npm install` inside the project.

---

## 1. Create a Supabase project

1. Go to <https://supabase.com> → **Sign in** (you can use your Google account).
2. Click **New project**. Pick any name (e.g. `plank-battle`), set a database
   password (save it somewhere — you won't need it day to day), choose the
   region closest to you, and create. Wait ~2 minutes for it to provision.
3. In the project, open **Project Settings → API**. Copy two values:
   - **Project URL** (looks like `https://abcd1234.supabase.co`)
   - **anon public** key (a long string under "Project API keys")

## 2. Add your keys to the app

1. In this folder, copy the example env file:
   ```bash
   cp .env.example .env.local
   ```
2. Open `.env.local` and paste your two values:
   ```
   VITE_SUPABASE_URL=https://abcd1234.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...your-anon-key...
   ```
   `.env.local` is gitignored, so your keys never get committed.

## 3. Create the database tables

1. In Supabase, open **SQL Editor → New query**.
2. Open `supabase_setup.sql` from this folder, copy the whole file, paste it in,
   and click **Run**. This creates the `profiles` and `plank_results` tables,
   the "one run per day" rule, security policies, and the trigger that creates a
   profile automatically on first login. It's safe to re-run.

## 4. Turn on Google login

Supabase manages the Google OAuth flow for you — you just connect a Google app.

1. **In Supabase:** go to **Authentication → Sign In / Providers → Google**,
   toggle it **on**. Leave this tab open — note the **Callback URL** it shows
   (looks like `https://abcd1234.supabase.co/auth/v1/callback`). You'll paste it
   into Google in a moment.
2. **In Google Cloud Console** (<https://console.cloud.google.com>):
   - Create a project (or pick one). 
   - Go to **APIs & Services → OAuth consent screen**, choose **External**, fill
     in app name + your email, and add yourself as a **Test user**.
   - Go to **APIs & Services → Credentials → Create Credentials → OAuth client
     ID → Web application**.
   - Under **Authorized redirect URIs**, paste the Supabase **Callback URL**
     from step 1.
   - Create it. Copy the **Client ID** and **Client secret**.
3. **Back in Supabase** (the Google provider screen): paste the **Client ID** and
   **Client secret**, and **Save**.
4. **Allow the app's address to sign in:** in Supabase go to
   **Authentication → URL Configuration** and add your app URLs to
   **Redirect URLs**:
   - `http://localhost:5173` (for local development)
   - your deployed URL later (see "Going live" below)

## 5. Run it

```bash
npm run dev
```

Open <http://localhost:5173>, click **Continue with Google**, and you're in.
Log a plank — it appears in your results and on the tournament board.

> While testing on your own computer, friends can't reach `localhost`. To put it
> in their hands, deploy it (next section).

---

## Going live (so friends can use it)

The easiest free host is **Vercel** or **Netlify**:

1. Push this folder to a GitHub repo.
2. Import the repo at <https://vercel.com> (or Netlify). It auto-detects Vite.
3. Add the two environment variables (`VITE_SUPABASE_URL`,
   `VITE_SUPABASE_ANON_KEY`) in the host's project settings.
4. Deploy. You'll get a URL like `https://plank-battle.vercel.app`.
5. Add that URL to Supabase **Authentication → URL Configuration → Redirect
   URLs**, and to the Google OAuth client's **Authorized redirect URIs** is not
   needed (that points at Supabase), but do add the site URL to Supabase's
   **Site URL** field.
6. Send friends the link. On iPhone they can tap **Share → Add to Home Screen**
   to get an app icon that opens full-screen.

> Note: while your Google OAuth app is in "testing" mode, only emails you added
> as **Test users** can log in (fine for a friends group — up to 100). To open
> it to anyone, submit the Google consent screen for verification.

---

## How it works (quick tour)

| File | Purpose |
|------|---------|
| `src/components/Login.tsx` | Google sign-in screen |
| `src/components/Timer.tsx` | Stopwatch + once-per-day save |
| `src/components/MyResults.tsx` | Personal history, newest on top |
| `src/components/Leaderboard.tsx` | Tournament: total / average / streak |
| `src/lib/leaderboard.ts` | Ranking + streak math |
| `src/lib/dates.ts` | Local-day + duration formatting |
| `supabase_setup.sql` | Database schema, security rules, profile trigger |

The "one run per day" rule is enforced two ways: the UI locks after you save,
and the database has a `unique (user_id, local_date)` constraint as the real
guard (so it holds even across two devices).
