# Court Map Specification

## Purpose
Display all verified Badalona basketball courts on an interactive map with access-type color coding and detail views.

## Requirements

### Requirement: Court Display
The system MUST display all 56+ verified Badalona basketball courts on an interactive map.

#### Scenario: Load map with courts
- GIVEN the user opens the app
- WHEN the map view loads
- THEN all courts within Badalona bounds are visible as markers
- AND markers are color-coded: green (free), red (restricted), yellow (partial)

#### Scenario: Map viewport filtering
- GIVEN the user is viewing the map
- WHEN the user pans or zooms
- THEN only courts within the current viewport are rendered
- AND marker clustering activates when >20 courts overlap at current zoom

### Requirement: Court Detail
The system MUST provide a detail view for each court showing all verified metadata.

#### Scenario: View court details
- GIVEN the user taps a court marker
- WHEN the court detail screen opens
- THEN the court name, address, access type, and barrio are displayed
- AND GPS coordinates are shown
- AND a directions button opens Google Maps

#### Scenario: Court photos
- GIVEN the user is viewing court details
- WHEN court photos exist
- THEN photos are displayed in a scrollable gallery
- AND a camera button allows uploading new photos

### Requirement: Court Search
The system MUST allow users to search and filter courts.

#### Scenario: Search by name
- GIVEN the user is on the map or court list
- WHEN the user types a court name
- THEN matching courts are displayed in a list
- AND the map highlights the selected court

#### Scenario: Filter by access type
- GIVEN the user is on the map view
- WHEN the user applies an access type filter
- THEN only courts matching the filter are displayed
- AND the filter state persists across sessions

### Requirement: Court Data Integrity
The system MUST display only verified court data with source attribution.

#### Scenario: Unverified data warning
- GIVEN a court has data from community contributions only
- WHEN the court details are displayed
- THEN a "Community verified" badge is shown
- AND official sources are listed when available

#### Scenario: Unknown hours
- GIVEN a court's opening hours are not verified
- WHEN the court details are displayed
- THEN "Horari desconegut" is shown instead of invented hours
