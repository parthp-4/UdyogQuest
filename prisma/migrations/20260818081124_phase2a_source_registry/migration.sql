-- CreateEnum
CREATE TYPE "SupportedIndustry" AS ENUM ('FOOD', 'EXPORT_IMPORT');

-- CreateEnum
CREATE TYPE "SourceStatus" AS ENUM ('PENDING', 'NEEDS_REVIEW', 'VERIFIED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "SourceRegistryStatus" AS ENUM ('ACTIVE', 'PAUSED');

-- CreateEnum
CREATE TYPE "ParserType" AS ENUM ('HTML', 'PDF');

-- CreateEnum
CREATE TYPE "IngestionTrigger" AS ENUM ('MANUAL', 'CLI', 'CRON');

-- CreateEnum
CREATE TYPE "IngestionRunStatus" AS ENUM ('RUNNING', 'SUCCEEDED', 'FAILED', 'PARTIAL');

-- CreateEnum
CREATE TYPE "IngestionEventStatus" AS ENUM ('DISCOVERED', 'FETCHED', 'PARSED', 'UNCHANGED', 'CHANGED', 'REJECTED', 'FAILED');

-- CreateEnum
CREATE TYPE "SourceKind" AS ENUM ('WEB_PAGE', 'PDF', 'CIRCULAR', 'NOTIFICATION', 'FAQ', 'PORTAL', 'HELPLINE', 'OFFICE');

-- CreateEnum
CREATE TYPE "ProfileStage" AS ENUM ('IDEA', 'PRE_REGISTRATION', 'OPERATING', 'EXPANDING', 'EXPORT_READY');

-- CreateEnum
CREATE TYPE "OwnershipType" AS ENUM ('PROPRIETORSHIP', 'PARTNERSHIP', 'LLP', 'PRIVATE_LIMITED', 'SHG', 'COOPERATIVE', 'TRUST', 'OTHER');

-- CreateEnum
CREATE TYPE "PremisesType" AS ENUM ('RENTED', 'OWNED', 'SHARED', 'HOME_BASED', 'WAREHOUSE', 'FACTORY', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('UPLOADED', 'EXTRACTED', 'VERIFIED', 'NEEDS_REVIEW', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "EligibilityStatus" AS ENUM ('ELIGIBLE', 'POTENTIAL', 'FUTURE_ELIGIBLE', 'NOT_ELIGIBLE', 'UNAVAILABLE');

-- CreateTable
CREATE TABLE "Authority" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ministry" TEXT,
    "jurisdiction" TEXT,
    "websiteUrl" TEXT,
    "helpline" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Authority_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GovernmentSource" (
    "id" TEXT NOT NULL,
    "authorityId" TEXT NOT NULL,
    "sourceRegistryEntryId" TEXT NOT NULL,
    "officialUrl" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "kind" "SourceKind" NOT NULL,
    "status" "SourceStatus" NOT NULL DEFAULT 'PENDING',
    "lastUpdated" TIMESTAMP(3),
    "fetchedAt" TIMESTAMP(3),
    "checksum" TEXT,
    "sourceConfidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "stateApplicability" TEXT,
    "districtApplicability" TEXT,
    "legalReferences" TEXT[],
    "applicationPortal" TEXT,
    "helpline" TEXT,
    "email" TEXT,
    "office" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GovernmentSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SourceRegistryEntry" (
    "id" TEXT NOT NULL,
    "authorityId" TEXT NOT NULL,
    "industry" "SupportedIndustry" NOT NULL,
    "label" TEXT NOT NULL,
    "seedUrl" TEXT NOT NULL,
    "allowedHosts" TEXT[],
    "parserType" "ParserType" NOT NULL,
    "jurisdiction" TEXT,
    "refreshPolicy" TEXT NOT NULL,
    "verificationPolicy" TEXT NOT NULL,
    "status" "SourceRegistryStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastSuccessfulRunAt" TIMESTAMP(3),
    "lastChangedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SourceRegistryEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SourceVersion" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "checksum" TEXT NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL,
    "httpStatus" INTEGER NOT NULL,
    "contentType" TEXT,
    "rawText" TEXT NOT NULL,
    "parsedText" TEXT NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SourceVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationRecord" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "sourceVersionId" TEXT NOT NULL,
    "status" "SourceStatus" NOT NULL,
    "policy" TEXT NOT NULL,
    "notes" TEXT,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificationRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IngestionRun" (
    "id" TEXT NOT NULL,
    "trigger" "IngestionTrigger" NOT NULL,
    "status" "IngestionRunStatus" NOT NULL DEFAULT 'RUNNING',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "sourceCount" INTEGER NOT NULL DEFAULT 0,
    "changedCount" INTEGER NOT NULL DEFAULT 0,
    "unchangedCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "cursor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IngestionRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IngestionRunEvent" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "sourceRegistryEntryId" TEXT NOT NULL,
    "status" "IngestionEventStatus" NOT NULL,
    "httpStatus" INTEGER,
    "checksum" TEXT,
    "sourceVersionId" TEXT,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IngestionRunEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SourceArtifact" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "kind" "SourceKind" NOT NULL,
    "checksum" TEXT,
    "mimeType" TEXT,
    "storedPath" TEXT,
    "extractedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SourceArtifact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeDocument" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "industry" "SupportedIndustry",
    "title" TEXT NOT NULL,
    "applicability" TEXT,
    "eligibility" TEXT,
    "requiredDocuments" TEXT,
    "benefits" TEXT,
    "fees" TEXT,
    "processingTime" TEXT,
    "renewal" TEXT,
    "dependencies" TEXT,
    "faqs" TEXT,
    "validity" TEXT,
    "rawText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeChunk" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tokenCount" INTEGER NOT NULL,
    "embedding" JSONB,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KnowledgeChunk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EligibilityRule" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "industry" "SupportedIndustry" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "ruleJson" JSONB NOT NULL,
    "legalReference" TEXT,
    "notificationUrl" TEXT,
    "validFrom" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "state" TEXT,
    "district" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EligibilityRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "businessName" TEXT NOT NULL,
    "businessCategory" "SupportedIndustry" NOT NULL,
    "businessActivity" TEXT NOT NULL,
    "stage" "ProfileStage" NOT NULL,
    "state" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "pin" TEXT NOT NULL,
    "ownership" "OwnershipType" NOT NULL,
    "turnover" DECIMAL(65,30),
    "investment" DECIMAL(65,30),
    "employees" INTEGER,
    "annualIncome" DECIMAL(65,30),
    "socialCategory" TEXT,
    "gender" TEXT,
    "age" INTEGER,
    "education" TEXT,
    "existingRegistrations" TEXT[],
    "existingLicenses" TEXT[],
    "hasGst" BOOLEAN,
    "hasPan" BOOLEAN,
    "hasAadhaar" BOOLEAN,
    "hasUdyam" BOOLEAN,
    "hasFssai" BOOLEAN,
    "hasIec" BOOLEAN,
    "hasFactoryLicense" BOOLEAN,
    "premises" "PremisesType" NOT NULL,
    "rental" BOOLEAN,
    "owned" BOOLEAN,
    "manufacturing" BOOLEAN,
    "trading" BOOLEAN,
    "foodCategory" TEXT,
    "coldStorage" BOOLEAN,
    "warehouse" BOOLEAN,
    "exportDestination" TEXT,
    "importProducts" TEXT,
    "bankAccount" BOOLEAN,
    "loanStatus" TEXT,
    "creditHistory" TEXT,
    "mobile" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "languages" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserDocument" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "storageUrl" TEXT NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'UPLOADED',
    "documentType" TEXT,
    "expiryDate" TIMESTAMP(3),
    "extractedFields" JSONB NOT NULL DEFAULT '{}',
    "missingFields" TEXT[],
    "mismatchFlags" TEXT[],
    "reuseKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EligibilityResult" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "status" "EligibilityStatus" NOT NULL,
    "reasons" TEXT[],
    "unmetConditions" TEXT[],
    "evaluatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EligibilityResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "status" "EligibilityStatus" NOT NULL,
    "title" TEXT NOT NULL,
    "why" TEXT NOT NULL,
    "expectedBenefit" TEXT,
    "expectedTimeline" TEXT,
    "documentsNeeded" TEXT[],
    "officialPortal" TEXT,
    "applicationSteps" TEXT,
    "helpline" TEXT,
    "relatedSchemes" TEXT[],
    "alternatives" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecommendationCitation" (
    "id" TEXT NOT NULL,
    "recommendationId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "quote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecommendationCitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Authority_name_jurisdiction_key" ON "Authority"("name", "jurisdiction");

-- CreateIndex
CREATE UNIQUE INDEX "GovernmentSource_sourceRegistryEntryId_key" ON "GovernmentSource"("sourceRegistryEntryId");

-- CreateIndex
CREATE INDEX "GovernmentSource_status_sourceConfidence_idx" ON "GovernmentSource"("status", "sourceConfidence");

-- CreateIndex
CREATE INDEX "GovernmentSource_stateApplicability_districtApplicability_idx" ON "GovernmentSource"("stateApplicability", "districtApplicability");

-- CreateIndex
CREATE UNIQUE INDEX "GovernmentSource_officialUrl_key" ON "GovernmentSource"("officialUrl");

-- CreateIndex
CREATE INDEX "SourceRegistryEntry_industry_status_idx" ON "SourceRegistryEntry"("industry", "status");

-- CreateIndex
CREATE UNIQUE INDEX "SourceRegistryEntry_seedUrl_key" ON "SourceRegistryEntry"("seedUrl");

-- CreateIndex
CREATE INDEX "SourceVersion_sourceId_isCurrent_idx" ON "SourceVersion"("sourceId", "isCurrent");

-- CreateIndex
CREATE INDEX "SourceVersion_sourceId_checksum_idx" ON "SourceVersion"("sourceId", "checksum");

-- CreateIndex
CREATE INDEX "VerificationRecord_sourceId_checkedAt_idx" ON "VerificationRecord"("sourceId", "checkedAt");

-- CreateIndex
CREATE INDEX "IngestionRun_status_startedAt_idx" ON "IngestionRun"("status", "startedAt");

-- CreateIndex
CREATE INDEX "IngestionRunEvent_runId_idx" ON "IngestionRunEvent"("runId");

-- CreateIndex
CREATE INDEX "IngestionRunEvent_sourceRegistryEntryId_createdAt_idx" ON "IngestionRunEvent"("sourceRegistryEntryId", "createdAt");

-- CreateIndex
CREATE INDEX "KnowledgeDocument_industry_idx" ON "KnowledgeDocument"("industry");

-- CreateIndex
CREATE INDEX "KnowledgeChunk_sourceId_idx" ON "KnowledgeChunk"("sourceId");

-- CreateIndex
CREATE INDEX "EligibilityRule_industry_state_district_idx" ON "EligibilityRule"("industry", "state", "district");

-- CreateIndex
CREATE INDEX "UserDocument_profileId_reuseKey_idx" ON "UserDocument"("profileId", "reuseKey");

-- CreateIndex
CREATE UNIQUE INDEX "EligibilityResult_profileId_ruleId_key" ON "EligibilityResult"("profileId", "ruleId");

-- AddForeignKey
ALTER TABLE "GovernmentSource" ADD CONSTRAINT "GovernmentSource_authorityId_fkey" FOREIGN KEY ("authorityId") REFERENCES "Authority"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GovernmentSource" ADD CONSTRAINT "GovernmentSource_sourceRegistryEntryId_fkey" FOREIGN KEY ("sourceRegistryEntryId") REFERENCES "SourceRegistryEntry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourceRegistryEntry" ADD CONSTRAINT "SourceRegistryEntry_authorityId_fkey" FOREIGN KEY ("authorityId") REFERENCES "Authority"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourceVersion" ADD CONSTRAINT "SourceVersion_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "GovernmentSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationRecord" ADD CONSTRAINT "VerificationRecord_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "GovernmentSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationRecord" ADD CONSTRAINT "VerificationRecord_sourceVersionId_fkey" FOREIGN KEY ("sourceVersionId") REFERENCES "SourceVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngestionRunEvent" ADD CONSTRAINT "IngestionRunEvent_runId_fkey" FOREIGN KEY ("runId") REFERENCES "IngestionRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngestionRunEvent" ADD CONSTRAINT "IngestionRunEvent_sourceRegistryEntryId_fkey" FOREIGN KEY ("sourceRegistryEntryId") REFERENCES "SourceRegistryEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourceArtifact" ADD CONSTRAINT "SourceArtifact_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "GovernmentSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeDocument" ADD CONSTRAINT "KnowledgeDocument_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "GovernmentSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeChunk" ADD CONSTRAINT "KnowledgeChunk_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "KnowledgeDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EligibilityRule" ADD CONSTRAINT "EligibilityRule_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "GovernmentSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDocument" ADD CONSTRAINT "UserDocument_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "BusinessProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EligibilityResult" ADD CONSTRAINT "EligibilityResult_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "BusinessProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EligibilityResult" ADD CONSTRAINT "EligibilityResult_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "EligibilityRule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "BusinessProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecommendationCitation" ADD CONSTRAINT "RecommendationCitation_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "Recommendation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecommendationCitation" ADD CONSTRAINT "RecommendationCitation_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "GovernmentSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
