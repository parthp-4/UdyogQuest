import { readFile } from "node:fs/promises";
import { ingestOfficialSource } from "../lib/ingestion/ingest-source";
import { ingestionSourceSchema } from "../lib/ingestion/schema";

const manifestPath = process.argv[2];

if (!manifestPath) {
  throw new Error("Usage: npm run ingest -- ./official-sources.json");
}

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const sources = Array.isArray(manifest) ? manifest : manifest.sources;

for (const item of sources) {
  const source = ingestionSourceSchema.parse(item);
  const result = await ingestOfficialSource(source);
  console.log(`Ingested ${source.officialUrl}: ${result.chunks} chunks`);
}
