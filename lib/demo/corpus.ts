import { VERIFIED_UNAVAILABLE } from "@/lib/constants";

export type DemoIndustry = "FOOD" | "EXPORT_IMPORT";
export type DemoKnowledgeType = "registration" | "scheme" | "compliance" | "document" | "portal" | "update";

export type DemoSource = {
  id: string;
  officialUrl: string;
  title: string;
  kind: "WEB_PAGE" | "PDF" | "CIRCULAR" | "NOTIFICATION" | "FAQ" | "PORTAL" | "HELPLINE" | "OFFICE";
  status: "VERIFIED";
  lastUpdated: Date | null;
  fetchedAt: Date;
  sourceConfidence: number;
  stateApplicability: string | null;
  districtApplicability: string | null;
  legalReferences: string[];
  applicationPortal: string | null;
  helpline: string | null;
  email: string | null;
  office: string | null;
  authority: {
    id: string;
    name: string;
    ministry: string | null;
    jurisdiction: string | null;
    websiteUrl: string | null;
  };
  artifacts: Array<{ id: string; url: string; title: string; kind: "WEB_PAGE" | "PDF" | "FAQ" | "PORTAL" }>;
};

export type DemoKnowledgeItem = {
  id: string;
  type: DemoKnowledgeType;
  sourceId: string;
  industry: DemoIndustry;
  title: string;
  summary: string;
  applicability: string;
  eligibility: string | null;
  requiredDocuments: string | null;
  benefits: string | null;
  fees: string | null;
  processingTime: string | null;
  renewal: string | null;
  dependencies: string | null;
  faqs: string | null;
  validity: string | null;
  relatedArticles: string[];
  relatedRegistrations: string[];
  relatedSchemes: string[];
  rawText: string;
  createdAt: Date;
  updatedAt: Date;
  source: DemoSource;
};

export type DemoProfile = {
  id: string;
  businessName: string;
  ownerName: string;
  businessCategory: DemoIndustry;
  businessActivity: string;
  stage: string;
  state: string;
  district: string;
  city: string;
  pin: string;
  ownership: string;
  turnover: number;
  investment: number;
  employees: number;
  annualIncome: number;
  socialCategory: string;
  gender: string;
  age: number;
  education: string;
  existingRegistrations: string[];
  existingLicenses: string[];
  hasGst: boolean;
  hasPan: boolean;
  hasAadhaar: boolean;
  hasUdyam: boolean;
  hasFssai: boolean;
  hasIec: boolean;
  hasFactoryLicense: boolean;
  premises: string;
  rental: boolean;
  owned: boolean;
  manufacturing: boolean;
  trading: boolean;
  foodCategory: string | null;
  coldStorage: boolean;
  warehouse: boolean;
  exportDestination: string | null;
  importProducts: string | null;
  bankAccount: boolean;
  loanStatus: string;
  creditHistory: string;
  mobile: string;
  email: string;
  languages: string[];
  documents: DemoDocument[];
  recommendations: DemoRecommendation[];
  timeline: DemoTimelineStep[];
};

export type DemoDocument = {
  id: string;
  profileId: string;
  fileName: string;
  documentType: string;
  status: "VERIFIED" | "EXTRACTED" | "NEEDS_REVIEW" | "MISSING";
  acceptedFormat: string;
  maximumSize: string;
  requiredFor: string[];
  governmentAuthority: string;
  reuseCount: number;
  aiExtractionStatus: string;
  extractedFields: Record<string, string>;
  missingFields: string[];
  mismatchFlags: string[];
  expiry: string;
};

export type DemoRecommendation = {
  id: string;
  profileId: string;
  title: string;
  status: "ELIGIBLE" | "POTENTIAL" | "FUTURE_ELIGIBLE" | "NOT_ELIGIBLE";
  why: string;
  whyNow: string;
  skippedImpact: string;
  estimatedDelay: string;
  expectedBenefit: string;
  expectedTimeline: string;
  documentsNeeded: string[];
  officialPortal: string;
  applicationSteps: string;
  confidence: number;
  evidenceUsed: string[];
  rulesMatched: string[];
  documentsUsed: string[];
  citations: Array<{ id: string; source: DemoSource }>;
};

export type DemoTimelineStep = {
  id: string;
  title: string;
  status: "Ready" | "Blocked" | "In progress" | "Queued" | "Done";
  week: string;
  authority: string;
  dependency: string;
  why: string;
};

const fetchedAt = new Date("2026-07-25T09:00:00+05:30");
const notSpecified = VERIFIED_UNAVAILABLE;

function source(input: Omit<DemoSource, "status" | "fetchedAt" | "artifacts"> & { artifactTitle?: string }): DemoSource {
  return {
    ...input,
    status: "VERIFIED",
    fetchedAt,
    artifacts: [
      {
        id: `${input.id}-artifact`,
        url: input.officialUrl,
        title: input.artifactTitle ?? input.title,
        kind: input.kind === "PDF" ? "PDF" : input.kind === "FAQ" ? "FAQ" : input.kind === "PORTAL" ? "PORTAL" : "WEB_PAGE"
      }
    ]
  };
}

