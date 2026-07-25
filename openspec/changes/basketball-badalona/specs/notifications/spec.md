# Notifications Specification

## Purpose
Notify users about match events, reminders, and social interactions via push notifications.

## Requirements

### Requirement: Match Reminders
The system MUST send push notifications before match start.

#### Scenario: 24-hour reminder
- GIVEN a user has joined a match
- WHEN 24 hours remain before match start
- THEN a push notification is sent: "Tomorrow at {time} — {court_name}"

#### Scenario: 6-hour reminder
- GIVEN a user has joined a match
- WHEN 6 hours remain before match start
- THEN a push notification is sent: "Today at {time} — {court_name}"

#### Scenario: 1-hour reminder
- GIVEN a user has joined a match
- WHEN 1 hour remains before match start
- THEN a push notification is sent: "Starting in 1 hour — {court_name}"

### Requirement: Match Updates
The system MUST notify users of match changes.

#### Scenario: Player joins
- GIVEN a user has created or joined a match
- WHEN another player joins
- THEN the creator and existing players receive a notification
- AND the notification shows the new player's name

#### Scenario: Match cancelled
- GIVEN a user has joined a match
- WHEN the match is cancelled
- THEN all participants receive a cancellation notification
- AND the notification includes the reason (if provided)

### Requirement: Chat Notifications
The system MUST notify users of new chat messages.

#### Scenario: New message notification
- GIVEN a user is a participant in a match
- WHEN a new message is posted and the user is not viewing the chat
- THEN a push notification is sent with the sender name and message preview
- AND the notification opens the chat when tapped

### Requirement: Notification Preferences
The system MUST allow users to control notification settings.

#### Scenario: Disable reminders
- GIVEN a user opens notification settings
- WHEN the user disables match reminders
- THEN no reminder notifications are sent
- AND other notifications (match updates, chat) remain active

#### Scenario: Quiet hours
- GIVEN a user has set quiet hours (e.g., 22:00–08:00)
- WHEN a notification would be sent during quiet hours
- THEN the notification is queued
- AND delivered at the end of the quiet period
