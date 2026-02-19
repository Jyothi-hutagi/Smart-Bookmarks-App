# Smart Bookmark App

A real-time bookmark manager built with Next.js, Supabase, and Tailwind CSS.

## Features

- **Google OAuth** — Sign in with Google (no email/password)
- **Private bookmarks** — Each user's bookmarks are isolated via Row Level Security (RLS)
- **Real-time sync** — Add a bookmark in one tab, it instantly appears in another (Supabase Realtime)
- **Delete bookmarks** — With a two-click confirmation to prevent accidents
- **Favicon display** — Automatically shows site favicon for each bookmark
- **Responsive UI** — Works on mobile and desktop

## Tech Stack

- **Next.js 14** (App Router)
- **Supabase** (Auth, PostgreSQL, Realtime, RLS)
- **Tailwind CSS**
- **Deployed on Vercel**

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/smart-bookmark-app.git
cd smart-bookmark-app
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In the **SQL Editor**, run the contents of `supabase/schema.sql`
3. In **Authentication > Providers**, enable **Google** and add your OAuth credentials
   - Create OAuth credentials at [console.cloud.google.com](https://console.cloud.google.com)
   - Authorized redirect URI: `https://your-project-id.supabase.co/auth/v1/callback`
4. In **Database > Replication**, make sure `bookmarks` table is enabled for Realtime

### 3. Set up environment variables

```bash
cp .env.local.example .env.local
```

Fill in your values from Supabase project settings:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deployment on Vercel

1. Push your code to a public GitHub repo
2. Go to [vercel.com](https://vercel.com) → Import project
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

5. **Update Google OAuth redirect URIs** to include your Vercel URL:
   - In Google Cloud Console, add: `https://your-project-id.supabase.co/auth/v1/callback`
   - In Supabase Auth settings, add your Vercel URL to **Redirect URLs**: `https://your-app.vercel.app/**`

---

## Architecture

```
app/
├── layout.tsx              # Root layout
├── page.tsx                # Redirects to /login or /dashboard
├── login/page.tsx          # Google OAuth login page
├── dashboard/page.tsx      # Server component - loads initial data
└── auth/
    ├── callback/route.ts   # Handles OAuth code exchange
    └── signout/route.ts    # Signs out and redirects

components/
├── BookmarkDashboard.tsx   # Client component with realtime subscription
├── BookmarkForm.tsx        # Add bookmark form
└── BookmarkItem.tsx        # Individual bookmark card

lib/supabase/
├── client.ts               # Browser Supabase client
└── server.ts               # Server Supabase client (uses cookies)

middleware.ts               # Protects /dashboard, redirects logged-in users from /login

supabase/
└── schema.sql              # Database schema + RLS policies
```

## Key Design Decisions

### Why App Router + Server Components?

Initial bookmarks are fetched server-side for instant page load (no loading spinner on first visit). The client then subscribes to realtime updates.

### How does privacy work?

Supabase Row Level Security (RLS) policies ensure users can only `SELECT`, `INSERT`, and `DELETE` their own rows — even if someone had the anon key, they couldn't access other users' bookmarks.

### How does real-time work?

Supabase Realtime uses a WebSocket connection. The `BookmarkDashboard` component subscribes to `postgres_changes` on the `bookmarks` table, filtered to the current `user_id`. Inserts and deletes in any tab instantly update all other open tabs.

### Optimistic updates + deduplication

When a user adds a bookmark, the UI updates immediately (optimistic). The Realtime event also fires, but duplicates are filtered by ID.

---

## Problems I Ran Into & How I Solved Them

### 1. Supabase SSR cookie handling in Next.js 14

**Problem:** The `@supabase/auth-helpers-nextjs` package was deprecated. The new `@supabase/ssr` package has a different API.  
**Solution:** Used `createServerClient` from `@supabase/ssr` with the `cookies()` API from `next/headers`, and created separate `client.ts` / `server.ts` utilities.

### 2. Realtime subscription filter

**Problem:** Supabase Realtime with `filter` only works if RLS is properly set up AND the table is added to the Realtime publication.  
**Solution:** Added `ALTER PUBLICATION supabase_realtime ADD TABLE public.bookmarks;` to the schema and set filter to `user_id=eq.${user.id}`.

### 3. Duplicate entries from optimistic updates + realtime

**Problem:** Adding a bookmark locally and then receiving the same insert from the Realtime channel caused duplicates.  
**Solution:** Added a deduplication check: `if (prev.find((b) => b.id === payload.new.id)) return prev;`

### 4. Google OAuth redirect in production

**Problem:** Google OAuth worked locally but failed on Vercel because the redirect URI wasn't whitelisted.  
**Solution:** Added the production Vercel URL to both Google Cloud Console's authorized redirect URIs and Supabase's allowed redirect URLs.

### 5. `cookies()` async in Next.js 15

**Problem:** In Next.js 15, `cookies()` became async.  
**Solution:** Made `createServerClient()` an async function that `await`s `cookies()`.
