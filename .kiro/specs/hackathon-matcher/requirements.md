# Requirements Document

## Introduction

Hackathon Matcher & Locator is a "Tinder-style" web application that helps individuals find teammates for hackathons through a mutual-interest discovery engine. Users swipe on both individuals and existing teams to form connections, with double opt-in matching. The system also serves as a central hub for discovering upcoming hackathon events via automated aggregation from external platforms.

## Glossary

- **Discovery_Stack**: The unified feed of swipeable cards containing both individual hackers and teams seeking members
- **Matching_Engine**: The serverless backend component responsible for evaluating swipes and determining mutual matches
- **Profile_Service**: The component responsible for creating, reading, and updating user and team profiles
- **Event_Aggregator**: The automated scraping system that collects hackathon event data from external platforms (Luma, LinkedIn, Facebook)
- **Notification_Service**: The real-time component that delivers match alerts and chat messages via WebSockets
- **Swipe**: A user action indicating interest (LIKE) or disinterest (PASS) in another user or team
- **Match**: A connection automatically derived from reciprocal LIKE swipes between two parties
- **Team_Lead**: The team member with the LEAD role who can accept or reject incoming user swipes on behalf of the team
- **Skill_Complementarity**: A scoring metric indicating how well one user's skills fill gaps in another user's or team's skill set
- **Event_Hub**: A filtered view of the Discovery_Stack limited to participants of a specific hackathon event

## Requirements

### Requirement 1: User Profile Creation and Management

**User Story:** As a hacker, I want to create and manage my profile with skills and interests, so that the system can match me with compatible teammates.

#### Acceptance Criteria

1. WHEN a new user completes authentication, THE Profile_Service SHALL present an onboarding flow to collect name, university, course, skills, and interests.
2. WHEN a user submits their onboarding profile with a name between 1 and 100 characters, at least 1 skill, and at least 1 interest, THE Profile_Service SHALL persist the profile data and make the user visible in the Discovery_Stack within 5 seconds.
3. WHILE a user is authenticated, THE Profile_Service SHALL allow the user to update their name, university, course, skills (maximum 15 items), and interests (maximum 10 items) at any time.
4. WHEN a user updates their profile, THE Profile_Service SHALL reflect the changes in the Discovery_Stack within 5 seconds.
5. IF a user submits a profile with an empty skills array or an empty interests array, THEN THE Profile_Service SHALL reject the submission and display a validation error indicating at least one skill and at least one interest are required.
6. IF a user submits a profile with a name that is empty or exceeds 100 characters, or a university or course value that exceeds 100 characters, THEN THE Profile_Service SHALL reject the submission and display a validation error indicating which field failed and its constraint.
7. IF the Profile_Service fails to persist profile data due to a server or database error, THEN THE Profile_Service SHALL display an error message indicating the save failed and SHALL preserve the user's entered data in the form so it can be resubmitted without re-entry.

### Requirement 2: Team Profile Creation and Management

**User Story:** As a team lead, I want to create a team profile listing current members and skills needed, so that compatible hackers can discover and join my team.

#### Acceptance Criteria

1. WHEN an authenticated user creates a team, THE Profile_Service SHALL assign the creating user as the Team_Lead and create a team profile with a name (1–50 characters), description (0–300 characters), and a skills needed list (0–10 skills, each 1–30 characters).
2. WHEN a user opens the Discovery_Stack, THE Profile_Service SHALL display team profiles showing current members (name and skills), and the team's skills needed list.
3. WHILE a user holds the Team_Lead role, THE Profile_Service SHALL allow that user to edit the team name, description, and skills needed, subject to the same length and count limits as creation.
4. WHEN a new member is added to a team, THE Profile_Service SHALL update the team profile to reflect the new member within 3 seconds.
5. IF a user attempts to create a team with a name that is empty or exceeds 50 characters, THEN THE Profile_Service SHALL reject the request and return a validation error indicating the name constraint.
6. IF a user attempts to add a member to a team that already has 6 members, THEN THE Profile_Service SHALL reject the request and return an error indicating the team is full.
7. IF a user attempts to create a team with a skills needed entry that is empty or exceeds 30 characters, THEN THE Profile_Service SHALL reject the request and return a validation error indicating the skill name constraint.

### Requirement 3: Discovery Stack Generation

**User Story:** As a hacker, I want to see a unified feed of individual hackers and teams, so that I can discover potential teammates and projects in a single flow.

#### Acceptance Criteria

