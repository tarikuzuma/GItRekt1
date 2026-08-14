# Design Doc: Hackathon Matcher & Locator (Tinder-esque)

**Date:** 2026-05-06
**Status:** Approved
**Topic:** Swipe-based Hackathon Team Matching and Event Locator

## 1. Executive Summary
A "Tinder-style" web application designed to help individuals find teammates for hackathons through a mutual-interest discovery engine. Users swipe on both individuals and existing teams to form connections. It also serves as a central hub for discovering hackathon events.

## 2. Architecture
*   **Platform:** Next.js (TypeScript) deployed on **Vercel**.
*   **Database:** **Vercel Postgres** for relational data (Users, Teams, Events, Swipes).
*   **API:** Next.js Serverless Functions for backend logic and matching.
*   **Real-time:** WebSockets (via Ably or Supabase Realtime) for "It's a Match!" notifications and group chat.

## 3. Core Features

### 3.1 Unified User & Team Profiles
*   **Profiles:** Highlight **Hard Skills** (e.g., React, Go) and **Interests**.
*   **Team Entities:** Teams can also have "Profiles" showing current members and "Skills Needed."

### 3.2 Swipe-Based Matching (The Discovery Stack)
*   **Unified Stack:** A single feed containing both individual hackers and teams looking for members.
*   **Matching Algorithm:** Prioritizes cards based on skill complementarity and event proximity.
*   **Mutual Interest (Double Opt-In):**
    *   **User ↔ User:** If both swipe right, a 1-on-1 chat is created.
    *   **User ↔ Team:** If a user swipes right on a team and the Team Lead swipes right on that user, the user is automatically added to the team and its group chat.
*   **Filtering:** Users can filter their stack globally or by a specific Hackathon Event.

### 3.3 Event Locator & Discovery
*   **Aggregator:** Automated scrapers for **Luma, LinkedIn, and Facebook**.
*   **Event Hubs:** Filtering the discovery stack to only show participants of a specific event.

## 4. Data Model Highlights
*   **Users:** ID, Name, Profile Info, Skills[], Interests[].
*   **Teams:** ID, Name, MemberIDs[], EventID (optional), SkillsNeeded[].
*   **Swipes:** ActorID (User), TargetID (User or Team), TargetType (USER/TEAM), Direction (LIKE/PASS).
*   **Matches:** Automatically derived from reciprocal `LIKE` swipes.
*   **Conversations:** Created immediately upon a match.

## 5. Success Criteria
*   Seamless "Swipe-to-Chat" transition.
*   High engagement through a unified feed of both teammates and projects.
*   Immediate integration into group dynamics upon a Team match.