const sources = {
  foscos: source({
    id: "src-foscos",
    officialUrl: "https://foscos.fssai.gov.in/",
    title: "FoSCoS - Food Safety Compliance System",
    kind: "PORTAL",
    lastUpdated: null,
    sourceConfidence: 0.98,
    stateApplicability: "All India",
    districtApplicability: null,
    legalReferences: ["Food Safety and Standards Act, 2006"],
    applicationPortal: "https://foscos.fssai.gov.in/",
    helpline: notSpecified,
    email: notSpecified,
    office: notSpecified,
    authority: {
      id: "auth-fssai",
      name: "Food Safety and Standards Authority of India",
      ministry: "Ministry of Health and Family Welfare",
      jurisdiction: "India",
      websiteUrl: "https://www.fssai.gov.in/"
    }
  }),
  pmfme: source({
    id: "src-pmfme",
    officialUrl: "https://pmfme.mofpi.gov.in/",
    title: "PM Formalisation of Micro Food Processing Enterprises Scheme",
    kind: "PORTAL",
    lastUpdated: null,
    sourceConfidence: 0.96,
    stateApplicability: "All India",
    districtApplicability: null,
    legalReferences: [],
    applicationPortal: "https://pmfme.mofpi.gov.in/",
    helpline: notSpecified,
    email: notSpecified,
    office: notSpecified,
    authority: {
      id: "auth-mofpi",
      name: "Ministry of Food Processing Industries",
      ministry: "Ministry of Food Processing Industries",
      jurisdiction: "India",
      websiteUrl: "https://www.mofpi.gov.in/"
    }
  }),
  pmegp: source({
    id: "src-pmegp",
    officialUrl: "https://www.kviconline.gov.in/pmegpeportal/pmegphome/index.jsp",
    title: "Prime Minister's Employment Generation Programme Portal",
    kind: "PORTAL",
    lastUpdated: null,
    sourceConfidence: 0.95,
    stateApplicability: "All India",
    districtApplicability: null,
    legalReferences: [],
    applicationPortal: "https://www.kviconline.gov.in/pmegpeportal/pmegphome/index.jsp",
    helpline: notSpecified,
    email: notSpecified,
    office: "District Industries Centre / KVIC / KVIB / Banks",
    authority: {
      id: "auth-kvic",
      name: "Khadi and Village Industries Commission",
      ministry: "Ministry of MSME",
      jurisdiction: "India",
      websiteUrl: "https://www.kvic.gov.in/"
    }
  }),
  udyam: source({
    id: "src-udyam",
    officialUrl: "https://udyamregistration.gov.in/",
    title: "Udyam Registration",
    kind: "PORTAL",
    lastUpdated: null,
    sourceConfidence: 0.98,
    stateApplicability: "All India",
    districtApplicability: null,
    legalReferences: ["MSME notification and Udyam portal instructions"],
    applicationPortal: "https://udyamregistration.gov.in/",
    helpline: notSpecified,
    email: notSpecified,
    office: notSpecified,
    authority: {
      id: "auth-msme",
      name: "Ministry of Micro, Small and Medium Enterprises",
      ministry: "Ministry of MSME",
      jurisdiction: "India",
      websiteUrl: "https://msme.gov.in/"
    }
  }),
  gst: source({
    id: "src-gst",
    officialUrl: "https://www.gst.gov.in/",
    title: "Goods and Services Tax Portal",
    kind: "PORTAL",
    lastUpdated: null,
    sourceConfidence: 0.97,
    stateApplicability: "All India",
    districtApplicability: null,
    legalReferences: ["CGST Act and rules"],
    applicationPortal: "https://www.gst.gov.in/",
    helpline: notSpecified,
    email: notSpecified,
    office: notSpecified,
    authority: {
      id: "auth-gstn",
      name: "Goods and Services Tax Network",
      ministry: "Government of India and State Governments",
      jurisdiction: "India",
      websiteUrl: "https://www.gst.gov.in/"
    }
  }),
  upNivesh: source({
    id: "src-up-nivesh",
    officialUrl: "https://niveshmitra.up.nic.in/",
    title: "Uttar Pradesh Nivesh Mitra Single Window Portal",
    kind: "PORTAL",
    lastUpdated: null,
    sourceConfidence: 0.9,
    stateApplicability: "Uttar Pradesh",
    districtApplicability: null,
    legalReferences: [],
    applicationPortal: "https://niveshmitra.up.nic.in/",
    helpline: notSpecified,
    email: notSpecified,
    office: notSpecified,
    authority: {
      id: "auth-up-gov",
      name: "Government of Uttar Pradesh",
      ministry: "Infrastructure and Industrial Development Department",
      jurisdiction: "Uttar Pradesh",
      websiteUrl: "https://niveshmitra.up.nic.in/"
    }
  }),
  gem: source({
    id: "src-gem",
    officialUrl: "https://gem.gov.in/",
    title: "Government e Marketplace",
    kind: "PORTAL",
    lastUpdated: null,
    sourceConfidence: 0.96,
    stateApplicability: "All India",
    districtApplicability: null,
    legalReferences: [],
    applicationPortal: "https://gem.gov.in/",
    helpline: notSpecified,
    email: notSpecified,
    office: notSpecified,
    authority: {
      id: "auth-gem",
      name: "Government e Marketplace",
      ministry: "Ministry of Commerce and Industry",
      jurisdiction: "India",
      websiteUrl: "https://gem.gov.in/"
    }
  }),
  mudra: source({
    id: "src-mudra",
    officialUrl: "https://www.mudra.org.in/",
    title: "Pradhan Mantri MUDRA Yojana",
    kind: "WEB_PAGE",
    lastUpdated: null,
    sourceConfidence: 0.94,
    stateApplicability: "All India",
    districtApplicability: null,
    legalReferences: [],
    applicationPortal: "https://www.mudra.org.in/",
    helpline: notSpecified,
    email: notSpecified,
    office: "Banks, NBFCs, MFIs and other member lending institutions",
    authority: {
      id: "auth-mudra",
      name: "MUDRA",
      ministry: "Government of India",
      jurisdiction: "India",
      websiteUrl: "https://www.mudra.org.in/"
    }
  }),
  standup: source({
    id: "src-standup",
    officialUrl: "https://www.standupmitra.in/",
    title: "Stand-Up India",
    kind: "PORTAL",
    lastUpdated: null,
    sourceConfidence: 0.94,
    stateApplicability: "All India",
    districtApplicability: null,
    legalReferences: [],
    applicationPortal: "https://www.standupmitra.in/",
    helpline: notSpecified,
    email: notSpecified,
    office: "Scheduled commercial banks",
    authority: {
      id: "auth-standup",
      name: "Stand-Up India",
      ministry: "Government of India",
      jurisdiction: "India",
      websiteUrl: "https://www.standupmitra.in/"
    }
  }),
  dgft: source({
    id: "src-dgft",
    officialUrl: "https://www.dgft.gov.in/",
    title: "Directorate General of Foreign Trade",
    kind: "PORTAL",
    lastUpdated: null,
    sourceConfidence: 0.98,
    stateApplicability: "All India",
    districtApplicability: null,
    legalReferences: ["Foreign Trade Policy"],
    applicationPortal: "https://www.dgft.gov.in/",
    helpline: notSpecified,
    email: notSpecified,
    office: notSpecified,
    authority: {
      id: "auth-dgft",
      name: "Directorate General of Foreign Trade",
      ministry: "Ministry of Commerce and Industry",
      jurisdiction: "India",
      websiteUrl: "https://www.dgft.gov.in/"
    }
  }),
  icegate: source({
    id: "src-icegate",
    officialUrl: "https://www.icegate.gov.in/",
    title: "ICEGATE - Indian Customs Electronic Gateway",
    kind: "PORTAL",
    lastUpdated: null,
    sourceConfidence: 0.98,
    stateApplicability: "All India",
    districtApplicability: null,
    legalReferences: ["Customs Act and customs electronic filing processes"],
    applicationPortal: "https://www.icegate.gov.in/",
    helpline: notSpecified,
    email: notSpecified,
    office: notSpecified,
    authority: {
      id: "auth-icegate",
      name: "Central Board of Indirect Taxes and Customs",
      ministry: "Department of Revenue, Ministry of Finance",
      jurisdiction: "India",
      websiteUrl: "https://www.cbic.gov.in/"
    }
  }),
  apeda: source({
    id: "src-apeda",
    officialUrl: "https://apeda.gov.in/",
    title: "APEDA",
    kind: "PORTAL",
    lastUpdated: null,
    sourceConfidence: 0.96,
    stateApplicability: "All India",
    districtApplicability: null,
    legalReferences: ["APEDA Act"],
    applicationPortal: "https://apeda.gov.in/",
    helpline: notSpecified,
    email: notSpecified,
    office: notSpecified,
    authority: {
      id: "auth-apeda",
      name: "Agricultural and Processed Food Products Export Development Authority",
      ministry: "Ministry of Commerce and Industry",
      jurisdiction: "India",
      websiteUrl: "https://apeda.gov.in/"
    }
  }),
  mpeda: source({
    id: "src-mpeda",
    officialUrl: "https://mpeda.gov.in/",
    title: "MPEDA",
    kind: "PORTAL",
    lastUpdated: null,
    sourceConfidence: 0.95,
    stateApplicability: "All India",
    districtApplicability: null,
    legalReferences: [],
    applicationPortal: "https://mpeda.gov.in/",
    helpline: notSpecified,
    email: notSpecified,
    office: notSpecified,
    authority: {
      id: "auth-mpeda",
      name: "Marine Products Export Development Authority",
      ministry: "Ministry of Commerce and Industry",
      jurisdiction: "India",
      websiteUrl: "https://mpeda.gov.in/"
    }
  }),
  spiceBoard: source({
    id: "src-spice-board",
    officialUrl: "https://www.indianspices.com/",
    title: "Spices Board India",
    kind: "PORTAL",
    lastUpdated: null,
    sourceConfidence: 0.95,
    stateApplicability: "All India",
    districtApplicability: null,
    legalReferences: [],
    applicationPortal: "https://www.indianspices.com/",
    helpline: notSpecified,
    email: notSpecified,
    office: notSpecified,
    authority: {
      id: "auth-spice-board",
      name: "Spices Board India",
      ministry: "Ministry of Commerce and Industry",
      jurisdiction: "India",
      websiteUrl: "https://www.indianspices.com/"
    }
  }),
  teaBoard: source({
    id: "src-tea-board",
    officialUrl: "https://www.teaboard.gov.in/",
    title: "Tea Board India",
    kind: "PORTAL",
    lastUpdated: null,
    sourceConfidence: 0.95,
    stateApplicability: "All India",
    districtApplicability: null,
    legalReferences: [],
    applicationPortal: "https://www.teaboard.gov.in/",
    helpline: notSpecified,
    email: notSpecified,
    office: notSpecified,
    authority: {
      id: "auth-tea-board",
      name: "Tea Board India",
      ministry: "Ministry of Commerce and Industry",
      jurisdiction: "India",
      websiteUrl: "https://www.teaboard.gov.in/"
    }
  }),
  coffeeBoard: source({
    id: "src-coffee-board",
    officialUrl: "https://coffeeboard.gov.in/",
    title: "Coffee Board of India",
    kind: "PORTAL",
    lastUpdated: null,
    sourceConfidence: 0.95,
    stateApplicability: "All India",
    districtApplicability: null,
    legalReferences: [],
    applicationPortal: "https://coffeeboard.gov.in/",
    helpline: notSpecified,
    email: notSpecified,
    office: notSpecified,
    authority: {
      id: "auth-coffee-board",
      name: "Coffee Board of India",
      ministry: "Ministry of Commerce and Industry",
      jurisdiction: "India",
      websiteUrl: "https://coffeeboard.gov.in/"
    }
  }),
  fieo: source({
    id: "src-fieo",
    officialUrl: "https://www.fieo.org/",
    title: "Federation of Indian Export Organisations",
    kind: "PORTAL",
    lastUpdated: null,
    sourceConfidence: 0.9,
    stateApplicability: "All India",
    districtApplicability: null,
    legalReferences: [],
    applicationPortal: "https://www.fieo.org/",
    helpline: notSpecified,
    email: notSpecified,
    office: notSpecified,
    authority: {
      id: "auth-fieo",
      name: "Federation of Indian Export Organisations",
      ministry: "Set up by Ministry of Commerce and Industry",
      jurisdiction: "India",
      websiteUrl: "https://www.fieo.org/"
    }
  }),
  cbic: source({
    id: "src-cbic-gst",
    officialUrl: "https://cbic-gst.gov.in/",
    title: "CBIC GST",
    kind: "PORTAL",
    lastUpdated: null,
    sourceConfidence: 0.96,
    stateApplicability: "All India",
    districtApplicability: null,
    legalReferences: ["GST law, rules, circulars and notifications"],
    applicationPortal: "https://www.gst.gov.in/",
    helpline: notSpecified,
    email: notSpecified,
    office: notSpecified,
    authority: {
      id: "auth-cbic",
      name: "Central Board of Indirect Taxes and Customs",
      ministry: "Department of Revenue, Ministry of Finance",
      jurisdiction: "India",
      websiteUrl: "https://cbic-gst.gov.in/"
    }
  }),
  coo: source({
    id: "src-coo-dgft",
    officialUrl: "https://coo.dgft.gov.in/",
    title: "Common Digital Platform for Certificate of Origin",
    kind: "PORTAL",
    lastUpdated: null,
    sourceConfidence: 0.97,
    stateApplicability: "All India",
    districtApplicability: null,
    legalReferences: [],
    applicationPortal: "https://coo.dgft.gov.in/",
    helpline: notSpecified,
    email: notSpecified,
    office: notSpecified,
    authority: {
      id: "auth-coo-dgft",
      name: "Directorate General of Foreign Trade",
      ministry: "Ministry of Commerce and Industry",
      jurisdiction: "India",
      websiteUrl: "https://www.dgft.gov.in/"
    }
  })
};

function item(input: Omit<DemoKnowledgeItem, "sourceId" | "rawText" | "createdAt" | "updatedAt">): DemoKnowledgeItem {
  const rawText = [
    input.title,
    input.summary,
    input.applicability,
    input.eligibility,
    input.requiredDocuments,
    input.benefits,
    input.fees,
    input.processingTime,
    input.renewal,
    input.dependencies,
    input.source.authority.name,
    input.source.officialUrl,
    input.relatedArticles.join(" "),
    input.relatedRegistrations.join(" "),
    input.relatedSchemes.join(" ")
  ]
    .filter(Boolean)
    .join("\n");

  return {
    ...input,
    sourceId: input.source.id,
    rawText,
    createdAt: fetchedAt,
    updatedAt: fetchedAt
  };
}

