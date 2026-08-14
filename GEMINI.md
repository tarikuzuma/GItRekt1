# GitRekt - Hackathon Teammate Matcher

## Project Overview
GitRekt is a "Tinder-style" web application designed to help hackers find teammates and discover events. It uses a mutual-interest discovery engine where users can swipe on both individuals and existing teams to form connections.

### Core Technologies
- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (inferred from build artifacts)
- **Database:** Vercel Postgres & Supabase
- **ORM:** Prisma
- **Real-time:** Supabase Realtime / Ably (for chat and "It's a Match!" notifications)
- **Deployment:** Vercel

## Architecture & Features
- **Authentication:** NextAuth.js configured with Prisma Adapter and Supabase Postgres.
- **Database:** Supabase Postgres managed via Prisma.
- **Swipe-Based Matching:** Models for `User`, `Team`, and `Swipe` are defined in `prisma/schema.prisma`.

## Building and Running
| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npx prisma generate` | Generate Prisma client |
| `npx prisma db push` | Push schema changes to Supabase |

## Environment Configuration
Ensure the following variables are set in your `.env` file:
- `DATABASE_URL`: Connection string for the Supabase pooler (port 6543).
- `DIRECT_URL`: Connection string for direct DB access (port 5432).
- `NEXTAUTH_URL`: Usually `http://localhost:3000`.
- `NEXTAUTH_SECRET`: A secure random string for signing cookies.


## Development Status (Critical Note)
As of May 7, 2026, the local workspace appears to be in a partial state:
- **Missing Source Code:** Root directories like `app/` or `src/` are not present locally.
- **Git State:** The local `main` branch is behind `origin/main` by 16 commits. Commit history suggests source code exists in the remote repository or other branches (`backend`, `yuan-front-andback`, `Val-frontend`).
- **Build Artifacts:** An untracked `.next` folder exists, suggesting a previous local build or development session.

## Key Files
- `docs/superpowers/specs/2026-05-06-hackathon-matcher-design.md`: Primary design specification.
- `.env`: Contains Supabase configuration.
- `tsconfig.tsbuildinfo`: TypeScript build metadata.
