// Merge courts from multiple sources
// Priority: Ajuntament (official) > Diputació > OSM
// Matching: by name similarity, address proximity, or coordinate proximity

import type { ExtractedCourt as DibaCourt } from "./extractors/diba.ts";
import type { ExtractedCourt as OsmCourt } from "./extractors/osm.ts";
import type { ExtractedCourt as AjtCourt } from "./extractors/ajuntament.ts";

export type AnyCourt = DibaCourt | OsmCourt | AjtCourt;

export interface MergedCourt {
  name: string;
  address: string | null;
  barrio: string | null;
  lat: number;
  lng: number;
  geohash: string;
  court_type: string;
  access_type: string;
  hoops: number | null;
  surface: string | null;
  has_lighting: boolean | null;
  has_nets: boolean | null;
  opening_hours: string | null;
  manager: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  photo_urls: string[] | null;
  source: string;
  source_id: string;
  confidence: string;
  rawData: AnyCourt[];
  _dedupIdx?: number;
}

// --- Geohash encoder (precision 6) ---
const BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz";

export function geohashEncode(lat: number, lon: number, precision = 6): string {
  const latRange = [-90, 90];
  const lonRange = [-180, 180];
  const gh: string[] = [];
  let even = true;
  const bits = [16, 8, 4, 2, 1];

  while (gh.length < precision) {
    let ch = 0;
    for (const bit of bits) {
      if (even) {
        const mid = (lonRange[0] + lonRange[1]) / 2;
        if (lon >= mid) {
          ch |= bit;
          lonRange[0] = mid;
        } else {
          lonRange[1] = mid;
        }
      } else {
        const mid = (latRange[0] + latRange[1]) / 2;
        if (lat >= mid) {
          ch |= bit;
          latRange[0] = mid;
        } else {
          latRange[1] = mid;
        }
      }
      even = !even;
    }
    gh.push(BASE32[ch]);
  }
  return gh.join("");
}

// --- Normalization ---
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractCourtName(raw: string): string {
  // Remove common prefixes like "PISTES BÀSQUET", "POLIESPORTIU", etc.
  let name = raw.trim();
  // Keep the meaningful part
  return name;
}

// --- Distance between two coordinates (Haversine, in meters) ---
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// --- Court type inference ---
function inferAccessType(court: AnyCourt): string {
  // Ajuntament source: we know poliesportius are "parcial"
  if (court.source === "ajuntament") {
    const name = court.name.toLowerCase();
    if (name.includes("poliesport")) return "parcial";
    if (name.includes("basquet") || name.includes("bàsquet")) return "lliure";
    if (name.includes("palau") || name.includes("pavelló")) return "restringit";
  }
  // Diputació: similar logic
  if (court.source === "diba") {
    const name = court.name.toLowerCase();
    if (name.includes("basquet") || name.includes("bàsquet")) return "lliure";
    if (name.includes("poliesport")) return "parcial";
    if (name.includes("palau") || name.includes("pavelló")) return "restringit";
  }
  // OSM: use access tag if available
  if (court.source === "osm" && "access_type" in court) {
    return (court as OsmCourt).access_type || "parcial";
  }
  return "parcial";
}

function inferCourtType(court: AnyCourt): string {
  if (court.source === "osm" && "court_type" in court) {
    return (court as OsmCourt).court_type || "outdoor";
  }
  if (court.source === "ajuntament") {
    const desc = (court as AjtCourt).description?.toLowerCase() || "";
    if (desc.includes("poliesp") || desc.includes("cobert")) return "indoor";
  }
  if (court.source === "diba") {
    const name = court.name.toLowerCase();
    if (name.includes("cobert") || name.includes("pavelló")) return "indoor";
  }
  return "outdoor";
}