export const demoKnowledge: DemoKnowledgeItem[] = [
  item({
    id: "food-fssai-registration",
    type: "registration",
    industry: "FOOD",
    title: "FSSAI Registration / License through FoSCoS",
    summary: "Food business operators use FoSCoS for food safety registration and licensing workflows.",
    applicability: "Applies to food business operators such as cloud kitchens, restaurants, cafes, bakeries, dairy, food processing units, meat shops, and grocery stores selling food items.",
    eligibility: "Food business operator category and license type must be determined on FoSCoS from business activity and scale.",
    requiredDocuments: "Identity/address proof, business constitution, premises details, food category, and other documents requested by FoSCoS for the selected license type.",
    benefits: null,
    fees: "Portal fee/license fee is displayed by FoSCoS for the selected license type; exact value not stored in this demo corpus.",
    processingTime: notSpecified,
    renewal: "Renewal is handled through FoSCoS.",
    dependencies: "Business profile, premises details, food category, and identity documents.",
    faqs: notSpecified,
    validity: "Validity depends on license/registration period selected and official rules.",
    relatedArticles: ["FoSCoS", "Food safety compliance"],
    relatedRegistrations: ["Udyam", "GST", "Trade License"],
    relatedSchemes: ["PMFME"],
    source: sources.foscos
  }),
  item({
    id: "food-foscos",
    type: "portal",
    industry: "FOOD",
    title: "FoSCoS food compliance portal",
    summary: "FoSCoS is the official food safety compliance portal for food business operators.",
    applicability: "Applies to food businesses that need FSSAI registration, license, renewal, modification, or related compliance.",
    eligibility: "Use the official portal flow to determine the relevant license service.",
    requiredDocuments: "Documents vary by service and business category.",
    benefits: "Single official portal for FSSAI licensing and registration services.",
    fees: "Shown by official portal during application.",
    processingTime: notSpecified,
    renewal: "Renewal available on FoSCoS.",
    dependencies: "FSSAI account and business details.",
    faqs: notSpecified,
    validity: notSpecified,
    relatedArticles: ["FSSAI Registration / License through FoSCoS"],
    relatedRegistrations: ["FSSAI Registration / License"],
    relatedSchemes: [],
    source: sources.foscos
  }),
  item({
    id: "food-pmfme",
    type: "scheme",
    industry: "FOOD",
    title: "PMFME for micro food processing enterprises",
    summary: "PMFME supports formalisation and competitiveness of micro food processing enterprises.",
    applicability: "Relevant for individual micro food processing units and groups in the food processing sector.",
    eligibility: "Eligibility is determined by PMFME scheme rules, enterprise status, food processing activity, and application review.",
    requiredDocuments: "Applicant identity, enterprise details, project details, bank/loan documents, and documents requested by PMFME portal/state nodal agency.",
    benefits: "Credit-linked subsidy is part of the PMFME scheme; exact admissible benefit depends on official scheme rules and approved project cost.",
    fees: notSpecified,
    processingTime: notSpecified,
    renewal: null,
    dependencies: "Food business profile, bank account, project proposal, and enterprise documentation.",
    faqs: notSpecified,
    validity: "Scheme availability as notified by MoFPI.",
    relatedArticles: ["FSSAI Registration / License through FoSCoS", "Udyam Registration"],
    relatedRegistrations: ["Udyam", "FSSAI"],
    relatedSchemes: ["PMEGP"],
    source: sources.pmfme
  }),
  item({
    id: "food-pmegp",
    type: "scheme",
    industry: "FOOD",
    title: "PMEGP for food businesses",
    summary: "PMEGP is a credit-linked programme for setting up micro enterprises through KVIC/KVIB/DIC and banks.",
    applicability: "Relevant for new micro-enterprise projects, including eligible food business projects, subject to PMEGP guidelines.",
    eligibility: "Determined by PMEGP scheme rules, applicant category, project type, location, and bank/sponsoring agency appraisal.",
    requiredDocuments: "Project report, identity/address proof, category certificate if applicable, education/skill documents where required, and documents requested by PMEGP portal/bank.",
    benefits: "Margin money subsidy is available subject to PMEGP rules; percentage and amount depend on applicant category, location, and project cost.",
    fees: notSpecified,
    processingTime: notSpecified,
    renewal: null,
    dependencies: "Project proposal, bank readiness, identity/category documents, and enterprise details.",
    faqs: notSpecified,
    validity: "Scheme availability as notified by KVIC/Ministry of MSME.",
    relatedArticles: ["Udyam Registration", "MUDRA loan"],
    relatedRegistrations: ["Udyam"],
    relatedSchemes: ["PMFME", "MUDRA"],
    source: sources.pmegp
  }),
  item({
    id: "common-udyam-food",
    type: "registration",
    industry: "FOOD",
    title: "Udyam Registration for MSME food enterprise",
    summary: "Udyam is the official MSME registration portal.",
    applicability: "Applies to eligible micro, small and medium enterprises, including food businesses.",
    eligibility: "MSME classification is based on official investment and turnover criteria.",
    requiredDocuments: "Aadhaar/PAN/GST-linked details as required by the Udyam portal.",
    benefits: "Used to access MSME recognition and linked benefits where applicable.",
    fees: "The official Udyam portal states that Udyam Registration is free.",
    processingTime: notSpecified,
    renewal: "Udyam registration is maintained through the official portal.",
    dependencies: "Aadhaar/PAN details and business information.",
    faqs: notSpecified,
    validity: notSpecified,
    relatedArticles: ["PMFME", "PMEGP", "GeM"],
    relatedRegistrations: ["GST"],
    relatedSchemes: ["PMFME", "PMEGP", "MUDRA"],
    source: sources.udyam
  }),
  item({
    id: "common-gst-food",
    type: "registration",
    industry: "FOOD",
    title: "GST registration for food business",
    summary: "The GST portal is the official portal for GST registration and taxpayer services.",
    applicability: "Relevant when GST law requires registration or when the business chooses registration for operations, marketplaces, input tax credit, or B2B trade.",
    eligibility: "GST applicability depends on turnover, business model, supplies, location, and statutory thresholds.",
    requiredDocuments: "PAN, proof of business registration/constitution, address proof, bank account details, authorized signatory details, and documents requested by the GST portal.",
    benefits: "Enables GST-compliant invoicing, returns, and input tax credit subject to GST law.",
    fees: "Not specified by the verified corpus.",
    processingTime: notSpecified,
    renewal: "GST registration does not use annual renewal in the same way as licenses; returns and compliances continue as per law.",
    dependencies: "PAN, business place, bank, and authorized signatory details.",
    faqs: notSpecified,
    validity: notSpecified,
    relatedArticles: ["Udyam Registration", "GeM"],
    relatedRegistrations: ["Udyam"],
    relatedSchemes: [],
    source: sources.gst
  }),
  item({
    id: "food-shop-establishment",
    type: "registration",
    industry: "FOOD",
    title: "Shop and Establishment registration - Uttar Pradesh",
    summary: "State and local registrations may be accessed through Uttar Pradesh single-window services where applicable.",
    applicability: "Potentially relevant to a Lucknow cloud kitchen operating from a commercial premises.",
    eligibility: "Applicability depends on state labour/local-body rules and business premises.",
    requiredDocuments: "Premises proof, identity details, business details, and documents requested by the official state/local portal.",
    benefits: null,
    fees: "Not specified by the verified corpus.",
    processingTime: "Not specified by the verified corpus.",
    renewal: "Not specified by the verified corpus.",
    dependencies: "Premises details and business identity.",
    faqs: notSpecified,
    validity: notSpecified,
    relatedArticles: ["Trade License", "FSSAI Registration / License"],
    relatedRegistrations: ["Trade License", "FSSAI"],
    relatedSchemes: [],
    source: sources.upNivesh
  }),
  item({
    id: "food-trade-license",
    type: "registration",
    industry: "FOOD",
    title: "Trade License - local body applicability",
    summary: "Trade license requirements are local-body specific; the Uttar Pradesh single-window portal is the official state starting point for applicable services.",
    applicability: "Potentially relevant to a food business with commercial premises in Lucknow.",
    eligibility: "Applicability depends on the local municipal authority and business activity.",
    requiredDocuments: "Premises proof, identity/business constitution details, and documents requested by the official state/local portal.",
    benefits: null,
    fees: "Not specified by the verified corpus.",
    processingTime: "Not specified by the verified corpus.",
    renewal: "Not specified by the verified corpus.",
    dependencies: "Premises details and local-body service selection.",
    faqs: notSpecified,
    validity: notSpecified,
    relatedArticles: ["Shop and Establishment registration - Uttar Pradesh"],
    relatedRegistrations: ["FSSAI", "GST"],
    relatedSchemes: [],
    source: sources.upNivesh
  }),
  item({
    id: "food-fire-noc",
    type: "compliance",
    industry: "FOOD",
    title: "Fire NOC applicability for food premises",
    summary: "Fire NOC applicability depends on building use, occupancy, local fire rules, and premises details.",
    applicability: "Potentially relevant to commercial kitchens, restaurants, storage facilities, and premises with fire-risk criteria.",
    eligibility: "Must be checked through the official state/local approval workflow for the premises.",
    requiredDocuments: "Premises layout, ownership/rent proof, building details, fire-safety documents, and documents requested by the authority.",
    benefits: null,
    fees: "Not specified by the verified corpus.",
    processingTime: "Not specified by the verified corpus.",
    renewal: "Not specified by the verified corpus.",
    dependencies: "Premises layout and local approval service selection.",
    faqs: notSpecified,
    validity: notSpecified,
    relatedArticles: ["Trade License", "FSSAI Registration / License"],
    relatedRegistrations: ["Trade License"],
    relatedSchemes: [],
    source: sources.upNivesh
  }),
  item({
    id: "food-pollution",
    type: "compliance",
    industry: "FOOD",
    title: "Pollution consent applicability for food units",
    summary: "Pollution consent applicability depends on process, category, fuel, effluent, emissions, and state pollution-control rules.",
    applicability: "Potentially relevant for manufacturing/processing units; a simple cloud kitchen may require authority-specific assessment.",
    eligibility: "Must be checked with official state pollution-control rules and portal classification.",
    requiredDocuments: "Unit details, process flow, premises details, utility/fuel details, and documents requested by the authority.",
    benefits: null,
    fees: "Not specified by the verified corpus.",
    processingTime: "Not specified by the verified corpus.",
    renewal: "Not specified by the verified corpus.",
    dependencies: "Manufacturing/process details and premises classification.",
    faqs: notSpecified,
    validity: notSpecified,
    relatedArticles: ["FSSAI Registration / License"],
    relatedRegistrations: ["Trade License"],
    relatedSchemes: [],
    source: sources.upNivesh
  }),
  item({
    id: "common-gem-food",
    type: "scheme",
    industry: "FOOD",
    title: "GeM seller onboarding",
    summary: "GeM is the official Government e Marketplace for public procurement.",
    applicability: "Relevant when a food business wants to sell eligible products or services to government buyers.",
    eligibility: "Eligibility depends on GeM seller/service rules and category requirements.",
    requiredDocuments: "Business identity, tax/registration details, bank details, and category documents requested by GeM.",
    benefits: "Access to government procurement opportunities, subject to GeM rules.",
    fees: "Not specified by the verified corpus.",
    processingTime: "Not specified by the verified corpus.",
    renewal: "Not specified by the verified corpus.",
    dependencies: "Business registration, bank account, tax/identity details.",
    faqs: notSpecified,
    validity: notSpecified,
    relatedArticles: ["Udyam Registration", "GST registration"],
    relatedRegistrations: ["Udyam", "GST"],
    relatedSchemes: [],
    source: sources.gem
  }),
  item({
    id: "common-mudra-food",
    type: "scheme",
    industry: "FOOD",
    title: "MUDRA loan for micro enterprise",
    summary: "MUDRA supports micro enterprises through member lending institutions.",
    applicability: "Relevant for eligible non-corporate, non-farm micro enterprises, including food businesses where lending institution criteria are met.",
    eligibility: "Loan eligibility is determined by the lending institution and PMMY/MUDRA product rules.",
    requiredDocuments: "Identity, address, business proof, bank documents, project/loan documents, and lender-required records.",
    benefits: "Official MUDRA products include Shishu, Kishor, and Tarun loan categories.",
    fees: "As per lending institution; not specified by the verified corpus.",
    processingTime: "As per lending institution; not specified by the verified corpus.",
    renewal: null,
    dependencies: "Bank account, business profile, loan proposal, credit appraisal.",
    faqs: notSpecified,
    validity: "Scheme availability as per official MUDRA/PMMY framework.",
    relatedArticles: ["PMEGP", "Udyam Registration"],
    relatedRegistrations: ["Udyam"],
    relatedSchemes: ["PMEGP", "PMFME"],
    source: sources.mudra
  }),
  item({
    id: "common-standup-food",
    type: "scheme",
    industry: "FOOD",
    title: "Stand-Up India",
    summary: "Stand-Up India facilitates bank loans for eligible SC/ST and women entrepreneurs.",
    applicability: "Potentially relevant for women entrepreneurs and SC/ST entrepreneurs starting eligible greenfield enterprises.",
    eligibility: "Eligibility depends on Stand-Up India rules, borrower category, enterprise nature, and bank appraisal.",
    requiredDocuments: "Identity/category documents, project report, bank documents, enterprise details, and lender-required records.",
    benefits: "Loan facilitation through official Stand-Up India/bank process, subject to eligibility and appraisal.",
    fees: "As per bank/lending process; not specified by the verified corpus.",
    processingTime: "As per bank/lending process; not specified by the verified corpus.",
    renewal: null,
    dependencies: "Project proposal, borrower category, bank appraisal.",
    faqs: notSpecified,
    validity: "Scheme availability as per official portal.",
    relatedArticles: ["Udyam Registration", "PMEGP"],
    relatedRegistrations: ["Udyam"],
    relatedSchemes: ["PMEGP", "MUDRA"],
    source: sources.standup
  }),
  item({
    id: "export-iec",
    type: "registration",
    industry: "EXPORT_IMPORT",
    title: "Importer Exporter Code (IEC)",
    summary: "DGFT is the official authority for IEC and foreign trade services.",
    applicability: "Required for businesses engaging in import/export activities where IEC is required under DGFT/customs workflows.",
    eligibility: "Eligibility and exceptions are determined by DGFT rules and the official portal flow.",
    requiredDocuments: "PAN, bank account details/cancelled cheque, address details, and documents requested by DGFT.",
    benefits: "Enables DGFT-linked import/export workflows and is used in customs/export processes.",
    fees: "Fee is displayed by the DGFT portal during application; exact value not stored in this demo corpus.",
    processingTime: "Not specified by the verified corpus.",
    renewal: "IEC profile update/management is handled through DGFT.",
    dependencies: "PAN, bank account, business address, email/mobile and DGFT account.",
    faqs: notSpecified,
    validity: "Not specified by the verified corpus.",
    relatedArticles: ["DGFT", "ICEGATE", "AD Code"],
    relatedRegistrations: ["ICEGATE", "RCMC"],
    relatedSchemes: ["RoDTEP"],
    source: sources.dgft
  }),
  item({
    id: "export-dgft",
    type: "portal",
    industry: "EXPORT_IMPORT",
    title: "DGFT foreign trade services",
    summary: "DGFT provides foreign trade policy and exporter/importer services through its official portal.",
    applicability: "Applies to exporters/importers and businesses using DGFT services.",
    eligibility: "Service-specific eligibility applies.",
    requiredDocuments: "Documents vary by DGFT service.",
    benefits: "Single official gateway for several foreign trade services.",
    fees: "Shown by official portal where applicable.",
    processingTime: "Service-specific and not specified in this demo corpus.",
    renewal: "Service-specific.",
    dependencies: "DGFT login, profile, and service-specific documents.",
    faqs: notSpecified,
    validity: notSpecified,
    relatedArticles: ["IEC", "Certificate of Origin"],
    relatedRegistrations: ["IEC", "RCMC"],
    relatedSchemes: ["RoDTEP"],
    source: sources.dgft
  }),
  item({
    id: "export-icegate",
    type: "portal",
    industry: "EXPORT_IMPORT",
    title: "ICEGATE customs portal",
    summary: "ICEGATE is the Indian Customs Electronic Gateway for electronic customs services.",
    applicability: "Relevant for exporters/importers, customs brokers, and shipping/customs filing workflows.",
    eligibility: "Service-specific eligibility applies based on customs process and user type.",
    requiredDocuments: "IEC/GST/PAN and process-specific records as requested by ICEGATE/customs services.",
    benefits: "Official customs e-filing and tracking gateway.",
    fees: "Not specified by the verified corpus.",
    processingTime: "Process-specific and not specified by the verified corpus.",
    renewal: "Service-specific.",
    dependencies: "IEC/GST/PAN and customs service registration where applicable.",
    faqs: notSpecified,
    validity: notSpecified,
    relatedArticles: ["Shipping Bill", "AD Code", "LUT"],
    relatedRegistrations: ["IEC"],
    relatedSchemes: ["RoDTEP"],
    source: sources.icegate
  }),
  item({
    id: "export-ad-code",
    type: "registration",
    industry: "EXPORT_IMPORT",
    title: "AD Code registration for export remittance linkage",
    summary: "AD Code links the exporter's authorized dealer bank with customs/export shipment workflows.",
    applicability: "Relevant before filing export shipping bills through customs channels.",
    eligibility: "Requires exporter bank/authorized dealer details and customs/ICEGATE process compliance.",
    requiredDocuments: "Bank-issued AD Code letter, IEC/GST/PAN details, bank account details, and port/customs documents requested by the official process.",
    benefits: "Enables export proceeds/remittance linkage in customs workflows.",
    fees: "Not specified by the verified corpus.",
    processingTime: "Not specified by the verified corpus.",
    renewal: "Not specified by the verified corpus.",
    dependencies: "IEC, bank account, ICEGATE/customs access.",
    faqs: notSpecified,
    validity: notSpecified,
    relatedArticles: ["ICEGATE customs portal", "Shipping Bill"],
    relatedRegistrations: ["IEC", "ICEGATE"],
    relatedSchemes: [],
    source: sources.icegate
  }),
  item({
    id: "export-rcmc",
    type: "registration",
    industry: "EXPORT_IMPORT",
    title: "RCMC / export promotion council registration",
    summary: "Registration-cum-Membership Certificate is obtained from the relevant export promotion council/commodity board where applicable.",
    applicability: "Relevant to exporters seeking council membership, sector support, or scheme/process requirements tied to RCMC.",
    eligibility: "Depends on product category and the concerned council/board rules.",
    requiredDocuments: "IEC, business details, product details, and council/board-required documents.",
    benefits: "Supports sector-specific export facilitation and council services.",
    fees: "Council-specific; not specified by the verified corpus.",
    processingTime: "Council-specific; not specified by the verified corpus.",
    renewal: "Council-specific; not specified by the verified corpus.",
    dependencies: "IEC and product/category mapping.",
    faqs: notSpecified,
    validity: "Council-specific.",
    relatedArticles: ["APEDA", "MPEDA", "Spice Board", "Tea Board", "Coffee Board", "FIEO"],
    relatedRegistrations: ["IEC"],
    relatedSchemes: ["RoDTEP"],
    source: sources.dgft
  }),
  item({
    id: "export-apeda",
    type: "registration",
    industry: "EXPORT_IMPORT",
    title: "APEDA registration for scheduled agricultural and processed food exports",
    summary: "APEDA is the official authority for agricultural and processed food products export development.",
    applicability: "Relevant when the exported product falls under APEDA's scheduled agricultural/processed food product coverage.",
    eligibility: "Eligibility depends on APEDA product coverage and application rules.",
    requiredDocuments: "IEC, business details, bank details, product details, and APEDA-requested documents.",
    benefits: "Access to APEDA registration and export development services where applicable.",
    fees: "Not specified by the verified corpus.",
    processingTime: "Not specified by the verified corpus.",
    renewal: "Not specified by the verified corpus.",
    dependencies: "IEC and product category mapping.",
    faqs: notSpecified,
    validity: "Not specified by the verified corpus.",
    relatedArticles: ["RCMC", "Certificate of Origin"],
    relatedRegistrations: ["IEC", "RCMC"],
    relatedSchemes: ["RoDTEP"],
    source: sources.apeda
  }),
  item({
    id: "export-mpeda",
    type: "registration",
    industry: "EXPORT_IMPORT",
    title: "MPEDA for marine product exports",
    summary: "MPEDA is the official authority for marine products export development.",
    applicability: "Relevant when the business exports marine products.",
    eligibility: "Depends on MPEDA product/business coverage and application rules.",
    requiredDocuments: "IEC, business details, product details, facility/details where applicable, and MPEDA-requested documents.",
    benefits: "Access to marine export registration/facilitation services where applicable.",
    fees: "Not specified by the verified corpus.",
    processingTime: "Not specified by the verified corpus.",
    renewal: "Not specified by the verified corpus.",
    dependencies: "IEC and marine product activity.",
    faqs: notSpecified,
    validity: notSpecified,
    relatedArticles: ["RCMC"],
    relatedRegistrations: ["IEC", "RCMC"],
    relatedSchemes: [],
    source: sources.mpeda
  }),
  item({
    id: "export-spice-board",
    type: "registration",
    industry: "EXPORT_IMPORT",
    title: "Spices Board exporter registration",
    summary: "Spices Board India is the official board for spices export development.",
    applicability: "Relevant when exporting spices or spice products covered by the board.",
    eligibility: "Depends on board rules and product coverage.",
    requiredDocuments: "IEC, business details, product details, and board-requested documents.",
    benefits: "Access to spices export registration/facilitation where applicable.",
    fees: "Not specified by the verified corpus.",
    processingTime: "Not specified by the verified corpus.",
    renewal: "Not specified by the verified corpus.",
    dependencies: "IEC and spice product category.",
    faqs: notSpecified,
    validity: notSpecified,
    relatedArticles: ["RCMC", "Certificate of Origin"],
    relatedRegistrations: ["IEC", "RCMC"],
    relatedSchemes: ["RoDTEP"],
    source: sources.spiceBoard
  }),
  item({
    id: "export-tea-board",
    type: "registration",
    industry: "EXPORT_IMPORT",
    title: "Tea Board exporter services",
    summary: "Tea Board India is the official board for tea sector services.",
    applicability: "Relevant when exporting tea products covered by Tea Board rules.",
    eligibility: "Depends on Tea Board service rules and product coverage.",
    requiredDocuments: "IEC, business details, product details, and board-requested documents.",
    benefits: "Access to tea export-related services where applicable.",
    fees: "Not specified by the verified corpus.",
    processingTime: "Not specified by the verified corpus.",
    renewal: "Not specified by the verified corpus.",
    dependencies: "IEC and tea product category.",
    faqs: notSpecified,
    validity: notSpecified,
    relatedArticles: ["RCMC"],
    relatedRegistrations: ["IEC", "RCMC"],
    relatedSchemes: [],
    source: sources.teaBoard
  }),
  item({
    id: "export-coffee-board",
    type: "registration",
    industry: "EXPORT_IMPORT",
    title: "Coffee Board exporter services",
    summary: "Coffee Board of India is the official board for coffee sector services.",
    applicability: "Relevant when exporting coffee products covered by Coffee Board rules.",
    eligibility: "Depends on Coffee Board service rules and product coverage.",
    requiredDocuments: "IEC, business details, product details, and board-requested documents.",
    benefits: "Access to coffee export-related services where applicable.",
    fees: "Not specified by the verified corpus.",
    processingTime: "Not specified by the verified corpus.",
    renewal: "Not specified by the verified corpus.",
    dependencies: "IEC and coffee product category.",
    faqs: notSpecified,
    validity: notSpecified,
    relatedArticles: ["RCMC"],
    relatedRegistrations: ["IEC", "RCMC"],
    relatedSchemes: [],
    source: sources.coffeeBoard
  }),
  item({
    id: "export-fieo",
    type: "registration",
    industry: "EXPORT_IMPORT",
    title: "FIEO exporter membership",
    summary: "FIEO provides exporter facilitation and membership services.",
    applicability: "Relevant to exporters seeking multi-product exporter facilitation and membership support.",
    eligibility: "Depends on FIEO membership rules.",
    requiredDocuments: "IEC, business details, product/service details, and FIEO-requested documents.",
    benefits: "Exporter facilitation, events, market-linkage and advisory support where applicable.",
    fees: "Not specified by the verified corpus.",
    processingTime: "Not specified by the verified corpus.",
    renewal: "Not specified by the verified corpus.",
    dependencies: "IEC and exporter profile.",
    faqs: notSpecified,
    validity: notSpecified,
    relatedArticles: ["RCMC", "DGFT"],
    relatedRegistrations: ["IEC", "RCMC"],
    relatedSchemes: [],
    source: sources.fieo
  }),
  item({
    id: "export-gst-lut",
    type: "compliance",
    industry: "EXPORT_IMPORT",
    title: "GST LUT for exporters",
    summary: "GST/CBIC resources cover GST law, circulars, notifications and export-related tax processes such as LUT where applicable.",
    applicability: "Relevant for exporters making zero-rated supplies where LUT is applicable under GST rules.",
    eligibility: "Depends on GST law and exporter status.",
    requiredDocuments: "GST registration, exporter details, and documents requested by GST portal for LUT.",
    benefits: "Supports export without payment of integrated tax where LUT conditions apply.",
    fees: "Not specified by the verified corpus.",
    processingTime: "Not specified by the verified corpus.",
    renewal: "LUT workflow is handled through GST portal as per GST rules.",
    dependencies: "GST registration and exporter profile.",
    faqs: notSpecified,
    validity: "As per GST rules.",
    relatedArticles: ["GST for exporters", "IEC"],
    relatedRegistrations: ["GST", "IEC"],
    relatedSchemes: ["RoDTEP"],
    source: sources.cbic
  }),
  item({
    id: "export-rodtep",
    type: "scheme",
    industry: "EXPORT_IMPORT",
    title: "RoDTEP overview",
    summary: "RoDTEP is an export remission scheme covered through government trade/customs notifications and portals.",
    applicability: "Potentially relevant to eligible exported products subject to official RoDTEP schedules and conditions.",
    eligibility: "Eligibility depends on product, export classification, notifications, and applicable exclusions.",
    requiredDocuments: "Shipping bill/export documents and documents required by customs/DGFT workflows.",
    benefits: "Remission benefit depends on official rates/schedules and eligible export product.",
    fees: "Not specified by the verified corpus.",
    processingTime: "Not specified by the verified corpus.",
    renewal: null,
    dependencies: "IEC, GST/LUT where applicable, shipping bill, product eligibility.",
    faqs: notSpecified,
    validity: "As per official notifications.",
    relatedArticles: ["ICEGATE", "DGFT", "Shipping Bill"],
    relatedRegistrations: ["IEC", "ICEGATE"],
    relatedSchemes: [],
    source: sources.dgft
  }),
  item({
    id: "export-documents",
    type: "document",
    industry: "EXPORT_IMPORT",
    title: "Export documentation packet",
    summary: "Export workflows commonly rely on customs, logistics, bank, tax and origin documents, with official filing through DGFT/ICEGATE/GST where applicable.",
    applicability: "Relevant to merchant exporters and manufacturer exporters.",
    eligibility: "Document need depends on product, destination, customs process, buyer terms and official portal requirements.",
    requiredDocuments: "Commercial invoice, packing list, shipping bill, transport document, IEC, GST/LUT where applicable, bank/AD code records, certificate of origin where required.",
    benefits: "Creates a reusable export packet for customs, bank, council, and incentive workflows.",
    fees: "Not specified by the verified corpus.",
    processingTime: "Process-specific and not specified by the verified corpus.",
    renewal: null,
    dependencies: "IEC, ICEGATE/customs workflow, GST/LUT where applicable.",
    faqs: notSpecified,
    validity: "Document-specific.",
    relatedArticles: ["Shipping Bill", "Certificate of Origin"],
    relatedRegistrations: ["IEC", "RCMC"],
    relatedSchemes: ["RoDTEP"],
    source: sources.icegate
  }),
  item({
    id: "export-shipping-bill",
    type: "document",
    industry: "EXPORT_IMPORT",
    title: "Shipping Bill",
    summary: "Shipping bill is part of customs export filing workflows handled through customs electronic systems.",
    applicability: "Relevant for export shipments requiring customs filing.",
    eligibility: "Depends on customs export process, product, port and filer role.",
    requiredDocuments: "IEC, invoice, packing list, AD code/bank details and customs-required shipment details.",
    benefits: "Primary customs export declaration record for shipment processing and incentives where applicable.",
    fees: "Not specified by the verified corpus.",
    processingTime: "Not specified by the verified corpus.",
    renewal: null,
    dependencies: "IEC, ICEGATE/customs access, AD code where applicable.",
    faqs: notSpecified,
    validity: "Shipment-specific.",
    relatedArticles: ["ICEGATE", "RoDTEP"],
    relatedRegistrations: ["IEC", "ICEGATE"],
    relatedSchemes: ["RoDTEP"],
    source: sources.icegate
  }),
  item({
    id: "export-bill-of-lading",
    type: "document",
    industry: "EXPORT_IMPORT",
    title: "Bill of Lading",
    summary: "Bill of Lading is a transport/shipping document; detailed issuance terms are not available from the verified government corpus used here.",
    applicability: "Relevant to sea shipments, subject to carrier/logistics process and customs/bank requirements.",
    eligibility: "Information unavailable from verified government source.",
    requiredDocuments: "Information unavailable from verified government source.",
    benefits: null,
    fees: "Information unavailable from verified government source.",
    processingTime: "Information unavailable from verified government source.",
    renewal: null,
    dependencies: "Export documentation packet and shipment booking.",
    faqs: notSpecified,
    validity: "Shipment-specific.",
    relatedArticles: ["Shipping Bill", "Export documentation packet"],
    relatedRegistrations: [],
    relatedSchemes: [],
    source: sources.icegate
  }),
  item({
    id: "export-certificate-origin",
    type: "document",
    industry: "EXPORT_IMPORT",
    title: "Certificate of Origin",
    summary: "DGFT operates a Common Digital Platform for Certificate of Origin.",
    applicability: "Relevant when buyer, destination country, trade agreement, bank, or customs process requires origin certification.",
    eligibility: "Depends on export product, destination, origin criteria and certificate type.",
    requiredDocuments: "Exporter profile, IEC, invoice/product details, origin-supporting documents and portal-requested documents.",
    benefits: "Supports preferential/non-preferential origin certification where applicable.",
    fees: "Not specified by the verified corpus.",
    processingTime: "Not specified by the verified corpus.",
    renewal: null,
    dependencies: "IEC, export invoice/product data, and origin evidence.",
    faqs: notSpecified,
    validity: "Document-specific.",
    relatedArticles: ["DGFT", "Export documentation packet"],
    relatedRegistrations: ["IEC"],
    relatedSchemes: [],
    source: sources.coo
  })
];

