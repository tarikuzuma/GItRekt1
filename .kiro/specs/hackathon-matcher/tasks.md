# Implementation Plan: Hackathon Matcher

## Overview

This plan implements the Hackathon Matcher feature on the existing Next.js + Prisma + PostgreSQL stack. It extends the current MVP with an explicit Match model, Conversation-based chat, skill complementarity scoring, event aggregation, real-time notifications, and rate limiting. Tasks are ordered to build foundational layers first (schema, validation, scoring) before wiring them into API endpoints and UI.

## Tasks

- [x] 1. Schema migration and core data models
  - [x] 1.1 Extend Prisma schema with new models and fields
    - Add `Match`, `Conversation`, `ConversationParticipant`, `EventInterest` models
    - Add `sourcePlatform`, `sourceId` fields to `Event` model
    - Add `conversationId` field (nullable) to `ChatMessage` model
    - Add composite unique constraints and indexes as defined in design
    - Add new relations to `User` and `Team` models
    - Run `prisma migrate dev` to apply migration
    - _Requirements: 5.1, 5.3, 6.3, 6.5, 7.2, 8.2_

  - [x] 1.2 Create data migration script for existing ChatMessage records
    - Write a script to create `Conversation` records from existing distinct `chatId` values
    - Populate `conversationId` on all existing `ChatMessage` records
    - Create `ConversationParticipant` records for existing chat participants
    - After migration, update schema to make `conversationId` required
    - _Requirements: 7.2, 7.3_

- [x] 2. Validation library and scoring functions
  - [x] 2.1 Implement profile validation functions (`lib/validation.ts`)
    - Create `validateProfile` function: name 1–100 chars, skills 1–15 items (each 1–30 chars), interests 1–10 items (each 1–30 chars), university/course max 100 chars
    - Create `validateTeam` function: name 1–50 chars, description 0–300 chars, skillsNeeded 0–10 items (each 1–30 chars)
    - Create `validateMessage` function: content 1–2000 chars, reject empty/whitespace-only
    - Return structured error objects with field-level detail
    - _Requirements: 1.2, 1.5, 1.6, 2.1, 2.5, 2.7, 7.6_

  - [x]* 2.2 Write property tests for profile validation
    - **Property 1: Profile validation accepts valid inputs and rejects invalid inputs**
    - **Validates: Requirements 1.2, 1.3, 1.5, 1.6**

  - [x]* 2.3 Write property tests for team validation
    - **Property 2: Team validation accepts valid inputs and rejects invalid inputs**
    - **Validates: Requirements 2.1, 2.5, 2.7**

  - [x]* 2.4 Write property tests for message validation
    - **Property 15: Message content validation**
    - **Validates: Requirements 7.6**

  - [x] 2.5 Implement skill complementarity scoring (`lib/scoring.ts`)
    - Implement `computeUserToTeamScore(userSkills, teamSkillsNeeded)`: intersection / teamSkillsNeeded length, return 0 if denominator is empty
    - Implement `computeUserToUserScore(skillsA, interestsA, skillsB, interestsB)`: 0.4 * sharedInterestRatio + 0.6 * complementarySkillRatio, return 0 if denominator arrays empty
    - Both functions return value in [0.0, 1.0]
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [x]* 2.6 Write property tests for skill complementarity scoring
    - **Property 3: Skill complementarity score is correctly computed and bounded**
    - **Validates: Requirements 9.1, 9.2, 9.3, 9.4**

- [x] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Rate limiting infrastructure
  - [x] 4.1 Implement rate limiter module (`lib/rate-limit.ts`)
    - Create `swipeRateLimit` using Upstash Ratelimit with sliding window (100 per 24h)
    - Create `messageRateLimit` using Upstash Ratelimit with sliding window (50 per 60m)
    - Export helper functions that check limits and return `{allowed, retryAfter}` response
    - _Requirements: 10.1, 10.3, 10.4, 10.5_

  - [x]* 4.2 Write property tests for swipe rate limiting
    - **Property 18: Swipe rate limit enforcement**
    - **Validates: Requirements 10.1, 10.3**

  - [x]* 4.3 Write property tests for message rate limiting
    - **Property 19: Message rate limit enforcement**
    - **Validates: Requirements 10.4**

