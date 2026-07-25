# Match Management Specification

## Purpose
Enable users to create, discover, join, and manage basketball matches at Badalona courts.

## Requirements

### Requirement: Match Creation
The system MUST allow authenticated users to create basketball matches.

#### Scenario: Create a match
- GIVEN the user is authenticated
- WHEN the user submits match details (court, date, time, duration, max players, level, language)
- THEN a new match is created
- AND the creator is added as the first player
- AND the match appears in the match list

#### Scenario: Validation — past date
- GIVEN the user attempts to create a match
- WHEN the selected date/time is in the past
- THEN the form shows an error
- AND the match is not created

#### Scenario: Validation — court required
- GIVEN the user attempts to create a match
- WHEN no court is selected
- THEN the form shows an error
- AND the match is not created

### Requirement: Match Discovery
The system MUST display upcoming matches in a filterable list.

#### Scenario: View upcoming matches
- GIVEN the user opens the match list
- WHEN the match list loads
- THEN upcoming matches are displayed sorted by date/time
- AND each match shows court name, time, players joined/max, and level

#### Scenario: Filter matches
- GIVEN the user is on the match list
- WHEN the user applies filters (date, level, court, language)
- THEN only matching matches are displayed
- AND filter state is preserved

### Requirement: Match Join
The system MUST allow users to join matches with one tap.

#### Scenario: Join open match
- GIVEN a match has available slots
- WHEN the user taps "Join"
- THEN the user is added to the match
- AND the player count updates in real-time
- AND a confirmation notification is sent

#### Scenario: Join full match — waitlist
- GIVEN a match is at max capacity
- WHEN the user taps "Join"
- THEN the user is added to the waitlist
- AND the user is notified when a slot opens

#### Scenario: Leave match
- GIVEN the user has joined a match
- WHEN the user taps "Leave"
- THEN the user is removed from the match
- AND the next waitlist player is promoted (if any)

### Requirement: Match Cancellation
The system MUST handle match cancellations with notifications.

#### Scenario: Creator cancels match
- GIVEN the match creator cancels the match
- WHEN cancellation is confirmed
- THEN all players receive a cancellation notification
- AND the match is marked as cancelled

#### Scenario: Auto-cancel empty match
- GIVEN a match has 0 players 1 hour before start
- WHEN the auto-cancel check runs
- THEN the match is cancelled
- AND the creator is notified