export const demoProfiles: DemoProfile[] = [
  {
    id: "profile-priya-cloud-kitchen",
    businessName: "Priya's Millet Kitchen",
    ownerName: "Priya Sharma",
    businessCategory: "FOOD",
    businessActivity: "Cloud Kitchen",
    stage: "PRE_REGISTRATION",
    state: "Uttar Pradesh",
    district: "Lucknow",
    city: "Lucknow",
    pin: "226010",
    ownership: "PROPRIETORSHIP",
    turnover: 920000,
    investment: 375000,
    employees: 4,
    annualIncome: 480000,
    socialCategory: "OBC",
    gender: "Female",
    age: 28,
    education: "Graduate",
    existingRegistrations: ["PAN", "Aadhaar"],
    existingLicenses: [],
    hasGst: false,
    hasPan: true,
    hasAadhaar: true,
    hasUdyam: false,
    hasFssai: false,
    hasIec: false,
    hasFactoryLicense: false,
    premises: "RENTED",
    rental: true,
    owned: false,
    manufacturing: false,
    trading: false,
    foodCategory: "Prepared meals and bakery snacks",
    coldStorage: false,
    warehouse: false,
    exportDestination: null,
    importProducts: null,
    bankAccount: true,
    loanStatus: "No active business loan",
    creditHistory: "Thin file",
    mobile: "+91-98xxxxxx10",
    email: "priya@example.com",
    languages: ["English", "Hindi"],
    documents: [],
    recommendations: [],
    timeline: []
  },
  {
    id: "profile-rahul-merchant-exporter",
    businessName: "Rahul Global Traders",
    ownerName: "Rahul Mehta",
    businessCategory: "EXPORT_IMPORT",
    businessActivity: "Merchant Exporter",
    stage: "EXPORT_READY",
    state: "Gujarat",
    district: "Ahmedabad",
    city: "Ahmedabad",
    pin: "380015",
    ownership: "PROPRIETORSHIP",
    turnover: 4200000,
    investment: 650000,
    employees: 6,
    annualIncome: 850000,
    socialCategory: "General",
    gender: "Male",
    age: 34,
    education: "MBA",
    existingRegistrations: ["PAN", "GST", "Udyam"],
    existingLicenses: ["IEC"],
    hasGst: true,
    hasPan: true,
    hasAadhaar: true,
    hasUdyam: true,
    hasFssai: false,
    hasIec: true,
    hasFactoryLicense: false,
    premises: "RENTED",
    rental: true,
    owned: false,
    manufacturing: false,
    trading: true,
    foodCategory: null,
    coldStorage: false,
    warehouse: true,
    exportDestination: "UAE and Singapore",
    importProducts: "Packaging material",
    bankAccount: true,
    loanStatus: "Working capital limit under discussion",
    creditHistory: "Established banking history",
    mobile: "+91-99xxxxxx34",
    email: "rahul@example.com",
    languages: ["English", "Hindi", "Gujarati"],
    documents: [],
    recommendations: [],
    timeline: []
  }
];