// --- Main merge function ---
export function mergeCourts(
  diba: DibaCourt[],
  osm: OsmCourt[],
  ajt: AjtCourt[]
): MergedCourt[] {
  console.log(`[merge] Starting merge: ${diba.length} diba + ${osm.length} osm + ${ajt.length} ajuntament`);

  // Build a unified list: ajuntament (official) + diba (structured) + osm (coverage)
  // Match courts across sources using name + coordinate proximity

  const merged: MergedCourt[] = [];
  const used = new Set<string>(); // track which source records are matched

  // Phase 1: Start with Diputació courts (best structured data with coordinates)
  for (const dc of diba) {
    if (!dc.lat || !dc.lng) continue;

    const entry: MergedCourt = {
      name: extractCourtName(dc.name),
      address: dc.address,
      barrio: null,
      lat: dc.lat,
      lng: dc.lng,
      geohash: geohashEncode(dc.lat, dc.lng),
      court_type: inferCourtType(dc),
      access_type: inferAccessType(dc),
      hoops: null,
      surface: null,
      has_lighting: null,
      has_nets: null,
      opening_hours: dc.opening_hours,
      manager: null,
      phone: dc.phone,
      email: dc.email,
      website: dc.website,
      photo_urls: null,
      source: "diba",
      source_id: dc.source_id,
      confidence: dc.geocode_status.includes("manual") ? "high" : "medium",
      rawData: [dc],
    };

    // Try to match with Ajuntament
    for (const ac of ajt) {
      if (used.has(`ajt:${ac.source_id}`)) continue;
      const nameSim = normalize(dc.name) === normalize(ac.name) ||
        normalize(dc.name).includes(normalize(ac.name)) ||
        normalize(ac.name).includes(normalize(dc.name));
      if (nameSim) {
        used.add(`ajt:${ac.source_id}`);
        entry.rawData.push(ac);
        // Ajuntament is official — prefer its address if our's is less specific
        if (ac.address && (!dc.address || dc.address.length < ac.address.length)) {
          entry.address = ac.address;
        }
        if (ac.phone) entry.phone = ac.phone;
        if (ac.email) entry.email = ac.email;
        if (ac.website) entry.website = ac.website;
        entry.source = "merged";
        break;
      }
    }

    // Try to match with OSM courts nearby
    for (const oc of osm) {
      if (used.has(`osm:${oc.source_id}`)) continue;
      const dist = haversineDistance(dc.lat, dc.lng, oc.lat, oc.lng);
      if (dist < 300) {
        used.add(`osm:${oc.source_id}`);
        entry.rawData.push(oc);
      // OSM may have surface/lighting info
      if (oc.surface) entry.surface = oc.surface;
      if (oc.has_lighting !== null) entry.has_lighting = oc.has_lighting;
      if (oc.hoops !== null) entry.hoops = oc.hoops;
      if (!entry.address && oc.address) entry.address = oc.address;
      if (!entry.opening_hours && oc.opening_hours) entry.opening_hours = oc.opening_hours;
        entry.confidence = "high"; // matched across sources = high confidence
        break;
      }
    }

    merged.push(entry);
  }

  // Phase 2: Add unmatched Ajuntament courts (official, even without Diputació match)
  for (const ac of ajt) {
    if (used.has(`ajt:${ac.source_id}`)) continue;
    if (!ac.lat || !ac.lng) continue;

    // Try to match against already-merged entries by proximity
    let matched = false;
    for (const existing of merged) {
      const dist = haversineDistance(ac.lat, ac.lng, existing.lat, existing.lng);
      if (dist < 150) {
        used.add(`ajt:${ac.source_id}`);
        existing.rawData.push(ac);
        existing.source = "merged";
        if (ac.phone) existing.phone = ac.phone;
        if (ac.email) existing.email = ac.email;
        if (ac.website) existing.website = ac.website;
        if (ac.address && (!existing.address || ac.address.length > existing.address.length)) {
          existing.address = ac.address;
        }
        matched = true;
        break;
      }
    }
    if (matched) continue;

    used.add(`ajt:${ac.source_id}`);

    merged.push({
      name: extractCourtName(ac.name),
      address: ac.address,
      barrio: null,
      lat: ac.lat,
      lng: ac.lng,
      geohash: geohashEncode(ac.lat, ac.lng),
      court_type: inferCourtType(ac),
      access_type: inferAccessType(ac),
      hoops: null,
      surface: null,
      has_lighting: null,
      has_nets: null,
      opening_hours: null,
      manager: null,
      phone: ac.phone,
      email: ac.email,
      website: ac.website,
      photo_urls: null,
      source: "ajuntament",
      source_id: ac.source_id,
      confidence: "medium",
      rawData: [ac],
    });
  }

  // Phase 3: Add unmatched OSM courts (geographic coverage for courts not in official data)
  for (const oc of osm) {
    if (used.has(`osm:${oc.source_id}`)) continue;
    if (!oc.lat || !oc.lng) continue;

    // Skip private courts not accessible to public
    if (oc.access_type === "restringit") continue;

    // Try to match against already-merged entries by proximity
    let matched = false;
    for (const existing of merged) {
      const dist = haversineDistance(oc.lat, oc.lng, existing.lat, existing.lng);
      if (dist < 150) {
        used.add(`osm:${oc.source_id}`);
        existing.rawData.push(oc);
        if (!existing.source.includes("osm")) existing.source = "merged";
        if (oc.surface) existing.surface = oc.surface;
        if (oc.has_lighting !== null) existing.has_lighting = oc.has_lighting;
        if (oc.hoops !== null) existing.hoops = oc.hoops;
        if (!existing.address && oc.address) existing.address = oc.address;
        if (!existing.opening_hours && oc.opening_hours) existing.opening_hours = oc.opening_hours;
        existing.confidence = "high";
        matched = true;
        break;
      }
    }
    if (matched) continue;

    used.add(`osm:${oc.source_id}`);

    // Build photo_urls from OSM image tag
    const photoUrls = oc.image ? [oc.image] : null;

    merged.push({
      name: oc.name || `Pista OSM ${oc.source_id}`,
      address: oc.address,
      barrio: oc.addr_neighbourhood || null,
      lat: oc.lat,
      lng: oc.lng,
      geohash: geohashEncode(oc.lat, oc.lng),
      court_type: oc.court_type || "outdoor",
      access_type: oc.access_type || "lliure",
      hoops: oc.hoops,
      surface: oc.surface,
      has_lighting: oc.has_lighting,
      has_nets: null,
      opening_hours: oc.opening_hours || null,
      manager: null,
      email: null,
      website: null,
      photo_urls: photoUrls,
      source: "osm",
      source_id: oc.source_id,
      confidence: "medium",
      rawData: [oc],
    });
  }

  // Phase 4: Final dedup — collapse courts within 150m OR with identical normalized names
  // Priority: keep the one with more rawData (more sources = better)
  const deduped: MergedCourt[] = [];
  const mergedUsed = new Set<number>();

  for (let i = 0; i < merged.length; i++) {
    if (mergedUsed.has(i)) continue;

    let best = merged[i];
    best._dedupIdx = i;

    for (let j = i + 1; j < merged.length; j++) {
      if (mergedUsed.has(j)) continue;

      const dist = haversineDistance(best.lat, best.lng, merged[j].lat, merged[j].lng);
      const nameMatch = normalize(best.name) === normalize(merged[j].name) && normalize(best.name).length > 3;
      const closeProximity = dist < 150;

      if (closeProximity || nameMatch) {
        mergedUsed.add(j);
        // Keep the one with more sources
        if (merged[j].rawData.length > best.rawData.length) {
          const prev = best;
          best = merged[j];
          // Transfer any extra data from the prev
          if (!best.phone && prev.phone) best.phone = prev.phone;
          if (!best.address && prev.address) best.address = prev.address;
        }
      }
    }

    deduped.push(best);
  }

  console.log(`[merge] After dedup: ${deduped.length} courts (from ${merged.length})`);
  console.log(`[merge] Sources: diba=${diba.length}, osm=${osm.length}, ajt=${ajt.length}`);
  console.log(`[merge] Used: ${used.size} source records matched`);

  return deduped;
}
