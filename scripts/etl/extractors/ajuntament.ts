// Ajuntament de Badalona — Open Data equipaments CSV
// Source: https://opendata.ajuntament-badalona.cat/

const CSV_URL =
  "https://opendata.ajuntament-badalona.cat/descarrega/llista-dequipaments-de-la-ciutat-de-badalona/";

export interface ExtractedCourt {
  source: "ajuntament";
  source_id: string;
  name: string;
  description: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  equipament_type: string;
}

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ";") {
        fields.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
  }
  fields.push(current.trim());
  return fields;
}

function parseCoord(val: string): number | null {
  if (!val) return null;
  // Spanish format: "41,45502500" -> 41.45502500
  const num = parseFloat(val.replace(",", "."));
  return isNaN(num) ? null : num;
}

export async function extractAjuntament(): Promise<ExtractedCourt[]> {
  console.log("[ajuntament] Downloading equipaments CSV...");

  const resp = await fetch(CSV_URL, {
    headers: { "User-Agent": "WePlayBasketball-ETL/1.0" },
  });

  if (!resp.ok) {
    throw new Error(`Ajuntament CSV error: ${resp.status} ${resp.statusText}`);
  }

  const rawText = await resp.text();
  // Remove BOM if present
  const text = rawText.replace(/^\uFEFF/, "");
  const lines = text.split("\n").filter((l) => l.trim());

  if (lines.length < 2) {
    throw new Error("CSV has no data rows");
  }

  // Parse header
  const headers = parseCsvLine(lines[0]);
  console.log(`[ajuntament] CSV has ${headers.length} columns, ${lines.length - 1} rows`);

  // Map column indices
  const idx = {
    id: headers.indexOf("ID"),
    tipus: headers.indexOf("TIPUS_EQUIPAMENT"),
    descTipus: headers.indexOf("DESCRIPCIO_TIPUS_EQUIPAMENT"),
    nom: headers.indexOf("NOM"),
    telefon: headers.indexOf("TELEFON"),
    email: headers.indexOf("EMAIL"),
    url: headers.indexOf("URL"),
    carrer: headers.indexOf("CARRER"),
    nro: headers.indexOf("NRO"),
    codiPostal: headers.indexOf("CODI_POSTAL"),
    ciutat: headers.indexOf("CIUTAT"),
    lat: headers.indexOf("LATITUD"),
    lng: headers.indexOf("LONGITUD"),
    adrecaCompleta: headers.indexOf("ADREÇA_COMPLETA"),
  };

  // Sport-related types — ONLY actual sports facilities
  const sportTypes = new Set([
    "Poliesp.",       // Poliesportius
    "P.Pol·lies",     // Pistes poliesportives
    "P.Esport",       // Palaus d'esports
  ]);

  // Exclude non-basketball keywords
  const excludeKeywords = [
    "petanca", "atletisme", "vela", "hipica", "piscina", "tennis",
    "padel", "fitness", "gimnas", "rocodrom", "pitch", "taxi",
    "policia", "comisaria", "bombers", "consell", "delegacio",
  ];

  // Exclude basketball CLUBS (they rent/share courts, are not courts themselves)
  const clubKeywords = [
    "club ", "associacio", "base -", "unio basquet",
    "cb badalona", "garcia vico",
  ];

  const results: ExtractedCourt[] = [];

  for (let i = 1; i < lines.length; i++) {
    const fields = parseCsvLine(lines[i]);
    if (fields.length < headers.length - 2) continue;

    const tipus = fields[idx.tipus] || "";
    const nom = fields[idx.nom] || "";
    const nomLower = nom.toLowerCase();

    // Filter: only actual sports facilities with basketball potential
    const isSport = sportTypes.has(tipus);
    const isBasketball =
      nomLower.includes("basquet") ||
      nomLower.includes("bàsquet") ||
      (nomLower.includes("poli") && !nomLower.includes("polici"));

    // Exclude clearly non-basketball
    const isExcluded = excludeKeywords.some((kw) => nomLower.includes(kw));
    const isClub = clubKeywords.some((kw) => nomLower.includes(kw));

    if ((!isSport && !isBasketball) || isExcluded || isClub) continue;

    const id = fields[idx.id] || `${i}`;
    const lat = parseCoord(fields[idx.lat]);
    const lng = parseCoord(fields[idx.lng]);

    // Build address from components
    let address: string | null = null;
    const carrer = fields[idx.carrer] || "";
    const nro = fields[idx.nro] || "";
    if (carrer) {
      address = nro ? `${carrer} ${nro}, Badalona` : `${carrer}, Badalona`;
    }
    // Fallback to ADREÇA_COMPLETA
    if (!address && idx.adrecaCompleta >= 0) {
      address = fields[idx.adrecaCompleta] || null;
    }

    results.push({
      source: "ajuntament",
      source_id: id,
      name: nom,
      description: fields[idx.descTipus] || null,
      address,
      lat,
      lng,
      phone: fields[idx.telefon] || null,
      email: fields[idx.email] || null,
      website: fields[idx.url] || null,
      equipament_type: tipus,
    });
  }

  console.log(`[ajuntament] Extracted ${results.length} sport-related facilities`);
  return results;
}