const priyaDocuments: DemoDocument[] = [
  {
    id: "doc-priya-aadhaar",
    profileId: "profile-priya-cloud-kitchen",
    fileName: "Priya_Aadhaar.pdf",
    documentType: "Aadhaar",
    status: "VERIFIED",
    acceptedFormat: "PDF/JPG/PNG",
    maximumSize: "Not specified by verified corpus",
    requiredFor: ["Udyam", "FSSAI", "PMFME"],
    governmentAuthority: "UIDAI / consuming government portals",
    reuseCount: 4,
    aiExtractionStatus: "Extracted name, address and masked identifier",
    extractedFields: { name: "Priya Sharma", city: "Lucknow", mobileLinked: "Yes" },
    missingFields: [],
    mismatchFlags: [],
    expiry: "No expiry detected"
  },
  {
    id: "doc-priya-pan",
    profileId: "profile-priya-cloud-kitchen",
    fileName: "Priya_PAN.pdf",
    documentType: "PAN",
    status: "VERIFIED",
    acceptedFormat: "PDF/JPG/PNG",
    maximumSize: "Not specified by verified corpus",
    requiredFor: ["GST", "Udyam", "PMEGP"],
    governmentAuthority: "Income Tax Department / consuming government portals",
    reuseCount: 5,
    aiExtractionStatus: "Extracted PAN name and identifier",
    extractedFields: { name: "Priya Sharma", panStatus: "Readable" },
    missingFields: [],
    mismatchFlags: [],
    expiry: "No expiry detected"
  },
  {
    id: "doc-priya-rent",
    profileId: "profile-priya-cloud-kitchen",
    fileName: "Commercial_Rent_Agreement.pdf",
    documentType: "Premises proof",
    status: "NEEDS_REVIEW",
    acceptedFormat: "PDF/JPG/PNG",
    maximumSize: "Not specified by verified corpus",
    requiredFor: ["FSSAI", "Trade License", "GST"],
    governmentAuthority: "FoSCoS / GST / local authority",
    reuseCount: 3,
    aiExtractionStatus: "Premises address extracted; owner consent clause not detected",
    extractedFields: { address: "Gomti Nagar, Lucknow", premises: "Commercial kitchen" },
    missingFields: ["Owner consent clause"],
    mismatchFlags: ["Needs human review before submission"],
    expiry: "2027-03-31"
  },
  {
    id: "doc-priya-bank",
    profileId: "profile-priya-cloud-kitchen",
    fileName: "Bank_Statement_April_June.pdf",
    documentType: "Bank statement",
    status: "EXTRACTED",
    acceptedFormat: "PDF",
    maximumSize: "Not specified by verified corpus",
    requiredFor: ["PMFME", "PMEGP", "MUDRA"],
    governmentAuthority: "Bank / scheme portals",
    reuseCount: 3,
    aiExtractionStatus: "Account holder and IFSC extracted",
    extractedFields: { accountHolder: "Priya Sharma", bank: "Demo Bank", ifsc: "DEMO0002260" },
    missingFields: [],
    mismatchFlags: [],
    expiry: "Statement period document"
  }
];

