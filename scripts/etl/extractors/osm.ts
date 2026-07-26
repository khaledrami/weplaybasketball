// OpenStreetMap Overpass API — basketball courts in Badalona
// Query: sport=basketball within Badalona admin boundary

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

const QUERY = `
[out:json][timeout:60];
area["name"="Badalona"]["admin_level"="8"]->.searchArea;
(
  node["sport"="basketball"](area.searchArea);
  way["sport"="basketball"](area.searchArea);
  relation["sport"="basketball"](area.searchArea);
);
out center body;
`;

export interface OsmCourt {
  type: "node" | "way" | "relation";
  id: number;
  lat: number;
  lng: number;
  name: string | null;
  leisure: string | null;
  addr_street: string | null;
  addr_housenumber: string | null;
  surface: string | null;
  lit: string | null;
  hoops: string | null;
  access: string | null;
  operator: string | null;
  description: string | null;
  wheelchair: string | null;
  allTags: Record<string, string>;
}

export interface ExtractedCourt {
  source: "osm";
  source_id: string;
  name: string | null;
  address: string | null;
  lat: number;
  lng: number;
  surface: string | null;
  has_lighting: boolean | null;
  hoops: number | null;
  access_type: string | null;
  court_type: "outdoor" | "indoor" | "covered" | null;
}

function parseOsmElement(el: any): OsmCourt {
  const tags = el.tags || {};
  const lat = el.lat || el.center?.lat;
  const lng = el.lon || el.center?.lon;

  return {
    type: el.type,
    id: el.id,
    lat,
    lng,
    name: tags.name || null,
    leisure: tags.leisure || null,
    addr_street: tags["addr:street"] || null,
    addr_housenumber: tags["addr:housenumber"] || null,
    surface: tags.surface || null,
    lit: tags.lit || null,
    hoops: tags.hoops || null,
    access: tags.access || null,
    operator: tags.operator || null,
    description: tags.description || null,
    wheelchair: tags.wheelchair || null,
    allTags: tags,
  };
}

function osmToExtracted(osm: OsmCourt): ExtractedCourt | null {
  if (!osm.lat || !osm.lng) return null;

  // Build address from addr tags
  let address: string | null = null;
  if (osm.addr_street) {
    address = osm.addr_housenumber
      ? `${osm.addr_street}, ${osm.addr_housenumber}, Badalona`
      : `${osm.addr_street}, Badalona`;
  }

  // Parse hoops count
  let hoopsCount: number | null = null;
  if (osm.hoops) {
    const num = parseInt(osm.hoops, 10);
    if (!isNaN(num)) hoopsCount = num;
    else if (osm.hoops.toLowerCase().includes("2")) hoopsCount = 2;
    else if (osm.hoops.toLowerCase().includes("1")) hoopsCount = 1;
  }

  // Parse lighting
  let hasLighting: boolean | null = null;
  if (osm.lit) {
    const lit = osm.lit.toLowerCase();
    hasLighting = lit === "yes" || lit === "true";
  }

  // Determine court type from leisure tag
  let courtType: "outdoor" | "indoor" | "covered" | null = null;
  if (osm.leisure === "pitch") courtType = "outdoor";
  else if (osm.leisure === "sports_centre") courtType = "indoor";

  // Parse access
  let accessType: string | null = null;
  if (osm.access) {
    const a = osm.access.toLowerCase();
    if (a === "yes" || a === "public" || a === "permissive") accessType = "lliure";
    else if (a === "private" || a === "no" || a === "members") accessType = "restringit";
    else if (a === "customers" || a === "permit") accessType = "parcial";
  }

  return {
    source: "osm",
    source_id: `${osm.type}/${osm.id}`,
    name: osm.name,
    address,
    lat: osm.lat,
    lng: osm.lng,
    surface: osm.surface,
    has_lighting: hasLighting,
    hoops: hoopsCount,
    access_type: accessType,
    court_type: courtType,
  };
}

export async function extractOsm(): Promise<ExtractedCourt[]> {
  console.log("[osm] Querying Overpass API for basketball courts in Badalona...");

  const resp = await fetch(OVERPASS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "WePlayBasketball-ETL/1.0",
    },
    body: `data=${encodeURIComponent(QUERY)}`,
  });

  if (!resp.ok) {
    throw new Error(`Overpass API error: ${resp.status} ${resp.statusText}`);
  }

  const data = await resp.json();
  const elements: any[] = data.elements || [];

  console.log(`[osm] Received ${elements.length} elements`);

  const courts: ExtractedCourt[] = [];
  for (const el of elements) {
    const osm = parseOsmElement(el);
    const extracted = osmToExtracted(osm);
    if (extracted) courts.push(extracted);
  }

  console.log(`[osm] Extracted ${courts.length} courts with valid coordinates`);
  return courts;
}
