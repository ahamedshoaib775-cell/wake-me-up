# StopAlert Premium

A real-time train/stop arrival alert app built with React, Vite, Tailwind CSS, Framer Motion, and Supabase.

## Features

- Live stop tracking with progress and ETA
- Configurable alert radius
- Supabase authentication and data persistence
- Glassmorphic UI with neon accent colors

## Setup

### 1. Clone and Install

```bash
git clone https://github.com/ahamedshoaib775-cell/wake-me-up.git
cd stop-alert-premium
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env`:

```
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key
3. Run `supabase-schema.sql` in the Supabase SQL editor to create the tables and RLS policies

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Deploy to Vercel

### Option 1: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ahamedshoaib775-cell/wake-me-up)

### Option 2: Manual Deploy

1. Push to GitHub (already done — remote is `origin`)
2. Go to [vercel.com](https://vercel.com) and import the repository
3. Add environment variables in the Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy

The project includes a `vercel.json` with the Vite framework preset, so Vercel will auto-detect the build command (`npm run build`) and output directory (`dist`).

## Project Structure

```
src/
  supabaseClient.js      # Supabase client instance
  contexts/
    SupabaseProvider.jsx # Auth context and provider
  lib/
    database.js          # Supabase DB helper functions
  App.jsx                # Main application component
  index.css              # Global styles with Tailwind
supabase-schema.sql       # Database schema
vercel.json              # Vercel deployment config
```