const rahulDocuments: DemoDocument[] = [
  {
    id: "doc-rahul-iec",
    profileId: "profile-rahul-merchant-exporter",
    fileName: "IEC_Certificate.pdf",
    documentType: "IEC",
    status: "VERIFIED",
    acceptedFormat: "PDF",
    maximumSize: "Not specified by verified corpus",
    requiredFor: ["ICEGATE", "RCMC", "APEDA", "Certificate of Origin"],
    governmentAuthority: "DGFT",
    reuseCount: 6,
    aiExtractionStatus: "IEC and firm name extracted",
    extractedFields: { iec: "Verified from uploaded certificate", firm: "Rahul Global Traders" },
    missingFields: [],
    mismatchFlags: [],
    expiry: "Not specified by verified corpus"
  },
  {
    id: "doc-rahul-gst",
    profileId: "profile-rahul-merchant-exporter",
    fileName: "GST_Certificate.pdf",
    documentType: "GST registration",
    status: "VERIFIED",
    acceptedFormat: "PDF/JPG/PNG",
    maximumSize: "Not specified by verified corpus",
    requiredFor: ["LUT", "Export invoices", "GeM"],
    governmentAuthority: "GSTN / CBIC",
    reuseCount: 5,
    aiExtractionStatus: "GSTIN, legal name and place extracted",
    extractedFields: { gstin: "Verified from uploaded certificate", place: "Ahmedabad, Gujarat" },
    missingFields: [],
    mismatchFlags: [],
    expiry: "Not specified by verified corpus"
  },
  {
    id: "doc-rahul-bank",
    profileId: "profile-rahul-merchant-exporter",
    fileName: "AD_Code_Bank_Letter.pdf",
    documentType: "AD Code letter",
    status: "NEEDS_REVIEW",
    acceptedFormat: "PDF",
    maximumSize: "Not specified by verified corpus",
    requiredFor: ["AD Code registration", "Shipping Bill"],
    governmentAuthority: "ICEGATE / Customs / Authorized dealer bank",
    reuseCount: 2,
    aiExtractionStatus: "Bank branch and account detected; port mapping not present",
    extractedFields: { bank: "Demo Bank", branch: "Ahmedabad Main", account: "Masked" },
    missingFields: ["Port mapping"],
    mismatchFlags: ["Upload fresh bank letter for final submission"],
    expiry: "Not specified by verified corpus"
  },
  {
    id: "doc-rahul-invoice",
    profileId: "profile-rahul-merchant-exporter",
    fileName: "Sample_Commercial_Invoice.pdf",
    documentType: "Commercial invoice",
    status: "EXTRACTED",
    acceptedFormat: "PDF",
    maximumSize: "Not specified by verified corpus",
    requiredFor: ["Shipping Bill", "Certificate of Origin", "Bank export documents"],
    governmentAuthority: "Customs / DGFT / Bank consuming workflows",
    reuseCount: 4,
    aiExtractionStatus: "Buyer, destination and product fields extracted",
    extractedFields: { destination: "UAE", product: "Processed food packets", currency: "USD" },
    missingFields: [],
    mismatchFlags: [],
    expiry: "Shipment-specific"
  }
];

demoProfiles[0].documents = priyaDocuments;
demoProfiles[1].documents = rahulDocuments;

const sourceByItem = Object.fromEntries(demoKnowledge.map((knowledgeItem) => [knowledgeItem.id, knowledgeItem.source]));

demoProfiles[0].recommendations = [
  recommendation({
    id: "rec-priya-fssai",
    profileId: demoProfiles[0].id,
    title: "Start FoSCoS/FSSAI registration first",
    status: "ELIGIBLE",
    why: "Priya is operating a food business from a rented commercial kitchen. FoSCoS is the official FSSAI portal for food registration/licensing workflows.",
    whyNow: "FSSAI is a core food-business registration and it unlocks cleaner downstream packets for local trade license, GST marketplace use, PMFME and procurement conversations.",
    skippedImpact: "Skipping this can block food-platform onboarding, scheme files, and formal compliance evidence.",
    estimatedDelay: "7-21 days depending on official portal and document review",
    expectedBenefit: "Compliance readiness for food operations; direct monetary benefit not specified by verified corpus.",
    expectedTimeline: "Portal-specific; not specified by verified corpus",
    documentsNeeded: ["Aadhaar", "PAN", "Commercial rent agreement", "Food category details"],
    officialPortal: sources.foscos.applicationPortal ?? sources.foscos.officialUrl,
    applicationSteps: "Create/login on FoSCoS, select relevant registration/license service, enter business and premises details, upload documents, pay portal-displayed fee, submit.",
    confidence: 94,
    evidenceUsed: ["Business activity: Cloud Kitchen", "Location: Lucknow", "Premises: rented commercial kitchen", "Documents: Aadhaar, PAN, premises proof"],
    rulesMatched: ["Food business operator -> FoSCoS route", "Rented premises -> premises proof required"],
    documentsUsed: ["Aadhaar", "PAN", "Commercial rent agreement"],
    citations: [{ id: "cit-foscos", source: sourceByItem["food-fssai-registration"] }]
  }),
  recommendation({
    id: "rec-priya-udyam",
    profileId: demoProfiles[0].id,
    title: "Create Udyam MSME registration",
    status: "ELIGIBLE",
    why: "The business is a micro food enterprise based on stated turnover and investment; Udyam is the official MSME registration portal.",
    whyNow: "Udyam can be reused in PMFME/PMEGP/GeM-style workflows and removes repeated MSME identity questions.",
    skippedImpact: "Scheme and procurement workflows may ask for MSME identity again.",
    estimatedDelay: "Same day to portal-specific confirmation; exact time not specified by verified corpus",
    expectedBenefit: "MSME identity and eligibility pathway for linked MSME benefits where applicable.",
    expectedTimeline: "Not specified by verified corpus",
    documentsNeeded: ["Aadhaar", "PAN", "Business details"],
    officialPortal: sources.udyam.applicationPortal ?? sources.udyam.officialUrl,
    applicationSteps: "Open Udyam portal, enter Aadhaar/PAN-linked details, add business and classification details, submit registration.",
    confidence: 91,
    evidenceUsed: ["Investment: Rs. 3.75 lakh", "Turnover: Rs. 9.2 lakh", "Business type: food enterprise"],
    rulesMatched: ["MSME profile -> Udyam route"],
    documentsUsed: ["Aadhaar", "PAN"],
    citations: [{ id: "cit-udyam", source: sourceByItem["common-udyam-food"] }]
  }),
  recommendation({
    id: "rec-priya-pmfme",
    profileId: demoProfiles[0].id,
    title: "Prepare PMFME file after Udyam and bank packet",
    status: "POTENTIAL",
    why: "PMFME targets micro food processing enterprises. Priya's food business can be assessed after enterprise and bank/project documents are complete.",
    whyNow: "The project file can be prepared in parallel while registrations move.",
    skippedImpact: "Subsidy/credit-linked support discovery is delayed.",
    estimatedDelay: "2-4 weeks to prepare a credible application packet",
    expectedBenefit: "Credit-linked subsidy may be available subject to PMFME rules and approved project cost.",
    expectedTimeline: "Not specified by verified corpus",
    documentsNeeded: ["Udyam", "Bank statement", "Project proposal", "Food business details"],
    officialPortal: sources.pmfme.applicationPortal ?? sources.pmfme.officialUrl,
    applicationSteps: "Check PMFME eligibility, prepare project file, collect bank documents, submit through official/state PMFME workflow.",
    confidence: 82,
    evidenceUsed: ["Food business", "Micro scale", "Bank statement uploaded", "No business loan active"],
    rulesMatched: ["Food processing activity -> PMFME potential"],
    documentsUsed: ["Bank statement", "Aadhaar", "PAN"],
    citations: [{ id: "cit-pmfme", source: sourceByItem["food-pmfme"] }]
  })
];

