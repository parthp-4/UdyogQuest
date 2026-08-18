/**
 * The Phase 2B allowlist: exactly one verified official source per supported industry.
 * Both URLs are the same portals already used (and manually verified reachable) in the
 * curated demo corpus (lib/demo/corpus.ts): FoSCoS for food, DGFT for export/import.
 *
 * This is operational metadata -- which hosts the ingestion pipeline is permitted to
 * fetch from -- not a government fact, so it is safe to seed in any environment. It does
 * not create GovernmentSource/KnowledgeDocument rows itself; those are only written by a
 * real ingestion run (lib/ingestion/run-ingestion.ts).
 */
export type RegistrySeedEntry = {
  authorityName: string;
  authorityMinistry?: string;
  authorityWebsiteUrl?: string;
  authorityJurisdiction: string;
  industry: "FOOD" | "EXPORT_IMPORT";
  label: string;
  seedUrl: string;
  allowedHosts: string[];
  parserType: "HTML" | "PDF";
  jurisdiction: string;
  refreshPolicy: string;
  verificationPolicy: string;
};

export const PHASE_2B_REGISTRY_SEED: RegistrySeedEntry[] = [
  {
    authorityName: "Food Safety and Standards Authority of India",
    authorityMinistry: "Ministry of Health and Family Welfare",
    authorityWebsiteUrl: "https://www.fssai.gov.in/",
    authorityJurisdiction: "India",
    industry: "FOOD",
    label: "FoSCoS - Food Safety Compliance System",
    seedUrl: "https://foscos.fssai.gov.in/",
    allowedHosts: ["foscos.fssai.gov.in"],
    parserType: "HTML",
    jurisdiction: "India",
    refreshPolicy: "daily",
    verificationPolicy: "host-allowlist+https+dns-public-address+non-empty-parse"
  },
  {
    authorityName: "Directorate General of Foreign Trade",
    authorityMinistry: "Ministry of Commerce and Industry",
    authorityWebsiteUrl: "https://www.dgft.gov.in/",
    authorityJurisdiction: "India",
    industry: "EXPORT_IMPORT",
    label: "DGFT - Directorate General of Foreign Trade",
    seedUrl: "https://www.dgft.gov.in/",
    allowedHosts: ["www.dgft.gov.in", "dgft.gov.in"],
    parserType: "HTML",
    jurisdiction: "India",
    refreshPolicy: "daily",
    verificationPolicy: "host-allowlist+https+dns-public-address+non-empty-parse"
  }
];
