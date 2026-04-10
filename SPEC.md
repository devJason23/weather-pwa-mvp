# HoopSmith -- Codex Spec

Build a production-quality MVP web app called **HoopSmith**.

## Goal

Build a desktop-first web application for **post-game basketball stat processing** for a youth basketball organization. The product is an **AI-assisted stat review workflow**, not a live stats app.

Admins upload a full game video. The system generates **draft** events and draft stats using AI, routes uncertain or conflicting events into a **human review queue**, and only marks stats as **official** after review is complete and the score is reconciled. Players and parents must never see false or unreviewed stats. The product should prioritize trust, auditability, and later model improvement through stored human corrections.

## Context

This app is for multiple basketball teams with many games per year. The highest priorities are:

1. Correct final team score
2. Correct player points
3. Fast human review of uncertain plays
4. Clean separation between draft and official data
5. Storing corrections as future training and evaluation data

Do not optimize for flashy UI or consumer-facing features. Optimize for operational accuracy and speed of review.

## Tech stack

Use the following stack:

- Next.js with App Router and TypeScript
- Tailwind CSS
- Postgres via Prisma
- S3-compatible storage interface for video files
- Background job abstraction for video processing
- Clean modular architecture so AI services can be mocked now and replaced later
- Zod for validation
- React Server Components where appropriate
- Minimal, clean admin UI

If needed for MVP, stub or mock the actual computer vision and AI processing layer behind interfaces, but the product workflow, schema, and review pipeline should be fully real and usable.

## Build requirements

Implement a working MVP with the following capabilities.

### 1. Authentication

Simple admin-only authentication for MVP.

- Protected admin area
- No public user authentication yet

### 2. Teams, players, and rosters

Allow admins to manage:

- Teams
- Players
- Jersey numbers
- Opponents
- Games

Each game should include:

- Team
- Opponent
- Date
- Location (optional)
- Roster snapshot for that game
- Team colors and opponent colors
- Status: Draft, In Review, Official

### 3. Video upload workflow

Admins can:

- Create or select a game
- Upload a full game video
- See upload status
- Trigger processing
- View processing states:
  - Uploaded
  - Queued
  - Processing
  - Draft Ready
  - Review Needed
  - Official

Use mock processing workers if needed, but structure the code so real workers can be added later.

### 4. AI event pipeline abstraction

Design an abstraction layer for AI-generated events.

The system should support draft events like:

- Shot attempt
- Shot made
- Shot missed
- Free throw
- 2PT / 3PT classification
- Proposed scoring player
- Team assignment
- Confidence score
- Review reason triggers

Do not hardcode logic into UI components. Put AI event generation behind services and interfaces.

### 5. Draft / review / official separation

This is a hard requirement:

- Draft data is internal only
- In Review data is internal only
- Official data is the only publishable state
- No uncertain data should appear as final
- Official status can only be set after review completion and score reconciliation

### 6. Review queue

Build a first-class review queue.

Each review item must include:

- Linked game
- Timestamp
- Short clip placeholder or clip URL field
- AI-predicted event type
- AI confidence score
- Proposed player
- Proposed team
- Proposed shot result
- Proposed shot type
- Review reason
- Status: pending / confirmed / corrected / skipped

Reviewer actions:

- Confirm
- Change player
- Change team
- Change made/missed
- Change shot type (2PT / 3PT / FT)
- Mark no event
- Add note
- Select correction reason
- Save and move next

Also implement:

- Next/previous review navigation
- Filters by game, confidence band, status, and event type
- Keyboard shortcut support if practical

### 7. Confidence policy

Implement configurable confidence thresholds by event type.

Initial default policy:

- Team assignment: auto-accept only above 90
- Shot attempt detection: auto-accept only above 85
- Made vs missed: auto-accept only above 90
- Player identity on scoring play: auto-accept only above 92
- 2PT vs 3PT classification: auto-accept only above 90
- Free throw detection: auto-accept only above 88
- Any score mismatch: always review
- Any identity conflict: always review
- Rebounds, assists, steals, and blocks: not official MVP stats; keep them out of the official workflow for now