1. WHEN an authenticated user opens the Discovery_Stack, THE Matching_Engine SHALL generate a ranked list of no more than 20 swipeable cards per batch, containing both individual users and teams.
2. THE Matching_Engine SHALL rank cards using Skill_Complementarity as the primary sorting factor, where Skill_Complementarity is defined as the number of skills present on the target card that are absent from the current user's skill list, with higher counts ranked first.
3. THE Matching_Engine SHALL exclude cards for users or teams that the current user has already swiped on in any direction (LIKE or PASS).
4. THE Matching_Engine SHALL exclude the user's own profile and any teams where the user is already a member from the Discovery_Stack.
5. WHERE a user has selected an Event_Hub filter, THE Matching_Engine SHALL limit the Discovery_Stack to only users who are registered participants of that event and teams that are linked to that event.
6. WHEN the Discovery_Stack is exhausted (no remaining cards), THE Matching_Engine SHALL display a message indicating no more profiles are available.
7. IF the Matching_Engine fails to generate the Discovery_Stack due to a service or database error, THEN THE Matching_Engine SHALL display an error message indicating the stack could not be loaded and provide the user an option to retry.

### Requirement 4: Swipe Mechanics

**User Story:** As a hacker, I want to swipe right (LIKE) or left (PASS) on profiles, so that I can express interest in potential teammates.

#### Acceptance Criteria

1. WHEN a user swipes LIKE on another user's card, THE Matching_Engine SHALL record a Swipe with direction LIKE, actorId as the swiping user, targetType as USER, and targetUserId as the target.
2. WHEN a user swipes PASS on a card, THE Matching_Engine SHALL record a Swipe with direction PASS and advance to the next card in the Discovery_Stack.
3. IF a user attempts a swipe on a target they have already swiped on, THEN THE Matching_Engine SHALL reject the swipe, retain the existing Swipe record unchanged, and display an error message indicating the swipe is a duplicate.
4. WHEN a swipe is recorded and the Discovery_Stack contains at least one remaining card, THE Matching_Engine SHALL advance the Discovery_Stack to the next card within 300 milliseconds.
5. WHEN a user swipes LIKE on a team's card, THE Matching_Engine SHALL record a Swipe with direction LIKE, actorId as the swiping user, targetType as TEAM, and targetTeamId as the target.
6. IF the Discovery_Stack contains no remaining cards when a swipe is recorded, THEN THE Matching_Engine SHALL display an empty-state message indicating no more profiles are available.
7. IF a user attempts a swipe on a targetUserId or targetTeamId that does not exist, THEN THE Matching_Engine SHALL reject the swipe without recording and return an error message indicating the target was not found.

### Requirement 5: User-to-User Matching

**User Story:** As a hacker, I want to be matched with another hacker when we both express mutual interest, so that we can start communicating immediately.

#### Acceptance Criteria

1. WHEN a user swipes LIKE on another user AND the target user has previously swiped LIKE on the actor, THE Matching_Engine SHALL create exactly one Match record between both users, regardless of how many times either user re-swipes.
2. WHEN a User-to-User Match is created, THE Notification_Service SHALL deliver a match notification to both users via Supabase Realtime within 3 seconds of match creation.
3. WHEN a User-to-User Match is created, THE Matching_Engine SHALL create a one-on-one Conversation record with a unique chatId derived from both user IDs sorted lexicographically.
4. IF a user swipes LIKE but the target user has swiped PASS or has not swiped on the actor at all, THEN THE Matching_Engine SHALL not create a Match and shall not notify either user.
5. IF a user attempts to swipe on themselves, THEN THE Matching_Engine SHALL reject the swipe and return a validation error indicating that self-matching is not permitted.

### Requirement 6: User-to-Team Matching

**User Story:** As a hacker, I want to join a team when both I and the team lead express mutual interest, so that I can immediately participate in the team's group chat and activities.

#### Acceptance Criteria

1. WHEN a user swipes LIKE on a team, THE Matching_Engine SHALL notify the Team_Lead of that team about the incoming interest within 5 seconds of the swipe being recorded.
2. WHEN the Team_Lead swipes LIKE on a user who has previously swiped LIKE on their team, THE Matching_Engine SHALL create a Match between the user and the team within 3 seconds of the Team_Lead's swipe.
3. WHEN a User-to-Team Match is created, THE Profile_Service SHALL add the matched user as a member of the team with the MEMBER role, provided the user is not already a member of that team.
4. WHEN a User-to-Team Match is created, THE Notification_Service SHALL deliver an "It's a Match!" notification to the new member and all existing team members within 5 seconds of match creation.
5. WHEN a User-to-Team Match is created, THE Matching_Engine SHALL grant the new member access to the team's group Conversation by adding them as a participant to the existing team Conversation, or by creating a new group Conversation if none exists.
6. IF the Team_Lead swipes PASS on an interested user, THEN THE Matching_Engine SHALL not create a Match and shall not notify the rejected user.
7. IF a user swipes LIKE on a team of which they are already a member, THEN THE Matching_Engine SHALL reject the swipe and shall not notify the Team_Lead.
8. IF the team has reached a maximum of 6 members at the time a Match would be created, THEN THE Matching_Engine SHALL not add the user to the team and SHALL notify both the Team_Lead and the user that the team is full.

