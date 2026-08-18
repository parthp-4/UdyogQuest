import { getAppDataMode } from "../lib/runtime/mode";
import { runIngestionForAllRegisteredSources, runIngestionForRegistryEntryId } from "../lib/ingestion/run-ingestion";
import { prisma } from "../lib/db/prisma";

const sourceRegistryEntryId = process.argv[2] === "--all" || !process.argv[2] ? null : process.argv[2];

if (getAppDataMode() !== "LIVE") {
  throw new Error(
    "This script only runs against a live database. Set APP_DATA_MODE=live and DATABASE_URL, run `npm run prisma:migrate` and `npx prisma db seed` first, then re-run."
  );
}

const summary = sourceRegistryEntryId
  ? await runIngestionForRegistryEntryId(sourceRegistryEntryId, "CLI")
  : await runIngestionForAllRegisteredSources("CLI");

console.log(`Ingestion run ${summary.runId}: ${summary.status}`);
for (const result of summary.results) {
  console.log(`  - ${result.label}: ${result.status} (${result.message})`);
}

await prisma.$disconnect();

if (summary.status === "FAILED") {
  process.exitCode = 1;
}
