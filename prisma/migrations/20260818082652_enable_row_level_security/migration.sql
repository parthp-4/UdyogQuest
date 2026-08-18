-- Supabase auto-exposes every table in the `public` schema through its REST/GraphQL API
-- (PostgREST) via the `anon`/`authenticated` roles. This app only ever connects through
-- Prisma using the privileged `postgres` role (rolbypassrls = true, confirmed against this
-- project), so enabling RLS here has zero effect on the app -- it only closes the
-- accidental-exposure surface for anyone who might obtain this project's anon key.
--
-- No policies are added: RLS enabled with zero policies is default-deny for every role
-- that doesn't bypass RLS. If a future milestone needs the Supabase client/REST API for a
-- specific read path, add a scoped policy then -- don't leave tables open by default,
-- especially BusinessProfile/UserDocument, which are designed to hold real founder PII.

ALTER TABLE "Authority" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "GovernmentSource" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SourceArtifact" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "KnowledgeDocument" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "KnowledgeChunk" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EligibilityRule" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BusinessProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserDocument" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EligibilityResult" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Recommendation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RecommendationCitation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SourceRegistryEntry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SourceVersion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VerificationRecord" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "IngestionRun" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "IngestionRunEvent" ENABLE ROW LEVEL SECURITY;
