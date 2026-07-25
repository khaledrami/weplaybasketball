# Exploration: WePlayBasketball — Badalona Basketball Match-Making App

## 1. Project Context

**Name**: WePlayBasketball
**Philosophy**: "No reservar pistas. Encontrar gente para jugar."
**Target**: Badalona, Spain — basketball capital of Catalonia
**Platforms**: iOS + Android (React Native/Expo) + Web
**Languages**: Català + Castellano (i18n from day 1)

Badalona is known as "bressol del bàsquetbol" (cradle of basketball). The city has:
- Club Joventut Badalona (La Penya) — ACB team, 1994 EuroLeague champions
- CB Sant Josep — historic club since 1939
- Círcol Catòlic — club since 1941
- Badalona Bàsquet Base — association of 12 youth clubs, ~4,000 families
- 300+ federated teams, 6,000 matches/year
- Pavelló Olímpic (12,760 seats, 1992 Olympics venue)

A 2022 municipal motion explicitly calls for improving public basketball infrastructure — the city recognizes the need.

---

## 2. Verified Basketball Courts Database

### A. ACCES LIBRE (Free/Public) — Outdoor Courts

| # | Name | Address | Barrio | Source | Confidence |
|---|------|---------|--------|--------|------------|
| 1 | Pista de l'Anís del Mono | C/ Eduard Maristany, 55-105 | Centre | CourtsOfTheWorld #2, OSM | HIGH |
| 2 | Pista dels Padres Carmelitas | C/ del Mar, 29-47 | Centre | CourtsOfTheWorld #3 | HIGH |
| 3 | Cancha de Arriba | C/ Ramiro de Maetzu | Sant Roc | CourtsOfTheWorld #4 | HIGH |
| 4 | Cancha de LLoreda | Plaça del Riu Muga | Lloreda | CourtsOfTheWorld #5 | HIGH |
| 5 | Congreso | C/ Sant Marc, 19-21 | Congrés | CourtsOfTheWorld #6 | HIGH |
| 6 | Pista Iris | C/ Iris, 43-53 | Iris | CourtsOfTheWorld #7 | HIGH |
| 7 | Pista Badalona Lloreda | Passatge del Riu Segre | Lloreda | CourtsOfTheWorld #8 | HIGH |
| 8 | Plaça Joan Miró | Plaça d'En Joan Miró | Centre | CourtsOfTheWorld #9 | HIGH |
| 9 | Canchas de Abajo | Rambla de la Solidaritat | Sant Roc | CourtsOfTheWorld #10 | HIGH |
| 10 | La Plana | Passatge de la Plana, 14-26 | La Plana | CourtsOfTheWorld #11 | HIGH |
| 11 | Pista Sistrells | C/ Pere Martell, 66 | Lloreda | CourtsOfTheWorld #12 | HIGH |
| 12 | Plaça de Badalona | C/ Ramon Llull | Centre | CourtsOfTheWorld #13 | HIGH |
| 13 | Plaça dels Països Catalans | C/ Alfons XII, 104-278 | Sant Roc | CourtsOfTheWorld #14 | HIGH |
| 14 | Pista de Canyadó | C/ Pompeu Fabra, 4-18 | Canyadó | CourtsOfTheWorld #1 | HIGH |
| 15 | Pista Congrés/Regalèssia | C/ Sant Marc, 6 | Congrés | Ajuntament #247 | HIGH |
| 16 | C/ del Temple 10 | C/ del Temple, 10 | Centre | CourtsOfTheWorld #30 | MEDIUM |
| 17 | C/ de Colom 66A | C/ de Colom, 66A | Centre | CourtsOfTheWorld #25 | MEDIUM |
| 18 | Carrer de Laietània 38 | C/ de Laietània, 38 | Lloreda | CourtsOfTheWorld #28 | MEDIUM |
| 19 | Carrer de la Conquista 71 | C/ de la Conquista, 71 | Progrés | CourtsOfTheWorld #27 | MEDIUM |
| 20 | C/ del Gral. Weyler 126 | C/ del Gral. Weyler, 126 | Centre | CourtsOfTheWorld #31 | MEDIUM |
| 21 | C. del Progrés 51 | C/ del Progrés, 51 | Progrés | CourtsOfTheWorld #29 | MEDIUM |
| 22 | C. Garbí 3 | C/ del Garbí, 3 | Pomar | CourtsOfTheWorld #24 | MEDIUM |
| 23 | Carrer de Provença 7 | C/ de Provença, 7 | Progrés | CourtsOfTheWorld #26 | MEDIUM |
| 24 | C. Apenins 29 | C/ dels Apenins, 29 | Lloreda | CourtsOfTheWorld #32 | MEDIUM |
| 25 | Av. Cardenal Vidal i Barraquer 15 | Av. Cardenal Vidal i Barraquer, 15 | Sant Roc | CourtsOfTheWorld #33 | MEDIUM |
| 26 | Parc de Can Solei i Cal Arnús | Av. Navarra | Can Solei | CourtsOfTheWorld #18 | HIGH |
| 27 | Can Mercader | Sant Bru - Jovellar | Centre | CourtsOfTheWorld #21 | HIGH |

