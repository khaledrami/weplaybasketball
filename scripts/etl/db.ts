// Database operations for ETL — upsert courts via SQL
// Uses Supabase REST API with service_role OR direct SQL via anon key

import { createClient } from "@supabase/supabase-js";
import type { MergedCourt } from "./merge.ts";

function getSupabase() {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  // Prefer service_role key for ETL writes (bypasses RLS)
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Missing EXPO_PUBLIC_SUPABASE_URL or API key in .env");
  }
  const isServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!isServiceRole) {
    console.warn("[db] WARNING: Using anon key. RLS may block writes. Add SUPABASE_SERVICE_ROLE_KEY to .env for ETL.");
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

// Escape single quotes for SQL
function esc(s: string | null | undefined): string {
  if (s === null || s === undefined) return "NULL";
  return `'${String(s).replace(/'/g, "''")}'`;
}

function escBool(b: boolean | null | undefined): string {
  if (b === null || b === undefined) return "NULL";
  return b ? "TRUE" : "FALSE";
}

function escNum(n: number | null | undefined): string {
  if (n === null || n === undefined) return "NULL";
  return String(n);
}

function escArray(arr: string[] | null | undefined): string {
  if (!arr || arr.length === 0) return "NULL";
  const escaped = arr.map(s => `"${s.replace(/"/g, '\\"')}"`).join(",");
  return `'{${escaped}}'`;
}

export async function upsertCourts(courts: MergedCourt[]): Promise<number> {
  const supabase = getSupabase();

  console.log(`[db] Upserting ${courts.length} courts via SQL...`);

  // Build a single INSERT ... ON CONFLICT SQL for each batch
  const BATCH_SIZE = 25;
  let upserted = 0;

  // Collect all source_ids being upserted
  const activeSourceIds = courts.map(c => c.source_id);

  // Phase 0: Delete ALL ETL-sourced courts, then re-insert
  // This avoids stale duplicates from source column mismatches (e.g. diba|id vs merged|id)
  const { data: existingCourts } = await supabase
    .from("courts")
    .select("id,source");

  const etlPatterns = ["diba", "osm", "ajuntament", "merged"];
  const toDelete = (existingCourts || []).filter(c =>
    etlPatterns.some(s => c.source === s || c.source?.includes(s))
  );

  if (toDelete.length > 0) {
    console.log(`[db] Removing ${toDelete.length} ETL courts for clean re-insert`);
    const ids = toDelete.map(c => c.id);
    for (let i = 0; i < ids.length; i += 50) {
      await supabase.from("courts").delete().in("id", ids.slice(i, i + 50));
    }
  }

  for (let i = 0; i < courts.length; i += BATCH_SIZE) {
    const batch = courts.slice(i, i + BATCH_SIZE);

    const values = batch.map((c) => `(
      ${esc(c.name)},
      ${esc(c.address)},
      ${esc(c.barrio)},
      ${escNum(c.lat)},
      ${escNum(c.lng)},
      ${esc(c.geohash)},
      ${esc(c.court_type)},
      ${esc(c.access_type)},
      ${escNum(c.hoops)},
      ${esc(c.surface)},
      ${escBool(c.has_lighting)},
      ${escBool(c.has_nets)},
      ${esc(c.opening_hours)},
      ${esc(c.manager)},
      ${esc(c.phone)},
      ${esc(c.email)},
      ${esc(c.website)},
      ${escArray(c.photo_urls)},
      ${esc(c.source)},
      ${esc(c.source_id)},
      ${esc(c.confidence)},
      NOW()
    )`).join(",\n");

    const sql = `
      INSERT INTO courts (
        name, address, barrio, lat, lng, geohash,
        court_type, access_type, hoops, surface,
        has_lighting, has_nets, opening_hours,
        manager, phone, email, website, photo_urls,
        source, source_id, confidence, last_updated
      ) VALUES
      ${values}
      ON CONFLICT (source, source_id) DO UPDATE SET
        name = EXCLUDED.name,
        address = EXCLUDED.address,
        barrio = EXCLUDED.barrio,
        lat = EXCLUDED.lat,
        lng = EXCLUDED.lng,
        geohash = EXCLUDED.geohash,
        court_type = EXCLUDED.court_type,
        access_type = EXCLUDED.access_type,
        hoops = EXCLUDED.hoops,
        surface = EXCLUDED.surface,
        has_lighting = EXCLUDED.has_lighting,
        has_nets = EXCLUDED.has_nets,
        opening_hours = EXCLUDED.opening_hours,
        manager = EXCLUDED.manager,
        phone = EXCLUDED.phone,
        email = EXCLUDED.email,
        website = EXCLUDED.website,
        photo_urls = EXCLUDED.photo_urls,
        confidence = EXCLUDED.confidence,
        last_updated = NOW();
    `;

    const { error } = await supabase.rpc("exec_sql", { sql_text: sql });

    if (error) {
      // Fallback: try individual upserts via REST
      console.warn(`[db] Batch ${Math.floor(i / BATCH_SIZE) + 1} SQL failed, trying REST fallback...`);
      for (const c of batch) {
        const { error: singleErr } = await supabase.from("courts").upsert({
          name: c.name,
          address: c.address,
          barrio: c.barrio,
          lat: c.lat,
          lng: c.lng,
          geohash: c.geohash,
          court_type: c.court_type,
          access_type: c.access_type,
          hoops: c.hoops,
          surface: c.surface,
          has_lighting: c.has_lighting,
          has_nets: c.has_nets,
          opening_hours: c.opening_hours,
          manager: c.manager,
          phone: c.phone,
          email: c.email,
          website: c.website,
          photo_urls: c.photo_urls,
          source: c.source,
          source_id: c.source_id,
          confidence: c.confidence,
          last_updated: new Date().toISOString(),
        }, { onConflict: "source,source_id" });
        if (!singleErr) upserted++;
      }
    } else {
      upserted += batch.length;
    }

    console.log(`[db] Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} rows`);
  }

  console.log(`[db] Upserted ${upserted}/${courts.length} courts`);
  return upserted;
}

export async function insertDataSources(courts: MergedCourt[]): Promise<void> {
  const supabase = getSupabase();
  console.log("[db] Inserting data source audit records...");

  // Resolve court IDs
  const { data: dbCourts } = await supabase.from("courts").select("id,source_id");
  const idMap = new Map<string, string>();
  for (const c of dbCourts || []) {
    idMap.set(c.source_id, c.id);
  }

  const rows: any[] = [];
  for (const court of courts) {
    for (const raw of court.rawData) {
      const source = raw.source;
      const sourceId = "source_id" in raw ? raw.source_id : "";
      const courtId = idMap.get(sourceId);
      if (!courtId) continue;

      const fieldsToLog = ["lat", "lng", "address", "phone", "email", "website",
        "surface", "has_lighting", "hoops", "opening_hours", "name"];

      for (const field of fieldsToLog) {
        const val = (raw as any)[field];
        if (val !== null && val !== undefined && val !== "") {
          rows.push({
            court_id: courtId,
            source_name: source,
            source_id: sourceId,
            field_name: field,
            field_value: String(val),
            confidence: "medium",
          });
        }
      }
    }
  }

  console.log(`[db] Inserting ${rows.length} audit records...`);

  const BATCH = 100;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await supabase.from("court_data_sources").insert(batch);
    if (error) {
      console.error(`[db] Audit batch error:`, error.message);
    }
  }

  console.log(`[db] Audit records inserted`);
}

export async function logEtlRun(
  source: string, extracted: number, upserted: number, errors: number, details: any
): Promise<void> {
  const supabase = getSupabase();
  await supabase.from("etl_runs").insert({
    source_name: source,
    finished_at: new Date().toISOString(),
    records_extracted: extracted,
    records_upserted: upserted,
    errors,
    details,
  });
}

export async function getCourtCount(): Promise<number> {
  const supabase = getSupabase();
  const { count } = await supabase.from("courts").select("*", { count: "exact", head: true });
  return count || 0;
}
