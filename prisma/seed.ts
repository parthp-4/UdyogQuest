import { PrismaClient } from "@prisma/client";
import { PHASE_2B_REGISTRY_SEED } from "../lib/ingestion/registry-seed";

const prisma = new PrismaClient();

async function main() {
  for (const entry of PHASE_2B_REGISTRY_SEED) {
    const authority = await prisma.authority.upsert({
      where: { name_jurisdiction: { name: entry.authorityName, jurisdiction: entry.authorityJurisdiction } },
      update: { ministry: entry.authorityMinistry, websiteUrl: entry.authorityWebsiteUrl },
      create: {
        name: entry.authorityName,
        ministry: entry.authorityMinistry,
        jurisdiction: entry.authorityJurisdiction,
        websiteUrl: entry.authorityWebsiteUrl
      }
    });

    await prisma.sourceRegistryEntry.upsert({
      where: { seedUrl: entry.seedUrl },
      update: {
        authorityId: authority.id,
        industry: entry.industry,
        label: entry.label,
        allowedHosts: entry.allowedHosts,
        parserType: entry.parserType,
        jurisdiction: entry.jurisdiction,
        refreshPolicy: entry.refreshPolicy,
        verificationPolicy: entry.verificationPolicy
      },
      create: {
        authorityId: authority.id,
        industry: entry.industry,
        label: entry.label,
        seedUrl: entry.seedUrl,
        allowedHosts: entry.allowedHosts,
        parserType: entry.parserType,
        jurisdiction: entry.jurisdiction,
        refreshPolicy: entry.refreshPolicy,
        verificationPolicy: entry.verificationPolicy
      }
    });

    console.log(`Seeded registry entry: ${entry.label}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