**Notes**:
- CourtsOfTheWorld ranks 33+ basketball courts in Badalona alone
- Most are outdoor, public, concrete surface
- Many have been verified by community contributions
- OSM has at least one tagged basketball court with `sport=basketball`, `lit=no`, `surface=paving_stones`

### B. ACCES RESTRINGIDO (Restricted) — Indoor/Club Facilities

| # | Name | Address | Manager | Type | Source | Confidence |
|---|------|---------|---------|------|--------|------------|
| 1 | Pistes Bàsquet Màgic Badalona | C/ Concòrdia, 1 | Club Joventut Badalona | 6 indoor courts, covered | Ajuntament #641, penya.com | HIGH |
| 2 | Pista CB Sant Josep | C/ Enric Borràs, 40-42 | CB Sant Josep | Club pavilion | Ajuntament #585, cbsantjosep.net | HIGH |
| 3 | Pavelló Olímpic de Badalona | Av. Alfons XIII, 143-161 | Club Joventut | 12,760 seats, historic | Wikipedia, Ajuntament | HIGH |
| 4 | Palau Municipal d'Esports | Centre | Ajuntament | Municipal pavilion | CourtsOfTheWorld #17 | HIGH |
| 5 | Camp basquet Salesians de BDN | C/ Alfons XII | Salesians | School court | CourtsOfTheWorld #19 | HIGH |
| 6 | Escola Baldiri Reixac | C/ Juan Valera, 159 | School | School court | CourtsOfTheWorld #20 | HIGH |
| 7 | Centre Maregassa | C/ Sant Lluc, 10 | Centre esportiu | Sports center | CourtsOfTheWorld #23 | HIGH |
| 8 | AE Badalones (Lliga EBA) | Pavelló La Plana | AE Badalones | Competition venue | Federació Catalana | HIGH |

### C. ACCES PARCIAL (Partial Access) — Municipal Poliesportius

These are municipal sports centers that may have basketball courts with varying hours:

| # | Name | Address | Barrio | Source |
|---|------|---------|--------|--------|
| 1 | Poliesportiu La Pau | La Pau | La Pau | Ajuntament #244 |
| 2 | Poliesportiu La Plana | La Plana | La Plana | Ajuntament #232 |
| 3 | Poliesportiu Llefià | Llefià | Llefià | Ajuntament #233 |
| 4 | Poliesportiu Bufalà | Bufalà | Bufalà | Ajuntament #235 |
| 5 | Poliesportiu Joaquim Blume | Blume | Various | Ajuntament #236 |
| 6 | Poliesportiu Nova Lloreda | Lloreda | Lloreda | Ajuntament #237 |
| 7 | Poliesportiu La Platja | La Platja | La Platja | Ajuntament #238 |
| 8 | Poliesportiu Bonavista | Bonavista | Bonavista | Ajuntament #239 |
| 9 | Poliesportiu Iris | Iris | Iris | Ajuntament #240 |
| 10 | Poliesportiu Sant Crist | Sant Crist | Sant Crist | Ajuntament #241 |
| 11 | Poliesportiu Progrés | Progrés | Progrés | Ajuntament #246 |
| 12 | Poliesportiu Pere Martell | C/ Pere Martell, s/n | Lloreda | Ajuntament #248 |
| 13 | Pistes Tacatà | Tacatà | Various | Ajuntament #284 |
| 14 | Pista Poliesportiva Artigas | Artigas | Various | Ajuntament #243 |
| 15 | Poliesportiu Joaquim Ruyra | Ruyra | Various | Ajuntament #242 |
| 16 | Poliesportiu Sant Jaume | Sant Jaume | Sant Jaume | Ajuntament #245 |
| 17 | Poliesportiu Casagemes | Casagemes | Casagemes | Ajuntament #234 |
| 18 | Pista Poliesportiva Ronda Llefià | Ronda Llefià | Llefià | Ajuntament #842 |
| 19 | Poliesportiu Pomar | Pomar | Pomar | Ajuntament #576 |
| 20 | Zona Esportiva Can Cabanyes | Can Cabanyes | Various | Ajuntament #606 |
| 21 | Pistes Bàsquet Màgic Badalona | C/ Concòrdia, 1 | Centre | Ajuntament #641 |

