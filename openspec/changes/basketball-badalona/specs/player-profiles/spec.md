# Player Profiles Specification

## Purpose
Manage user profiles with basketball-specific attributes, skill levels, and reputation.

## Requirements

### Requirement: Profile Creation
The system MUST create a profile upon first authentication.

#### Scenario: New user onboarding
- GIVEN a user authenticates for the first time
- WHEN the onboarding flow completes
- THEN a profile is created with: name, age, preferred position, dominant hand
- AND a default skill level of "Intermedi" is assigned
- AND the profile is visible to other users

#### Scenario: Profile — optional fields
- GIVEN a user is completing onboarding
- WHEN the user skips height, languages, or photo
- THEN the profile is created without those fields
- AND the user can complete them later

### Requirement: Skill Level System
The system MUST classify players into 5 levels.

#### Scenario: Level display
- GIVEN a user views a player profile
- WHEN the profile loads
- THEN the skill level is displayed as one of: Muy principiante, Principiante, Intermedi, Avançat, Competitiu

#### Scenario: Level adjustment
- GIVEN a player receives ratings after a match
- WHEN the average rating crosses a level threshold
- THEN the player's level is updated
- AND the player is notified of the change

### Requirement: Player Stats
The system MUST track and display player statistics.

#### Scenario: View own stats
- GIVEN the user views their profile
- WHEN the stats section loads
- THEN the following are displayed: matches played, hours played, win rate, streak, MVPs, attendance rate

#### Scenario: View other player stats
- GIVEN a user views another player's profile
- WHEN the profile loads
- THEN matches played, level, and rating are visible
- AND personal details (age, height) are only visible if the other player has made them public

### Requirement: Post-Match Ratings
The system MUST collect ratings after each match.

#### Scenario: Rate after match
- GIVEN a match has ended
- WHEN a player opens the rating screen
- THEN they can rate each teammate on: punctuality, sportsmanship, actual level (1-5 stars)
- AND ratings are anonymous (rated player cannot see who rated them)

#### Scenario: Skip rating
- GIVEN a match has ended
- WHEN a player skips the rating screen
- THEN no ratings are submitted for that player
- AND the rating prompt is shown again at next login (within 48h)