demoProfiles[1].recommendations = [
  recommendation({
    id: "rec-rahul-ad-code",
    profileId: demoProfiles[1].id,
    title: "Complete AD Code/ICEGATE export readiness",
    status: "POTENTIAL",
    why: "Rahul already has IEC, GST and Udyam. The next operational blocker is bank/customs linkage before shipment filing.",
    whyNow: "AD Code and ICEGATE readiness reduce last-mile shipment delays before the first export order.",
    skippedImpact: "Shipping bill filing and bank remittance linkage can be delayed.",
    estimatedDelay: "3-10 working days depending on bank/customs process; exact time not specified by verified corpus",
    expectedBenefit: "Operational readiness for customs export filing; direct monetary benefit not specified.",
    expectedTimeline: "Not specified by verified corpus",
    documentsNeeded: ["IEC certificate", "GST certificate", "AD Code bank letter", "Bank account details"],
    officialPortal: sources.icegate.applicationPortal ?? sources.icegate.officialUrl,
    applicationSteps: "Verify IEC/GST profile, collect AD Code bank letter, complete relevant ICEGATE/customs workflow, keep shipment documents ready.",
    confidence: 88,
    evidenceUsed: ["Existing IEC", "Existing GST", "Merchant exporter", "Warehouse present", "AD Code letter needs review"],
    rulesMatched: ["Exporter with IEC -> customs readiness route", "Shipping bill -> AD Code dependency"],
    documentsUsed: ["IEC certificate", "GST certificate", "AD Code bank letter"],
    citations: [
      { id: "cit-icegate", source: sourceByItem["export-icegate"] },
      { id: "cit-ad-code", source: sourceByItem["export-ad-code"] }
    ]
  }),
  recommendation({
    id: "rec-rahul-apeda",
    profileId: demoProfiles[1].id,
    title: "Check APEDA/board mapping for processed food exports",
    status: "POTENTIAL",
    why: "The sample invoice mentions processed food packets. APEDA may be relevant if the product falls under APEDA scheduled product coverage.",
    whyNow: "Council/board mapping should happen before quoting buyers because it affects certificates, support services and export packet structure.",
    skippedImpact: "Wrong council route can delay RCMC, certificates and buyer documentation.",
    estimatedDelay: "1-2 weeks for mapping and document preparation; exact time not specified by verified corpus",
    expectedBenefit: "Correct export promotion council route and cleaner RCMC/application packet.",
    expectedTimeline: "Not specified by verified corpus",
    documentsNeeded: ["IEC", "Business details", "Product details", "Invoice/product sheet"],
    officialPortal: sources.apeda.applicationPortal ?? sources.apeda.officialUrl,
    applicationSteps: "Match export product to APEDA/commodity board coverage, prepare IEC and product documents, apply through relevant official portal if applicable.",
    confidence: 79,
    evidenceUsed: ["Merchant exporter", "Product: processed food packets", "Destination: UAE/Singapore"],
    rulesMatched: ["Processed food product -> APEDA check"],
    documentsUsed: ["IEC", "Commercial invoice"],
    citations: [{ id: "cit-apeda", source: sourceByItem["export-apeda"] }]
  }),
  recommendation({
    id: "rec-rahul-lut",
    profileId: demoProfiles[1].id,
    title: "Prepare GST LUT before export invoicing",
    status: "POTENTIAL",
    why: "Rahul has GST and is export-ready. LUT may be relevant for zero-rated export supplies where GST rules permit.",
    whyNow: "Completing LUT before invoicing avoids tax-treatment confusion at shipment time.",
    skippedImpact: "Export invoicing and tax treatment may require rework.",
    estimatedDelay: "Portal-specific; exact time not specified by verified corpus",
    expectedBenefit: "Supports export without payment of integrated tax where LUT conditions apply.",
    expectedTimeline: "Not specified by verified corpus",
    documentsNeeded: ["GST certificate", "Exporter profile", "Authorized signatory details"],
    officialPortal: sources.gst.applicationPortal ?? sources.gst.officialUrl,
    applicationSteps: "Use GST portal services to prepare LUT where applicable under GST rules.",
    confidence: 83,
    evidenceUsed: ["GST present", "Export destinations present", "Merchant exporter"],
    rulesMatched: ["Exporter with GST -> LUT check"],
    documentsUsed: ["GST certificate"],
    citations: [{ id: "cit-lut", source: sourceByItem["export-gst-lut"] }]
  })
];

demoProfiles[0].timeline = [
  step("t-priya-1", "Collect premises proof", "Ready", "Week 1", "FoSCoS / GST / Local authority", "Required for rented commercial kitchen", "Premises proof is reused across FSSAI, GST and local registration packets."),
  step("t-priya-2", "Udyam registration", "Ready", "Week 1", "Ministry of MSME", "Aadhaar and PAN available", "Udyam creates the MSME identity used by multiple scheme and procurement flows."),
  step("t-priya-3", "FSSAI on FoSCoS", "Ready", "Week 1", "FSSAI", "Food business operator route", "A food business should anchor its compliance journey in the official food safety portal."),
  step("t-priya-4", "GST applicability check", "Queued", "Week 2", "GSTN", "PAN and premises details", "GST need depends on turnover/model, but the packet can be prepared early."),
  step("t-priya-5", "PMFME project file", "Queued", "Week 3", "MoFPI", "Udyam, bank statement and project details", "Scheme readiness improves after core registration documents are in place.")
];

demoProfiles[1].timeline = [
  step("t-rahul-1", "Refresh DGFT/IEC profile", "Done", "Week 1", "DGFT", "IEC exists", "Accurate IEC profile is the base for export workflows."),
  step("t-rahul-2", "AD Code and ICEGATE readiness", "In progress", "Week 1", "CBIC / ICEGATE", "Bank AD Code letter needs review", "Customs and bank linkage should be ready before shipment filing."),
  step("t-rahul-3", "Council or board mapping", "Ready", "Week 2", "DGFT / APEDA / Boards", "Product category needed", "Processed food exports may need APEDA or a relevant board route."),
  step("t-rahul-4", "GST LUT check", "Ready", "Week 2", "GSTN / CBIC", "GST present", "LUT should be assessed before export invoice generation."),
  step("t-rahul-5", "Shipping bill packet", "Queued", "Week 3", "ICEGATE", "AD Code and shipment docs", "Shipping bill is the customs export declaration record.")
];

function recommendation(input: DemoRecommendation): DemoRecommendation {
  return input;
}

function step(id: string, title: string, status: DemoTimelineStep["status"], week: string, authority: string, dependency: string, why: string): DemoTimelineStep {
  return { id, title, status, week, authority, dependency, why };
}

export function getDemoKnowledgeSummary() {
  return {
    verifiedSources: Object.keys(sources).length,
    documents: demoKnowledge.length,
    rules: demoDependencyItems.length
  };
}

export function getDemoLatestVerifiedSources(limit = 10) {
  const uniqueSources = Array.from(new Map(demoKnowledge.map((knowledgeItem) => [knowledgeItem.source.id, knowledgeItem.source])).values());
  return uniqueSources.slice(0, limit);
}

export function getDemoKnowledgeArticles(query?: string) {
  if (!query?.trim()) return demoKnowledge;
  const normalized = query.toLowerCase();
  const matches = demoKnowledge.filter((knowledgeItem) =>
    [
      knowledgeItem.title,
      knowledgeItem.summary,
      knowledgeItem.applicability,
      knowledgeItem.eligibility,
      knowledgeItem.requiredDocuments,
      knowledgeItem.benefits,
      knowledgeItem.source.authority.name,
      knowledgeItem.source.officialUrl,
      knowledgeItem.industry,
      knowledgeItem.type
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalized))
  );
  return matches.length ? matches : demoKnowledge.slice(0, 8);
}

export function getDemoVerifiedRegistrations() {
  return demoKnowledge.filter((knowledgeItem) => ["registration", "compliance", "portal", "document"].includes(knowledgeItem.type));
}

export function getDemoSchemeKnowledge() {
  return demoKnowledge.filter((knowledgeItem) => knowledgeItem.type === "scheme");
}

export function getDemoKnowledgeByIndustry(industry: DemoIndustry) {
  return demoKnowledge.filter((knowledgeItem) => knowledgeItem.industry === industry);
}

export function getDemoLatestNotifications() {
  return getDemoLatestVerifiedSources(20);
}

export function getDemoPendingSources() {
  return getDemoLatestVerifiedSources(8).map((demoSource) => ({
    ...demoSource,
    status: "VERIFIED" as const
  }));
}

export function getDemoProfiles() {
  return demoProfiles;
}

export function getDemoLatestProfile() {
  return demoProfiles[0];
}

export function getDemoProfileById(profileId: string) {
  return demoProfiles.find((profile) => profile.id === profileId) ?? demoProfiles[0];
}