---

## 3. Access Classification Summary

| Access Type | Count | Notes |
|-------------|-------|-------|
| **Lliure (Free)** | 27+ | Outdoor public courts, mainly parks and plazas |
| **Restringit (Restricted)** | 8+ | Club pavilions, school courts, competition venues |
| **Parcial (Partial)** | 21 | Municipal poliesportius with basketball courts |

**Total estimated courts**: 56+ across Badalona

---

## 4. Data Gaps

| Gap | Impact | Mitigation |
|-----|--------|------------|
| GPS coordinates for outdoor courts | Map markers | Geocode from addresses using Google Maps API |
| Opening hours for municipal poliesportius | Schedule display | Scrape from Ajuntament website, mark "Horari desconocut" initially |
| Court condition/lighting/surface | Quality assessment | Crowdsource via user check-ins and photos |
| Transport/parking info | Navigation | Use Google Maps Directions API |
| Capacity (hoops count) | Match planning | Visual verification on-site, community contributions |

---

## 5. Technical Architecture

### Stack
- **Frontend**: React Native + Expo + TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime, RLS)
- **Auth**: Google, Apple, Email via Supabase Auth
- **Maps**: Google Maps (primary) + OpenStreetMap (fallback)
- **Notifications**: Firebase Cloud Messaging (push) + email
- **i18n**: `expo-localization` + `i18n-js` (ca + es from day 1)
- **Realtime**: Supabase Realtime for chat + court status

### Key Patterns
- **RLS everywhere**: Row-Level Security on all tables
- **Optimistic updates**: For match join/leave
- **Geohash clustering**: For map marker aggregation
- **Edge functions**: For match balance algorithm, notifications
- **Storage**: User photos, court photos via Supabase Storage

### Database Tables (Preview)
- `profiles` — user data (extends auth.users)
- `courts` — verified basketball courts with metadata
- `matches` — game sessions
- `match_players` — join table with role/team
- `messages` — per-match chat
- `ratings` — post-match player ratings
- `friendships` — social connections
- `badges` — gamification achievements
- `check_ins` — real-time court occupancy
- `notifications` — notification log

---

## 6. Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Cold start (no users) | HIGH | Seed with known basketball community, partner with BBB clubs |
| Court data accuracy | MEDIUM | Community verification, official sources first |
| Real-time overhead | MEDIUM | Supabase Realtime limits, use polling fallback |
| Map performance (33+ markers) | LOW | Cluster markers, viewport-based loading |
| i18n completeness | LOW | Structure from day 1, community translations |

---

## 7. Discovery Notes

1. **Badalona is THE basketball city**: 12 clubs, 300+ teams, 6,000 matches/year, Pavelló Olímpic
2. **2022 municipal motion**: City council explicitly approved improving public basketball infrastructure
3. **33+ courts on CourtsOfTheWorld alone**: Massive outdoor court network
4. **Plataforma pel bàsquet als carrers**: Existing citizen movement for street basketball
5. **Badalona Bàsquet Base**: Umbrella organization of 12 youth clubs — potential partner
6. **Strong club ecosystem**: Joventut, Sant Josep, Círcol Catòlic, AE Badalones all have venues
7. **Open data available**: Diputació de Barcelona has structured sports facility data with coordinates