- [x] 5. Chat ID utility and matching logic
  - [x] 5.1 Implement chat ID derivation (`lib/chat.ts`)
    - Create `deriveChatId(userA, userB)` that sorts IDs lexicographically and joins with underscore
    - Ensure symmetry: `deriveChatId(a, b) === deriveChatId(b, a)`
    - _Requirements: 5.3_

  - [x]* 5.2 Write property tests for chat ID symmetry
    - **Property 11: Conversation ID symmetry**
    - **Validates: Requirements 5.3**

  - [x] 5.3 Implement matching logic (`lib/matching.ts`)
    - Create `checkAndCreateMatch` function: check for reciprocal LIKE, create Match idempotently using unique constraint
    - Handle User-to-User: create DIRECT Conversation, add both as participants
    - Handle User-to-Team: add user as MEMBER to team, create/find GROUP Conversation, add user as participant
    - Check team max size (6 members) before adding
    - Return match result with conversationId
    - _Requirements: 5.1, 5.4, 6.2, 6.3, 6.5, 6.6, 6.8_

  - [x]* 5.4 Write property tests for reciprocal match creation
    - **Property 9: Reciprocal LIKE creates exactly one Match**
    - **Validates: Requirements 5.1, 6.2**

  - [x]* 5.5 Write property tests for no match without reciprocity
    - **Property 10: No match without reciprocity**
    - **Validates: Requirements 5.4, 6.6**

  - [x]* 5.6 Write property tests for team match side effects
    - **Property 12: User-to-team match adds member and grants conversation access**
    - **Validates: Requirements 6.3, 6.5**

- [x] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. API endpoints - Profile and Team
  - [x] 7.1 Update profile API (`app/api/user/profile/route.ts`)
    - Integrate `validateProfile` for POST/PUT requests
    - Return structured validation errors (400) with field details
    - Preserve error format from design (ErrorResponse interface)
    - Handle server errors (500) with form-state preservation message
    - _Requirements: 1.2, 1.3, 1.5, 1.6, 1.7_

  - [x] 7.2 Implement team API (`app/api/teams/route.ts` and `app/api/teams/[teamId]/route.ts`)
    - POST: Create team with validation, assign creator as LEAD
    - PUT: Update team (only Team_Lead authorized), enforce same constraints
    - GET: Return team with members and skills needed
    - Enforce 6-member maximum on add operations
    - _Requirements: 2.1, 2.3, 2.5, 2.6, 2.7_

- [x] 8. API endpoints - Discovery Stack and Swipe
  - [x] 8.1 Rewrite swipable API (`app/api/user/swipable/route.ts`)
    - Exclude self, already-swiped targets, and teams where user is member
    - Compute complementarity scores for all candidates
    - Sort by descending score, limit to 20 cards per batch
    - Support optional `eventId` query param to filter by event interest
    - Return `SwipableResponse` with `cards` and `hasMore`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 9.5, 9.6_

  - [x]* 8.2 Write property tests for discovery stack exclusion
    - **Property 4: Discovery stack excludes already-swiped targets and self**
    - **Validates: Requirements 3.3, 3.4**

  - [x]* 8.3 Write property tests for discovery stack sorting and bounds
    - **Property 5: Discovery stack is sorted by descending complementarity score and bounded to 20**
    - **Validates: Requirements 3.1, 3.2, 9.6**

  - [x]* 8.4 Write property tests for event hub filtering
    - **Property 6: Event hub filter restricts stack to event participants**
    - **Validates: Requirements 3.5**

  - [x] 8.5 Rewrite swipe API (`app/api/swipe/route.ts`)
    - Validate target exists (404 if not), reject self-swipe (400), reject duplicate (409)
    - Check rate limit before recording (429 with retryAfter)
    - Upsert Swipe record with proper fields
    - Call `checkAndCreateMatch` for LIKE swipes
    - Broadcast match notification via Supabase Realtime if match created
    - Return `SwipeResponse` with `success`, `isMatch`, `matchId`
    - _Requirements: 4.1, 4.2, 4.3, 4.5, 4.7, 5.1, 5.4, 5.5, 10.1, 10.3_

  - [x]* 8.6 Write property tests for swipe persistence
    - **Property 7: Swipe persistence correctness**
    - **Validates: Requirements 4.1, 4.2, 4.5**

  - [x]* 8.7 Write property tests for swipe idempotence
    - **Property 8: Swipe idempotence (duplicate rejection)**
    - **Validates: Requirements 4.3**

- [x] 9. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. API endpoints - Messaging
  - [x] 10.1 Implement message send API (`app/api/messages/send/route.ts`)
    - Validate message content using `validateMessage`
    - Check sender is a participant of the conversation (403 if not)
    - Check message rate limit (429 with retryAfter)
    - Persist message to database with conversationId and chatId
    - Deliver via Pusher for real-time (fire-and-forget)
    - _Requirements: 7.1, 7.2, 7.4, 7.6, 10.4, 10.5_

  - [x] 10.2 Implement message history API (`app/api/messages/history/route.ts`)
    - Validate requester is a participant of the conversation (403 if not)
    - Load most recent 50 messages in ascending chronological order
    - Return messages with sender info
    - _Requirements: 7.3, 7.4_

  - [x]* 10.3 Write property tests for conversation access control
    - **Property 13: Conversation access control**
    - **Validates: Requirements 7.4**

  - [x]* 10.4 Write property tests for message ordering and pagination
    - **Property 14: Message ordering and pagination**
    - **Validates: Requirements 7.3**