### Requirement 7: Real-Time Chat

**User Story:** As a matched hacker, I want to chat with my matches in real-time, so that we can coordinate and plan for hackathons immediately after connecting.

#### Acceptance Criteria

1. WHEN a user sends a message in a Conversation, THE Notification_Service SHALL deliver the message to all other participants in that Conversation within 1 second.
2. THE Notification_Service SHALL persist all chat messages with senderId, chatId, content (maximum 2000 characters), and timestamp.
3. WHEN a user opens a Conversation, THE Notification_Service SHALL load the most recent 50 messages in chronological order.
4. WHILE a user is not a participant of a Conversation, THE Notification_Service SHALL reject any request to read or send messages in that Conversation and return an access-denied error indication.
5. IF the Notification_Service fails to deliver a message in real-time, THEN THE Notification_Service SHALL persist the message and deliver it when the recipient reconnects.
6. IF a user sends a message with empty content or content exceeding 2000 characters, THEN THE Notification_Service SHALL reject the message and return an error indication specifying the validation failure.

### Requirement 8: Event Discovery and Aggregation

**User Story:** As a hacker, I want to browse upcoming hackathon events from multiple platforms, so that I can find events to attend and discover teammates for those events.

#### Acceptance Criteria

1. THE Event_Aggregator SHALL collect hackathon event data from Luma, LinkedIn, and Facebook at least once every 6 hours.
2. WHEN the Event_Aggregator collects event data, THE Event_Aggregator SHALL store event name, description, date, location, source URL, and source platform identifier, and SHALL deduplicate events that appear on multiple platforms by matching on event name and date.
3. WHEN a user browses the event list, THE Event_Aggregator SHALL display events whose date is in the future, sorted by date in ascending order, in pages of no more than 20 events per page.
4. WHEN a user selects an event, THE Matching_Engine SHALL activate the Event_Hub filter to scope the Discovery_Stack to users who have indicated interest in that event.
5. IF a user selects an event and no users have indicated interest in that event, THEN THE Matching_Engine SHALL display a message indicating that no participants are available for that event yet.
6. IF the Event_Aggregator fails to reach an external platform, THEN THE Event_Aggregator SHALL record the failure with a timestamp and platform identifier, retry within 15 minutes, and continue serving previously collected events without interruption.

### Requirement 9: Skill Complementarity Scoring

**User Story:** As a hacker, I want profiles ranked by how well they complement my skills, so that I see the most relevant matches first.

#### Acceptance Criteria

1. THE Matching_Engine SHALL compute a Skill_Complementarity score in the range 0.0 to 1.0 for each candidate by comparing the user's skills against the candidate's skills needed (for teams) or interests and skills (for users).
2. WHEN computing Skill_Complementarity for a team, THE Matching_Engine SHALL calculate the score as the number of the user's skills that appear in the team's skillsNeeded array divided by the total number of entries in the team's skillsNeeded array.
3. WHEN computing Skill_Complementarity for a user-to-user pair, THE Matching_Engine SHALL calculate the score as the weighted sum of: (a) the proportion of shared interests between the two users (weight 0.4) and (b) the proportion of non-overlapping skills relative to the combined unique skills of both users (weight 0.6).
4. IF a candidate's skillsNeeded array is empty or a user's skills and interests arrays are both empty, THEN THE Matching_Engine SHALL assign a Skill_Complementarity score of 0.0 for that pairing.
5. WHEN a user updates their profile skills or interests, THE Matching_Engine SHALL re-compute Discovery_Stack rankings for that user within 5 seconds of the update being persisted.
6. THE Matching_Engine SHALL sort the Discovery_Stack in descending order of Skill_Complementarity score, placing the candidate with the highest score at the top of the stack.

### Requirement 10: Rate Limiting and Abuse Prevention

**User Story:** As a platform operator, I want to prevent abuse of the swipe and messaging systems, so that users have a fair and spam-free experience.

#### Acceptance Criteria

1. THE Matching_Engine SHALL limit each user to a maximum of 100 swipes (including both LIKE and PASS directions) per 24-hour rolling window.
2. WHEN a user reaches the swipe limit, THE Matching_Engine SHALL display a message indicating the limit has been reached and the time until the user's earliest swipe expires from the rolling window (i.e., when the next swipe becomes available).
3. IF a user attempts to swipe after reaching the 100-swipe limit, THEN THE Matching_Engine SHALL reject the swipe action without recording it and continue to display the time remaining until the next swipe becomes available.
4. THE Notification_Service SHALL limit each user to a maximum of 50 messages per rolling 60-minute window per Conversation.
5. IF a user exceeds the messaging rate limit, THEN THE Notification_Service SHALL reject the message without delivering it, return an error indicating the rate limit has been exceeded, and preserve the message content in the input field so the user can retry after the limit resets.