export const demoDependencyItems = [
  { id: "food-profile", label: "Food profile", dependsOn: [] as string[], why: "Business activity and premises decide the compliance route." },
  { id: "udyam", label: "Udyam", dependsOn: ["food-profile"], why: "MSME identity uses Aadhaar/PAN and business classification." },
  { id: "fssai", label: "FSSAI / FoSCoS", dependsOn: ["food-profile"], why: "Food business workflows start from the official food safety portal." },
  { id: "gst-food", label: "GST check", dependsOn: ["food-profile"], why: "GST applicability depends on business model and turnover." },
  { id: "trade-license", label: "Trade License", dependsOn: ["food-profile"], why: "Local-body applicability depends on premises and activity." },
  { id: "pmfme", label: "PMFME", dependsOn: ["udyam", "fssai"], why: "Food scheme packet benefits from enterprise and food registration readiness." },
  { id: "pmegp", label: "PMEGP", dependsOn: ["udyam"], why: "Project and enterprise documents support bank/sponsoring agency appraisal." },
  { id: "export-profile", label: "Export profile", dependsOn: [] as string[], why: "Product, destination and exporter type decide the route." },
  { id: "iec", label: "IEC", dependsOn: ["export-profile"], why: "DGFT IEC anchors importer/exporter identity." },
  { id: "icegate", label: "ICEGATE", dependsOn: ["iec"], why: "Customs workflows use exporter/importer identifiers." },
  { id: "ad-code", label: "AD Code", dependsOn: ["iec", "icegate"], why: "Bank and customs linkage supports shipment filing/remittance flow." },
  { id: "rcmc", label: "RCMC / Council", dependsOn: ["iec"], why: "Council route depends on product category." },
  { id: "apeda", label: "APEDA", dependsOn: ["iec", "rcmc"], why: "Processed food/agri exports may map to APEDA coverage." },
  { id: "gst-lut", label: "GST LUT", dependsOn: ["iec"], why: "Export GST treatment depends on GST/LUT applicability." },
  { id: "shipping-bill", label: "Shipping Bill", dependsOn: ["icegate", "ad-code"], why: "Shipment filing needs customs and bank linkage readiness." },
  { id: "rodtep", label: "RoDTEP check", dependsOn: ["shipping-bill"], why: "Export remission depends on shipment/product eligibility." }
];

export function getDemoDependencyItems() {
  return demoDependencyItems;
}

export function calculateProfileScores(profile: DemoProfile) {
  const verifiedDocuments = profile.documents.filter((document) => ["VERIFIED", "EXTRACTED"].includes(document.status)).length;
  const documentCompletion = Math.round((verifiedDocuments / Math.max(profile.documents.length, 1)) * 100);
  const profileFields = [
    profile.businessName,
    profile.businessActivity,
    profile.state,
    profile.district,
    profile.pin,
    profile.ownership,
    profile.turnover,
    profile.investment,
    profile.mobile,
    profile.email,
    profile.bankAccount
  ];
  const profileCompletion = Math.round((profileFields.filter(Boolean).length / profileFields.length) * 100);
  const registrationFlags =
    profile.businessCategory === "FOOD" ? [profile.hasPan, profile.hasAadhaar, profile.hasUdyam, profile.hasFssai, profile.hasGst] : [profile.hasPan, profile.hasAadhaar, profile.hasUdyam, profile.hasIec, profile.hasGst];
  const registrationCompletion = Math.round((registrationFlags.filter(Boolean).length / registrationFlags.length) * 100);
  const timelineReady = profile.timeline.filter((stepItem) => ["Ready", "Done", "In progress"].includes(stepItem.status)).length;
  const timelineScore = Math.round((timelineReady / Math.max(profile.timeline.length, 1)) * 100);
  const readiness = Math.round(documentCompletion * 0.3 + profileCompletion * 0.2 + registrationCompletion * 0.35 + timelineScore * 0.15);

  return {
    readiness,
    documentCompletion,
    profileCompletion,
    registrationCompletion,
    timelineScore,
    opportunityScore: profile.recommendations.length ? Math.round(profile.recommendations.reduce((sum, rec) => sum + rec.confidence, 0) / profile.recommendations.length) : 0,
    foodScore: profile.businessCategory === "FOOD" ? readiness : 0,
    exportScore: profile.businessCategory === "EXPORT_IMPORT" ? readiness : 0
  };
}

export function getDemoDashboardData() {
  const profileCards = demoProfiles.map((profile) => ({
    profile,
    scores: calculateProfileScores(profile),
    pendingActions: profile.timeline.filter((stepItem) => stepItem.status !== "Done").slice(0, 3)
  }));
  const knowledgeSummary = getDemoKnowledgeSummary();

  return {
    profileCards,
    knowledgeSummary,
    latestUpdates: getDemoLatestVerifiedSources(6),
    deadlines: [
      { id: "deadline-priya-fssai", title: "Priya: submit FoSCoS/FSSAI packet", due: "This week", authority: "FSSAI", source: sources.foscos },
      { id: "deadline-priya-udyam", title: "Priya: complete Udyam", due: "This week", authority: "Ministry of MSME", source: sources.udyam },
      { id: "deadline-rahul-ad", title: "Rahul: refresh AD Code bank letter", due: "48 hours", authority: "CBIC / ICEGATE", source: sources.icegate },
      { id: "deadline-rahul-lut", title: "Rahul: check GST LUT before export invoice", due: "Before shipment", authority: "GSTN / CBIC", source: sources.cbic }
    ],
    moneyAvailable: [
      { title: "PMFME", value: "Credit-linked subsidy subject to official scheme rules", source: sources.pmfme },
      { title: "PMEGP", value: "Margin money subsidy subject to category/location/project rules", source: sources.pmegp },
      { title: "MUDRA", value: "Micro-enterprise loan categories through lending institutions", source: sources.mudra },
      { title: "Stand-Up India", value: "Bank loan facilitation for eligible women/SC/ST entrepreneurs", source: sources.standup }
    ]
  };
}

export function answerFromDemoKnowledge(question: string) {
  const q = question.toLowerCase();
  let citations: DemoSource[] = [];
  let answer = "";
  let suggestedNextAction = "";
  let missingInformation: string[] = [];

  if (q.includes("export") || q.includes("iec") || q.includes("ad code") || q.includes("spice") || q.includes("shipping")) {
    const profile = demoProfiles[1];
    const next = profile.recommendations[0];
    citations = [sources.dgft, sources.icegate, sources.apeda, sources.cbic];
    answer = `${profile.ownerName} should complete AD Code/ICEGATE readiness next because IEC, GST and Udyam are already present, while the AD Code bank letter still needs review. If the exported product is processed food, the APEDA/council mapping should be checked before shipping documentation. For GST treatment, assess LUT on the GST portal/CBIC rules before export invoicing.`;
    suggestedNextAction = next.applicationSteps;
    missingInformation = ["Exact AD Code processing time is not specified in the verified corpus.", "Product-specific export incentive rate is not present in the curated corpus."];
  } else if (q.includes("subsidy") || q.includes("benefit") || q.includes("money") || q.includes("loan")) {
    citations = [sources.pmfme, sources.pmegp, sources.mudra, sources.standup];
    answer = "For Priya's food business, PMFME and PMEGP are the strongest source-backed scheme routes to prepare. PMFME is relevant because the business is in food processing/food operations, while PMEGP and MUDRA should be evaluated through bank/project appraisal. Stand-Up India is also worth checking because Priya is a woman entrepreneur, subject to official scheme and bank eligibility.";
    suggestedNextAction = "Create Udyam first, then prepare bank statement, project cost, premises proof and FSSAI/FoSCoS documents before applying for scheme support.";
    missingInformation = ["Exact admissible subsidy amount needs official project-cost appraisal and scheme portal/bank assessment."];
  } else if (q.includes("missing") || q.includes("document")) {
    citations = [sources.foscos, sources.udyam, sources.icegate, sources.dgft];
    answer = "Priya's main missing or review-needed item is premises proof: the commercial rent agreement was extracted, but owner consent needs review before it is reused for FSSAI, GST or local registration. Rahul's review item is the AD Code bank letter because the port mapping was not detected.";
    suggestedNextAction = "Open Document Vault, review the flagged document, and replace it with a clean PDF before submission.";
    missingInformation = [];
  } else if (q.includes("skip") || q.includes("why")) {
    citations = [sources.foscos, sources.udyam, sources.icegate, sources.cbic];
    answer = "Skipping core identity registrations causes downstream delays. For food businesses, FoSCoS/FSSAI and Udyam create reusable evidence for compliance and schemes. For exporters, IEC and ICEGATE/AD Code readiness support shipment filing, remittance linkage and export documentation.";
    suggestedNextAction = "Follow the Journey dependency graph and clear the first blocked item before starting downstream applications.";
    missingInformation = ["Exact delay depends on official portal review and is not specified in the verified corpus."];
  } else {
    const profile = demoProfiles[0];
    const next = profile.recommendations[0];
    citations = [sources.foscos, sources.udyam, sources.pmfme];
    answer = `${profile.ownerName} should start with FoSCoS/FSSAI registration and Udyam. The profile is a cloud kitchen in Lucknow with Aadhaar, PAN and bank details available, while food registration and MSME identity are still missing. These two steps unlock a cleaner packet for PMFME, PMEGP, GST checks and local permissions.`;
    suggestedNextAction = next.applicationSteps;
    missingInformation = ["Exact FSSAI processing time is not specified in the curated verified corpus."];
  }

  return {
    answer,
    citations: citations.map((demoSource) => ({
      title: demoSource.title,
      authority: demoSource.authority.name,
      url: demoSource.officialUrl
    })),
    missingInformation,
    suggestedNextAction
  };
}

export function getDemoExtraction(fileName: string) {
  const normalized = fileName.toLowerCase();
  if (normalized.includes("iec") || normalized.includes("export")) {
    return {
      documentType: "Export document",
      expiry: "Not specified by verified corpus",
      missingPages: [],
      incorrectFields: [],
      mismatches: ["Port mapping must be verified manually if this is an AD Code letter."],
      extractedFields: {
        business: "Rahul Global Traders",
        workflow: "IEC / ICEGATE / export packet"
      },
      suggestedCorrections: ["Confirm IEC, GSTIN, bank branch and port mapping against official DGFT/ICEGATE workflow."]
    };
  }

  return {
    documentType: "Food business document",
    expiry: "Not specified by verified corpus",
    missingPages: [],
    incorrectFields: [],
    mismatches: ["Premises owner consent should be checked before FSSAI/GST reuse."],
    extractedFields: {
      business: "Priya's Millet Kitchen",
      workflow: "FoSCoS / Udyam / PMFME packet"
    },
    suggestedCorrections: ["Confirm premises address and owner consent before submission on official portals."]
  };
}
