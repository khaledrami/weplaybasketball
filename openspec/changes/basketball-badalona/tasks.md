# Tasks: WePlayBasketball

## Phase 1: Foundation

### Task 1.1: Project Setup + Supabase + i18n
- **Spec refs**: internationalization/spec.md
- **Files**: `app/`, `lib/supabase.ts`, `lib/i18n.ts`, `locales/ca.json`, `locales/es.json`, `app.json`, `tsconfig.json`
- **Acceptance**: Expo project runs on iOS/Android/Web, Supabase client connected, language switching between ca/es works, basic tab navigation renders
- **Size**: ~500 lines

### Task 1.2: Auth (Google/Apple/Email)
- **Spec refs**: player-profiles/spec.md (Requirement: Profile Creation)
- **Files**: `app/(auth)/login.tsx`, `app/(auth)/register.tsx`, `lib/supabase.ts`, `components/auth/`
- **Acceptance**: Google sign-in works, Apple sign-in works, email/password works, session persists across restarts
- **Size**: ~600 lines

### Task 1.3: Profile CRUD
- **Spec refs**: player-profiles/spec.md (Requirements: Profile Creation, Skill Level System)
- **Files**: `app/(tabs)/profile/`, `components/profile/`, `lib/types.ts`
- **Acceptance**: Create profile on first login, edit profile, view own stats, 5 levels displayed correctly
- **Size**: ~700 lines

### Task 1.4: Court Database Seed
- **Spec refs**: court-map/spec.md (Requirement: Court Data Integrity)
- **Files**: `supabase/seed.sql`, `supabase/migrations/001_courts.sql`
- **Acceptance**: All 56+ courts inserted with correct data, geohash computed, access types classified, sources documented
- **Size**: ~400 lines (data-heavy, low logic)

### Task 1.5: Court Map
- **Spec refs**: court-map/spec.md (Requirements: Court Display, Court Detail, Court Search)
- **Files**: `components/map/`, `app/(tabs)/map/`, `lib/geohash.ts`
- **Acceptance**: Map shows all courts with color markers, tap opens detail, search works, clustering at zoom levels
- **Size**: ~800 lines

## Phase 2: Core Match Flow

### Task 2.1: Match Creation
- **Spec refs**: match-management/spec.md (Requirement: Match Creation)
- **Files**: `app/(tabs)/matches/create.tsx`, `components/match/MatchForm.tsx`, `lib/types.ts`
- **Acceptance**: Create match with all fields, validation works, creator auto-joined, match appears in list
- **Size**: ~700 lines

### Task 2.2: Match List + Detail
- **Spec refs**: match-management/spec.md (Requirement: Match Discovery)
- **Files**: `app/(tabs)/matches/index.tsx`, `app/(tabs)/matches/[id].tsx`, `components/match/MatchCard.tsx`
- **Acceptance**: Upcoming matches listed sorted by date, filters work, detail shows all info
- **Size**: ~600 lines

### Task 2.3: Match Join/Leave + Waitlist
- **Spec refs**: match-management/spec.md (Requirements: Match Join, Match Cancellation)
- **Files**: `components/match/JoinButton.tsx`, `lib/match-helpers.ts`
- **Acceptance**: One-tap join, waitlist when full, leave removes player, next waitlist promoted, cancellation sends notifications
- **Size**: ~600 lines

### Task 2.4: Real-time Chat
- **Spec refs**: real-time-chat/spec.md (all requirements)
- **Files**: `components/chat/ChatRoom.tsx`, `components/chat/MessageBubble.tsx`, `lib/realtime.ts`
- **Acceptance**: Send/receive messages in real-time, history loads, chat read-only after match, offline sync works
- **Size**: ~800 lines

### Task 2.5: Push Notifications
- **Spec refs**: notifications/spec.md (all requirements)
- **Files**: `lib/notifications.ts`, `supabase/functions/send-reminder/index.ts`, `app/settings/notifications.tsx`
- **Acceptance**: 24h/6h/1h reminders fire, join/cancel notifications work, chat notifications work, preferences save
- **Size**: ~700 lines

## Phase 3: Social + Quality

### Task 3.1: Post-Match Ratings
- **Spec refs**: player-profiles/spec.md (Requirement: Post-Match Ratings)
- **Files**: `components/rating/RatingFlow.tsx`, `lib/rating-helpers.ts`
- **Acceptance**: Rating screen appears after match, 3 categories per player, anonymous, skip works, level adjusts
- **Size**: ~600 lines

### Task 3.2: Team Balancing
- **Spec refs**: match-management/spec.md (implicit — auto-team feature)
- **Files**: `lib/team-balance.ts`, `components/match/AutoTeamButton.tsx`
- **Acceptance**: "Create teams automatically" button splits players by height/level/position/rating, teams shown on match detail
- **Size**: ~500 lines

### Task 3.3: Social Features
- **Spec refs**: (implicit from proposal — friendships, share)
- **Files**: `components/social/`, `app/(tabs)/social/`, `lib/types.ts`
- **Acceptance**: Add friend, accept/reject, share match link, follow player
- **Size**: ~700 lines

## Phase 4: Admin + Polish (Post-MVP)

### Task 4.1: Court Photo Uploads
- **Spec refs**: court-map/spec.md (Court photos scenario)
- **Files**: `components/court/PhotoUpload.tsx`, `lib/storage.ts`
- **Acceptance**: Upload photo to Supabase Storage, display in court gallery, community verified badge
- **Size**: ~500 lines

### Task 4.2: Admin Panel
- **Files**: `app/admin/`, `lib/admin.ts`
- **Acceptance**: Add/edit/delete courts, manage users, moderate chats, export stats
- **Size**: ~800 lines

## Summary

| Phase | Tasks | Est. Lines | PRs |
|-------|-------|-----------|-----|
| Phase 1: Foundation | 5 | ~3,000 | 5 |
| Phase 2: Core Match Flow | 5 | ~3,400 | 5 |
| Phase 3: Social + Quality | 3 | ~1,800 | 3 |
| Phase 4: Admin (Post-MVP) | 2 | ~1,300 | 2 |
| **Total** | **15** | **~9,500** | **15** |
