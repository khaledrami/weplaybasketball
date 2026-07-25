# Proposal: WePlayBasketball — Badalona Basketball Match-Making App

## 1. Change Intent

Build a mobile + web application that lets anyone in Badalona find people to play basketball within 60 seconds of opening the app. Not a court booking system — a people-finding system.

Badalona has 56+ basketball courts, 12+ clubs, and is the basketball capital of Catalonia. Yet organizing casual pickup games relies on WhatsApp groups and chance. This app bridges that gap.

**Differentiator**: "Waze of Street Basketball" — real-time court status, AI recommendations, and spontaneous play modes that no existing app offers.

## 2. Scope

### IN (MVP — Phase 1-3)
- Interactive map of all 56+ verified Badalona courts
- Court detail pages (access type, conditions, photos)
- Match creation and joining
- Real-time per-match chat
- Player profiles with 5-level system
- Post-match ratings
- Push notifications (24h, 6h, 1h reminders)
- i18n: Català + Castellano
- Basic team balancing

### OUT (Post-MVP)
- Admin panel (Phase 4)
- AI court recommendations
- Recurring matches
- Telegram integration
- Gamification (badges, rankings)
- "Shooting hoops" mode
- Real-time court occupancy via check-ins
- Advanced statistics

## 3. Technical Approach

### Architecture
```
┌─────────────────────────────────────────────┐
│  React Native (Expo) + TypeScript           │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐ │
│  │ Map View │  │ Match    │  │ Profile   │ │
│  │ (GMaps)  │  │ Views    │  │ Views     │ │
│  └────┬─────┘  └────┬─────┘  └─────┬─────┘ │
│       │              │              │        │
│  ┌────┴──────────────┴──────────────┴────┐  │
│  │        Supabase Client SDK            │  │
│  │   (Auth, DB, Realtime, Storage)       │  │
│  └───────────────┬───────────────────────┘  │
└──────────────────┼──────────────────────────┘
                   │
┌──────────────────┼──────────────────────────┐
│  Supabase Cloud                             │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐ │
│  │PostgreSQL│  │ Auth     │  │ Storage   │ │
│  │ + RLS    │  │ (Go/Apple│  │ (photos)  │ │
│  │          │  │  Email)  │  │           │ │
│  └──────────┘  └──────────┘  └───────────┘ │
│  ┌──────────┐  ┌──────────┐                │
│  │ Realtime │  │ Edge     │                │
│  │ (chat)   │  │ Functions│                │
│  └──────────┘  └──────────┘                │
└─────────────────────────────────────────────┘
```

### Key Decisions
1. **Supabase over custom backend**: Faster to MVP, built-in auth/realtime/RLS
2. **Google Maps primary, OSM fallback**: Better UX in Spain, OSM as cost fallback
3. **Court data as seed**: Pre-populate all 56+ courts from verified sources
4. **Geohash for proximity**: Enable "near me" queries without spatial extensions
5. **Edge functions for notifications**: Match reminders, balance algorithm

### Database Schema (Key Tables)
- `profiles` — extends auth.users with basketball profile
- `courts` — 56+ verified Badalona courts
- `matches` — game sessions with metadata
- `match_players` — join table with team assignment
- `messages` — per-match real-time chat
- `ratings` — post-match player evaluations
- `friendships` — social connections
- `check_ins` — court occupancy (post-MVP)

## 4. Delivery Phases (Chained PRs)

### Phase 1: Foundation (PRs ~600-800 lines each)
**PR 1.1**: Project setup + Supabase config + i18n
- Expo project init, TypeScript config
- Supabase client setup, environment config
- i18n structure (ca + es)
- Basic navigation (tab + stack)

**PR 1.2**: Auth + Profiles
- Google/Apple/Email auth via Supabase
- Profile creation (name, age, height, position, hand, level)
- Profile editing

**PR 1.3**: Court database + Map
- Seed 56+ courts into Supabase
- Interactive map with markers (green/red/yellow)
- Court detail screen
- Basic search/filter

### Phase 2: Core Match Flow (PRs ~600-800 lines each)
**PR 2.1**: Match creation
- Create match form (court, date, time, duration, max players, level, language)
- Match list view (upcoming matches)
- Match detail screen

**PR 2.2**: Join + Chat
- One-click join/leave
- Waitlist when full
- Real-time per-match chat (Supabase Realtime)

**PR 2.3**: Notifications + Reminders
- Firebase push notification setup
- 24h/6h/1h match reminders
- New message notifications

### Phase 3: Social + Quality (PRs ~600-800 lines each)
**PR 3.1**: Ratings + Levels
- Post-match rating flow
- 5-level system calculation
- Player stats display

**PR 3.2**: Team balancing
- Auto-team algorithm (height, level, position, rating)
- "Create teams automatically" button

**PR 3.3**: Social features
- Add friends
- Follow players
- Share matches

### Phase 4: Admin + Polish (Post-MVP)
- Admin panel for court management
- Court photo uploads
- Court condition reporting
- Statistics dashboard

## 5. Dependencies

| Dependency | Purpose | Cost |
|------------|---------|------|
| Supabase | Backend (DB, Auth, Storage, Realtime) | Free tier → $25/mo |
| Google Maps | Map display + geocoding | Pay per use |
| Firebase | Push notifications | Free tier |
| Expo | React Native framework | Free |
| CourtsOfTheWorld | Court data verification | Free (public) |
| Ajuntament de Badalona | Official court data | Free (public) |

## 6. Success Criteria

- [ ] All 56+ Badalona courts visible on map with correct access classification
- [ ] User can create a match in < 60 seconds
- [ ] User can join a match in 1 tap
- [ ] Real-time chat works per match
- [ ] Push notifications arrive at 24h/6h/1h before match
- [ ] App available in Català and Castellano
- [ ] Load time < 2 seconds
- [ ] Court data sourced from verified public sources (no invented data)

## 7. Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Cold start (no users) | HIGH | Partner with BBB clubs, seed with known players |
| Court data staleness | MEDIUM | Community reporting, periodic re-verification |
| Google Maps costs | LOW | OSM fallback, cache aggressively |
| Supabase limits | LOW | Monitor usage, upgrade path clear |