- [x] 11. API endpoints - Events and Aggregation
  - [x] 11.1 Implement event list API (`app/api/events/route.ts`)
    - GET: Return future events sorted by date ascending, paginated (20 per page)
    - Support `page` and `limit` query params
    - Return `EventListResponse` with `events`, `totalCount`, `page`, `hasMore`
    - _Requirements: 8.3_

  - [x] 11.2 Implement event interest API (`app/api/events/[eventId]/interest/route.ts`)
    - POST: Register user interest in an event (create EventInterest)
    - DELETE: Remove user interest in an event
    - Used by Event_Hub filter in discovery stack
    - _Requirements: 8.4, 8.5_

  - [x] 11.3 Implement event aggregator (`app/api/events/aggregate/route.ts`)
    - Fetch events from Luma, LinkedIn, Facebook APIs
    - Deduplicate by name + date (case-insensitive)
    - Upsert events with sourcePlatform, sourceId, sourceUrl
    - Implement circuit breaker: track failures in Redis, stop after 3 consecutive failures for 1 hour
    - Retry on failure within 15 minutes
    - _Requirements: 8.1, 8.2, 8.6_

  - [x]* 11.4 Write property tests for event deduplication
    - **Property 16: Event deduplication by name and date**
    - **Validates: Requirements 8.2**

  - [x]* 11.5 Write property tests for future events sorting and pagination
    - **Property 17: Future events sorted ascending and paginated**
    - **Validates: Requirements 8.3**

- [x] 12. Vercel Cron configuration and notification wiring
  - [x] 12.1 Configure Vercel Cron for event aggregation
    - Add `vercel.json` cron configuration to trigger `/api/events/aggregate` every 6 hours
    - Add authorization check on the aggregate endpoint (cron secret)
    - _Requirements: 8.1_

  - [x] 12.2 Wire Supabase Realtime match notifications
    - Integrate Supabase broadcast in match creation flow
    - Send `MatchNotificationPayload` to matched users' channels
    - Notify Team_Lead on incoming team interest
    - Notify all team members on new member joining
    - _Requirements: 5.2, 6.1, 6.4_

- [x] 13. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 14. Test infrastructure and helpers
  - [x] 14.1 Set up test infrastructure
    - Install `fast-check` as dev dependency
    - Create `tests/helpers/generators.ts` with fast-check arbitraries for domain types (profiles, teams, skills, swipe requests)
    - Create `tests/helpers/test-db.ts` with Prisma test database setup/teardown utilities
    - Create directory structure: `tests/unit/`, `tests/property/`, `tests/integration/`, `tests/helpers/`
    - _Requirements: All (testing infrastructure)_

  - [x]* 14.2 Write unit tests for edge cases
    - Test profile onboarding flow trigger (Req 1.1)
    - Test team lead authorization for edits (Req 2.3)
    - Test empty stack state response (Req 3.6, 4.6)
    - Test self-swipe rejection (Req 5.5)
    - Test member already on team rejection (Req 6.7)
    - Test full team (6 members) rejection (Req 2.6, 6.8)
    - Test swipe on non-existent target (Req 4.7)
    - Test rate limit response format with time remaining (Req 10.2)
    - _Requirements: 1.1, 2.3, 3.6, 4.6, 4.7, 5.5, 6.7, 6.8, 10.2_

- [x] 15. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties defined in the design (using fast-check with Jest)
- Unit tests validate specific examples and edge cases
- The project uses TypeScript with Next.js App Router, Prisma ORM, Upstash Redis, Pusher, and Supabase Realtime
- Rate limiting uses the existing `@upstash/ratelimit` dependency already in package.json
- All API errors follow the `ErrorResponse` interface defined in the design document

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "14.1"] },
    { "id": 1, "tasks": ["1.2", "2.1", "2.5", "4.1", "5.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "2.4", "2.6", "4.2", "4.3", "5.2", "5.3"] },
    { "id": 3, "tasks": ["5.4", "5.5", "5.6", "7.1", "7.2"] },
    { "id": 4, "tasks": ["8.1", "8.5", "10.1", "10.2", "11.1", "11.2"] },
    { "id": 5, "tasks": ["8.2", "8.3", "8.4", "8.6", "8.7", "10.3", "10.4", "11.3"] },
    { "id": 6, "tasks": ["11.4", "11.5", "12.1", "12.2"] },
    { "id": 7, "tasks": ["14.2"] }
  ]
}
```
