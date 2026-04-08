# CourtReview AI

CourtReview AI is a desktop-first admin MVP for post-game youth basketball stat review. Admins upload a full game video, run a mocked AI extraction workflow, review low-confidence events, and only publish official stats after review is complete and scores reconcile.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS
- Prisma + PostgreSQL
- Local mock storage behind an S3-style interface
- Mock AI processing behind service interfaces

## What is implemented

- Admin-only authentication with protected routes
- Team, player, opponent, and game management
- Game roster snapshots
- Video upload metadata flow with local file storage
- Mock AI draft-event generation behind a clean service interface
- Configurable confidence-policy routing into a first-class review queue
- Confirm/correct/skip review actions with persisted review decisions
- Audit log records for every review action
- Official stat rebuilds using only auto-accepted or reviewed events
- Shadow mode on games
- Metrics page with derived operational values
- Seed data for team, roster, games, draft events, review items, audit logs, and official stats

## Quick start

1. Copy environment variables:

```bash
cp .env.example .env
```

2. Start PostgreSQL locally. Docker is included for convenience:

```bash
docker compose up -d db
```

3. Install dependencies:

```bash
npm install
```

4. Generate the Prisma client and push the schema:

```bash
npm run prisma:generate
npm run prisma:push
```

5. Seed the database:

```bash
npm run seed
```

6. Start the app:

```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000)

Default admin credentials come from `.env`:

- email: `admin@courtreview.local`
- password: `changeme`

## Workflow

1. Create a game from `/games/new`.
2. Upload a full game video from the game upload page.
3. Run mock processing on the game detail page.
4. Review flagged events in `/review`.
5. Rebuild official stats or let the workflow mark the game official once pending review reaches zero.
6. Use `/metrics` to monitor review burden and overrides.

## Project structure

- `app/`: Next.js routes and pages
- `components/`: shared admin UI and forms
- `lib/actions.ts`: server actions
- `lib/services/`: domain services for routing, processing, stats, and audit logging
- `lib/mock-ai.ts`: mocked AI extraction implementation
- `lib/storage.ts`: mock S3-style storage interface
- `prisma/schema.prisma`: data model
- `prisma/seed.ts`: sample dataset

## Mocked or stubbed for MVP

- AI event extraction is mocked in `lib/mock-ai.ts`
- Background processing is synchronous behind the `triggerMockProcessing` abstraction
- Video clips are placeholder URLs instead of real extracted subclips
- Storage uses the local filesystem, but the code is shaped like a swappable storage driver

## Recommended next steps

- Replace the mock AI generator with real video inference and clip extraction
- Move processing into a durable background queue
- Add true session storage and multi-admin auth
- Add score-mismatch specific reconciliation tooling and validations
- Add regression tests around stat rebuilding and review routing
