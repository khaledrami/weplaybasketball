// ETL Pipeline — WePlayBasketball
// Usage: node --experimental-strip-types scripts/etl/run.ts
//
// Extracts court data from 3 sources, merges, and upserts to Supabase.
// Idempotent: safe to re-run (upserts on conflict).

import { extractDiba } from "./extractors/diba.ts";
import { extractOsm } from "./extractors/osm.ts";
import { extractAjuntament } from "./extractors/ajuntament.ts";
import { mergeCourts, geohashEncode } from "./merge.ts";
import { geocodeAndFixCoordinates, enrichUnnamedCourts, isUsable } from "./geocoder.ts";
import { upsertCourts, insertDataSources, logEtlRun, getCourtCount } from "./db.ts";

async function main() {
  const startTime = Date.now();
  console.log("========================================");
  console.log("WePlayBasketball ETL Pipeline");
  console.log(`Started: ${new Date().toISOString()}`);
  console.log("========================================\n");

  let dibaExtracted = 0;
  let osmExtracted = 0;
  let ajtExtracted = 0;
  let totalErrors = 0;

  // --- Extract ---
  console.log("=== PHASE 1: EXTRACT ===\n");

  let dibaCourts;
  try {
    dibaCourts = await extractDiba();
    dibaExtracted = dibaCourts.length;
  } catch (err: any) {
    console.error(`[ERROR] Diputació extraction failed: ${err.message}`);
    dibaCourts = [];
    totalErrors++;
  }

  let osmCourts;
  try {
    osmCourts = await extractOsm();
    osmExtracted = osmCourts.length;
  } catch (err: any) {
    console.error(`[ERROR] OSM extraction failed: ${err.message}`);
    osmCourts = [];
    totalErrors++;
  }

  let ajtCourts;
  try {
    ajtCourts = await extractAjuntament();
    ajtExtracted = ajtCourts.length;
  } catch (err: any) {
    console.error(`[ERROR] Ajuntament extraction failed: ${err.message}`);
    ajtCourts = [];
    totalErrors++;
  }

  console.log(`\nExtracted: ${dibaExtracted} (diba) + ${osmExtracted} (osm) + ${ajtExtracted} (ajuntament)\n`);

  // --- Merge ---
  console.log("=== PHASE 2: MERGE ===\n");

  const merged = mergeCourts(dibaCourts, osmCourts, ajtCourts);

  // Summary
  const bySource = new Map<string, number>();
  const byConfidence = new Map<string, number>();
  const byAccess = new Map<string, number>();
  for (const c of merged) {
    bySource.set(c.source, (bySource.get(c.source) || 0) + 1);
    byConfidence.set(c.confidence, (byConfidence.get(c.confidence) || 0) + 1);
    byAccess.set(c.access_type, (byAccess.get(c.access_type) || 0) + 1);
  }

  console.log("Merged courts by primary source:");
  for (const [s, n] of bySource) console.log(`  ${s}: ${n}`);
  console.log("By confidence:");
  for (const [s, n] of byConfidence) console.log(`  ${s}: ${n}`);
  console.log("By access type:");
  for (const [s, n] of byAccess) console.log(`  ${s}: ${n}`);
  console.log();

  // --- Geocode & Filter ---
  console.log("=== PHASE 2.5: GEOCODE & FILTER ===\n");

  // Filter out unusable courts (broken hoops)
  const usable = merged.filter(isUsable);
  const filtered = merged.length - usable.length;
  if (filtered > 0) console.log(`[filter] Removed ${filtered} unusable courts\n`);

  // Geocode named courts to verify/correct coordinates
  const enriched = await enrichUnnamedCourts(usable);
  const geocoded = await geocodeAndFixCoordinates(enriched);

  // Re-geohash after coordinate corrections
  for (const c of geocoded) {
    c.geohash = geohashEncode(c.lat, c.lng);
  }

  // --- Load ---
  console.log("=== PHASE 3: LOAD ===\n");

  const prevCount = await getCourtCount();
  console.log(`Courts in DB before upsert: ${prevCount}`);

  let upserted = 0;
  try {
    upserted = await upsertCourts(geocoded);
  } catch (err: any) {
    console.error(`[ERROR] Upsert failed: ${err.message}`);
    totalErrors++;
  }

  try {
    await insertDataSources(geocoded);
  } catch (err: any) {
    console.error(`[ERROR] Audit insert failed: ${err.message}`);
    totalErrors++;
  }

  const newCount = await getCourtCount();
  console.log(`\nCourts in DB after upsert: ${newCount}`);

  // --- Log ETL run ---
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n========================================`);
  console.log(`ETL Complete in ${elapsed}s`);
  console.log(`Extracted: ${dibaExtracted + osmExtracted + ajtExtracted}`);
  console.log(`Merged: ${merged.length}`);
  console.log(`Upserted: ${upserted}`);
  console.log(`Errors: ${totalErrors}`);
  console.log(`========================================`);

  await logEtlRun("all", dibaExtracted + osmExtracted + ajtExtracted, upserted, totalErrors, {
    diba: dibaExtracted,
    osm: osmExtracted,
    ajuntament: ajtExtracted,
    merged: geocoded.length,
    filtered,
    elapsed_seconds: parseFloat(elapsed),
  });
}

main().catch((err) => {
  console.error("ETL Fatal error:", err);
  process.exit(1);
});