Store thresholds in configuration, not as constants buried in code.

### 8. Official box score generation

For MVP, official stats should support:

- Team final score
- Player points
- FGM / FGA
- 3PM / 3PA
- FTM / FTA
- Event timeline

Only reviewed or accepted events should contribute to official stats.

### 9. Audit trail

Every review action must create an audit trail record:

- Original AI prediction
- Confidence score
- Reviewer action
- Final corrected value
- Timestamp
- Reason code
- Reviewer ID

This is required because corrected outputs should become evaluation and training signals later.

### 10. Shadow mode

Add a game-level or environment-level **shadow mode**:

- AI predictions run
- Draft and review data is stored
- Nothing is published externally
- Useful for early calibration and testing

### 11. Metrics page

Build an internal admin metrics page showing:

- Games processed
- Games awaiting review
- Review items pending
- Override rate
- Review items per game
- Top review reasons
- Auto-accepted vs reviewed counts

Simple charts or summary cards are enough.

## Data model

Design a Prisma schema for at least these entities:

- AdminUser
- Team
- Player
- Opponent
- Game
- GameRosterPlayer
- VideoAsset
- ProcessingJob
- DraftEvent
- ReviewItem
- ReviewDecision
- OfficialStatLine
- ConfidencePolicy
- AuditLog

Use enums where appropriate for:

- Game status
- Processing status
- Event type
- Review status
- Review reason
- Correction reason

Make the schema clean and extensible.

## UX requirements

Build a clean, serious admin interface.

Pages required:

- Admin dashboard
- Teams / players management
- Games list
- New game / upload page
- Processing detail page
- Review queue page
- Official game detail page
- Metrics page

UI principles:

- Clearly label Draft / In Review / Official everywhere
- Surface confidence scores and review reasons clearly
- Make the review flow fast and obvious
- Avoid clutter
- Desktop-first but responsive
- Use tables where useful, but do not overdo them

## Architecture constraints

- Keep business logic out of UI components
- Use server actions or route handlers cleanly
- Separate domain logic, persistence, and presentation
- Create a service layer for:
  - video ingestion
  - AI event generation
  - review routing
  - official stat calculation
  - audit logging
- Make it easy to swap mock AI with real inference later
- Add seed data for at least:
  - 1 team
  - 8 to 10 players
  - 1 opponent
  - 2 games
  - sample draft events
  - sample review items

## Non-goals

Do not build:

- Live game tracking
- Parent/player public portal
- Real-time streaming inference
- Highlights
- Full advanced stats
- Rebounds, assists, steals, or blocks as official MVP outputs
- Automatic retraining pipeline

## Implementation guidance

If the repository is empty, scaffold the full app.

If the repository already exists:

- Inspect the codebase first
- Reuse existing conventions
- Make incremental changes
- Avoid unnecessary rewrites

Use pragmatic defaults.
Prefer shipping a coherent MVP over building unnecessary abstractions.

## Done when

The task is complete when all of the following are true:

- App runs locally without errors
- Prisma schema is implemented and migrated
- Seed script populates sample data
- Admin can create a game and upload a video record
- Processing workflow can create mock draft events
- Review queue works end-to-end
- Reviewer can confirm or correct plays
- Official stats are computed only from accepted or reviewed events
- Audit trail is persisted
- Metrics page shows real derived values from stored data
- Code is organized and readable
- Basic validation and error handling exist
- README explains how to run, seed, and use the MVP

## Working style

Do the work, do not stop at a plan.
Inspect the codebase, implement the feature end-to-end, run tests where possible, and leave the project in a usable state. Avoid long status preambles. Prefer concrete edits over speculative discussion.

If something is ambiguous, make a sensible product and engineering choice consistent with the goal: a **trusted post-game review workflow for basketball stats**.

## Optional final instruction

At the end, provide:

- a short summary of what was built
- key files changed
- anything stubbed/mocked for MVP
- next recommended implementation steps
