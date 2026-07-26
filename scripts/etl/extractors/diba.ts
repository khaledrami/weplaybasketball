// Diputació de Barcelona — puntesports API
// Source: https://do.diba.cat/api/dataset/puntesports/
// License: CC BY 4.0

const BASE_URL = "https://do.diba.cat/api/dataset/puntesports/format/json/export/web";
const BADALONA_INE = "08015";

export interface DibaFacility {
  punt_id: string;
  adreca_nom: string;
  descripcio: string;
  grup_adreca: {
    adreca: string;
    codi_postal: string;
    municipi_nom: string;
    adreca_completa: string;
  };
  localitzacio: string; // "lat,lng" or empty
  imatge: string[];
  url_general: string;
  email: string[];
  telefon_contacte: string[];
  fax: string[];
  horaris: string;
  cercador_codi: string; // "manual/OK", "nominatim/OK", "nominatim/TIMEOUT"
  inici_horari_hivern: string;
  inici_horari_estiu: string;
  horari_hivern_dilluns: string;
  horari_hivern_dimarts: string;
  horari_hivern_dimecres: string;
  horari_hivern_dijous: string;
  horari_hivern_divendres: string;
  horari_hivern_dissabte: string;
  horari_hivern_diumenge: string;
  horari_estiu_dilluns: string;
  horari_estiu_dimarts: string;
  horari_estiu_dimecres: string;
  horari_estiu_dijous: string;
  horari_estiu_divendres: string;
  horari_estiu_dissabte: string;
  horari_estiu_diumenge: string;
  observacions_hivern: string;
  observacions_estiu: string;
  rel_municipis: {
    ine: string;
    municipi_nom: string;
  };
  tags: string[];
  categoria: string[];
}

export interface ExtractedCourt {
  source: "diba";
  source_id: string;
  name: string;
  address: string | null;
  postal_code: string | null;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  opening_hours: string | null;
  images: string[];
  geocode_status: string;
}

function parseCoordinates(loc: string): { lat: number; lng: number } | null {
  if (!loc) return null;
  const parts = loc.split(",").map((s) => parseFloat(s.trim()));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return { lat: parts[0], lng: parts[1] };
  }
  return null;
}

function buildOpeningHours(facility: DibaFacility): string | null {
  const days = [
    "dilluns", "dimarts", "dimecres", "dijous", "divendres", "dissabte", "diumenge",
  ];
  const dayNames = ["Dl", "Dt", "Dc", "Dj", "Dv", "Ds", "Dg"];

  const winterHours = days.map((d) => (facility as any)[`horari_hivern_${d}`] || "");
  const summerHours = days.map((d) => (facility as any)[`horari_estiu_${d}`] || "");

  const hasAny = winterHours.some((h) => h) || summerHours.some((h) => h);
  if (!hasAny) return null;

  // Build compact schedule
  const parts: string[] = [];

  // Try winter schedule
  const winterParts: string[] = [];
  for (let i = 0; i < 7; i++) {
    if (winterHours[i]) winterParts.push(`${dayNames[i]}: ${winterHours[i]}`);
  }
  if (winterParts.length > 0) {
    parts.push(`Hivern: ${winterParts.join(" | ")}`);
  }

  return parts.length > 0 ? parts.join("\n") : null;
}

export async function extractDiba(): Promise<ExtractedCourt[]> {
  console.log("[diba] Fetching Badalona facilities from Diputació de Barcelona...");

  const url = `${BASE_URL}/camp-rel_municipis-like/${BADALONA_INE}`;
  const resp = await fetch(url, {
    headers: { "User-Agent": "WePlayBasketball-ETL/1.0" },
  });

  if (!resp.ok) {
    throw new Error(`Diba API error: ${resp.status} ${resp.statusText}`);
  }

  const data = await resp.json();
  const raw: DibaFacility[] = data.elements || [];

  console.log(`[diba] Received ${raw.length} total facilities`);

  // Filter for basketball-related: name contains bàsquet, basquet, poliesport, pista poli, palau, pavelló
  const basketballKeywords = [
    "basquet", "bàsquet", "poliesport", "pista poli", "palau",
    "pavelló", "pavello", "joventut", "màgic", "magic",
  ];

  const filtered = raw.filter((f) => {
    const name = f.adreca_nom.toLowerCase();
    return basketballKeywords.some((kw) => name.includes(kw));
  });

  console.log(`[diba] Filtered to ${filtered.length} basketball-related facilities`);

  const results: ExtractedCourt[] = [];

  for (const f of filtered) {
    const coords = parseCoordinates(f.localitzacio);
    const address = f.grup_adreca?.adreca_completa || f.grup_adreca?.adreca || null;
    const postalCode = f.grup_adreca?.codi_postal || null;

    results.push({
      source: "diba",
      source_id: f.punt_id,
      name: f.adreca_nom,
      address,
      postal_code: postalCode,
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
      phone: f.telefon_contacte?.[0] || null,
      email: f.email?.[0] || null,
      website: f.url_general || null,
      opening_hours: buildOpeningHours(f),
      images: f.imatge || [],
      geocode_status: f.cercador_codi || "",
    });
  }

  console.log(`[diba] Extracted ${results.length} courts with data`);
  return results;
}
