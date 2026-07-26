// Nominatim geocoder — verify/correct coordinates for named courts
// Runs after merge, before DB upsert
// Uses OSM Nominatim with 1 req/s rate limit

import type { MergedCourt } from "./merge.ts";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "WePlayBasketball-ETL/1.0 (contact@weplaybasketball.app)";

// Known bad courts that should be skipped entirely
const SKIP_NAMES = new Set([
  // Courts with broken/inservible hoops noted in OSM
  "cistella pràcticament inservible",
  "inhàbils",
  "trencades",
]);

interface NominatimResult {
  lat: number;
  lng: number;
  display_name: string;
}

interface NominatimReverseResult {
  street: string | null;
  neighbourhood: string | null;
  suburb: string | null;
  district: string | null;
  city: string | null;
}

async function queryNominatim(query: string): Promise<NominatimResult | null> {
  const encoded = encodeURIComponent(query);
  const url = `${NOMINATIM_URL}?q=${encoded}&format=json&limit=1`;
  const req = new Request(url, { headers: { "User-Agent": USER_AGENT } });

  try {
    const resp = await fetch(req, { signal: AbortSignal.timeout(10000) });
    if (!resp.ok) return null;
    const data = await resp.json();
    if (!data.length) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), display_name: data[0].display_name };
  } catch {
    return null;
  }
}

async function reverseGeocode(lat: number, lng: number): Promise<NominatimReverseResult | null> {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
  const req = new Request(url, { headers: { "User-Agent": USER_AGENT } });

  try {
    const resp = await fetch(req, { signal: AbortSignal.timeout(10000) });
    if (!resp.ok) return null;
    const data = await resp.json();
    if (!data?.address) return null;
    const a = data.address;
    return {
      street: a.road || a.pedestrian || a.path || null,
      neighbourhood: a.neighbourhood || a.quarter || null,
      suburb: a.suburb || a.city_district || null,
      district: a.district || null,
      city: a.city || a.town || null,
    };
  } catch {
    return null;
  }
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Filter out courts with broken/unusable hoops
export function isUsable(court: MergedCourt): boolean {
  const name = (court.name || "").toLowerCase();
  const desc = court.rawData.map(r => "description" in r ? (r as any).description || "" : "").join(" ").toLowerCase();
  const hoops = court.rawData.map(r => "hoops" in r ? (r as any).hoops || "" : "").join(" ").toLowerCase();

  for (const skip of SKIP_NAMES) {
    if (desc.includes(skip) || hoops.includes(skip)) {
      console.log(`[geocoder] Skipping unusable court: ${court.name} (contains "${skip}")`);
      return false;
    }
  }
  return true;
}

// Build search query from court name + address
function buildSearchQuery(court: MergedCourt): string {
  // Use the raw court name to find it in Nominatim
  const rawName = court.rawData[0]?.name || court.name;
  return `${rawName} Badalona`;
}

export async function geocodeAndFixCoordinates(courts: MergedCourt[]): Promise<MergedCourt[]> {
  console.log(`[geocoder] Verifying coordinates for ${courts.length} courts via Nominatim...`);

  const fixed: MergedCourt[] = [];
  let geocoded = 0;
  let corrected = 0;

  for (const court of courts) {
    // Geocode ALL named courts — Diputació confidence doesn't guarantee accuracy

    // Build search query from raw source name
    const rawName = court.rawData[0]?.name || court.name;
    if (!rawName || rawName.startsWith("Pista OSM")) {
      fixed.push(court);
      continue;
    }

    const query = `${rawName} Badalona`;
    const result = await queryNominatim(query);

    // Rate limit: 1 req/s
    await new Promise(r => setTimeout(r, 1100));

    if (!result) {
      fixed.push(court);
      continue;
    }

    geocoded++;
    const dist = haversine(court.lat, court.lng, result.lat, result.lng);

    // If Nominatim found it and it's >50m from current coords, correct it
    if (dist > 50) {
      console.log(`[geocoder] CORRECTED: ${court.name} — ${dist.toFixed(0)}m shift`);
      console.log(`  From: ${court.lat.toFixed(6)},${court.lng.toFixed(6)}`);
      console.log(`  To:   ${result.lat.toFixed(6)},${result.lng.toFixed(6)}`);
      console.log(`  Addr: ${result.display_name.substring(0, 60)}`);

      court.lat = result.lat;
      court.lng = result.lng;
      court.geohash = geohashEncode(result.lat, result.lng);
      corrected++;
    }

    fixed.push(court);
  }

  console.log(`[geocoder] Done: ${geocoded} geocoded, ${corrected} corrected`);
  return fixed;
}

// Enrich unnamed OSM courts with reverse geocoded street/neighborhood names
export async function enrichUnnamedCourts(courts: MergedCourt[]): Promise<MergedCourt[]> {
  const unnamed = courts.filter(c => c.name.startsWith("Pista OSM"));
  console.log(`[geocoder] Enriching ${unnamed.length} unnamed courts via reverse geocoding...`);

  let enriched = 0;
  for (const court of unnamed) {
    const result = await reverseGeocode(court.lat, court.lng);
    // Rate limit: 1 req/s
    await new Promise(r => setTimeout(r, 1100));

    if (!result) continue;

    // Build descriptive name: "Pista al Carrer de Tal"
    const parts: string[] = [];
    if (result.street) parts.push(result.street);
    if (result.neighbourhood) parts.push(result.neighbourhood);
    else if (result.suburb) parts.push(result.suburb);

    if (parts.length > 0) {
      court.name = `Pista al ${parts.join(", ")}`;
      enriched++;
    }

    // Also fill barrio from reverse geocoding
    if (!court.barrio) {
      court.barrio = result.neighbourhood || result.suburb || result.district || null;
    }

    // Build address if missing
    if (!court.address && result.street) {
      court.address = `${result.street}, Badalona`;
    }
  }

  console.log(`[geocoder] Enriched ${enriched}/${unnamed.length} unnamed courts`);
  return courts;
}

// Inline geohash encoder (avoids circular import)
const BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz";
function geohashEncode(lat: number, lon: number, precision = 6): string {
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
        if (lon >= mid) { ch |= bit; lonRange[0] = mid; } else { lonRange[1] = mid; }
      } else {
        const mid = (latRange[0] + latRange[1]) / 2;
        if (lat >= mid) { ch |= bit; latRange[0] = mid; } else { latRange[1] = mid; }
      }
      even = !even;
    }
    gh.push(BASE32[ch]);
  }
  return gh.join("");
}
