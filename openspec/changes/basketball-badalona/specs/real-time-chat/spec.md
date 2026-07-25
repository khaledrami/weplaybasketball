# Real-time Chat Specification

## Purpose
Enable per-match real-time messaging for coordination and social interaction.

## Requirements

### Requirement: Match Chat Room
The system MUST create a chat room for each match.

#### Scenario: Chat room creation
- GIVEN a match is created
- WHEN the match is saved
- THEN a chat room is associated with the match
- AND all match participants can access the chat

#### Scenario: Access control
- GIVEN a user is not a participant in a match
- WHEN the user attempts to access the match chat
- THEN access is denied
- AND the chat is not visible

### Requirement: Message Sending
The system MUST allow participants to send text messages.

#### Scenario: Send message
- GIVEN a user is a participant in a match
- WHEN the user types and sends a message
- THEN the message appears in the chat for all participants
- AND the message is persisted in the database
- AND offline participants receive a notification

#### Scenario: Empty message
- GIVEN a user attempts to send a message
- WHEN the message content is empty or whitespace-only
- THEN the send button is disabled
- AND no message is sent

### Requirement: Real-time Delivery
The system MUST deliver messages in real-time via Supabase Realtime.

#### Scenario: Live message delivery
- GIVEN multiple users are viewing the same match chat
- WHEN one user sends a message
- THEN all other users see the message appear instantly (<1 second)
- AND no page refresh is required

#### Scenario: Offline message sync
- GIVEN a user was offline
- WHEN the user comes back online and opens the chat
- THEN all messages sent while offline are loaded
- AND messages are displayed in chronological order

### Requirement: Message History
The system MUST persist and display chat history.

#### Scenario: Load chat history
- GIVEN a user opens a match chat
- WHEN the chat loads
- THEN the most recent 50 messages are displayed
- AND older messages load on scroll-up (pagination)

#### Scenario: Chat after match
- GIVEN a match has ended
- WHEN a participant opens the chat
- THEN the full chat history is still accessible
- AND no new messages can be sent (chat is read-only after match)
