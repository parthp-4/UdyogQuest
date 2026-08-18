import dns from "node:dns/promises";
import { isDisallowedHostLiteral, isPrivateOrLoopbackIp } from "@/lib/ingestion/private-network";

export type FetchTarget = {
  url: string;
  allowedHosts: string[];
};

export type FetchOutcome =
  | { ok: true; status: number; contentType: string | null; body: string; fetchedAt: Date; finalUrl: string }
  | { ok: false; reason: string; status?: number };

const FETCH_TIMEOUT_MS = 15_000;
const MAX_CONTENT_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_REDIRECTS = 1;
export const INGESTION_USER_AGENT =
  "UdyogQuestSourceIngestion/0.2 (+https://github.com/parthp-4/UdyogQuest; registered-source-fetch-only)";

const META_REFRESH_PATTERN = /<meta[^>]+http-equiv=["']?refresh["']?[^>]*content=["']?\s*\d+\s*;\s*url=([^"'>]+)["']?/i;

/** Detects an HTML `<meta http-equiv="refresh" content="N;url=...">` redirect stub (a real
 * pattern some official portals use instead of an HTTP 3xx redirect). */
export function extractMetaRefreshTarget(html: string): string | null {
  const match = html.match(META_REFRESH_PATTERN);
  return match ? match[1].trim() : null;
}

/** Scheme + allowlisted-host validation, shared by the pre-fetch check and redirect follow-up. */
export function validateFetchTarget(target: FetchTarget): { ok: true; url: URL } | { ok: false; reason: string } {
  let url: URL;
  try {
    url = new URL(target.url);
  } catch {
    return { ok: false, reason: `"${target.url}" is not a parseable URL.` };
  }

  if (url.protocol !== "https:") {
    return { ok: false, reason: `Only https URLs are allowed, got "${url.protocol}".` };
  }

  if (isDisallowedHostLiteral(url.hostname)) {
    return { ok: false, reason: `Host "${url.hostname}" is a disallowed local/private address literal.` };
  }

  const hostname = url.hostname.toLowerCase();
  const allowed = target.allowedHosts.some((host) => hostname === host.toLowerCase() || hostname.endsWith(`.${host.toLowerCase()}`));
  if (!allowed) {
    return { ok: false, reason: `Host "${hostname}" is not in this source's allowed host list [${target.allowedHosts.join(", ")}].` };
  }

  return { ok: true, url };
}

async function assertResolvesToPublicAddress(hostname: string): Promise<{ ok: true } | { ok: false; reason: string }> {
  try {
    const records = await dns.lookup(hostname, { all: true });
    const privateRecord = records.find((record) => isPrivateOrLoopbackIp(record.address));
    if (privateRecord) {
      return { ok: false, reason: `Host "${hostname}" resolves to private/loopback address ${privateRecord.address}.` };
    }
    return { ok: true };
  } catch (error) {
    return { ok: false, reason: `DNS lookup failed for "${hostname}": ${error instanceof Error ? error.message : "unknown error"}` };
  }
}

/**
 * Fetches a URL that has already been validated against a SourceRegistryEntry's allowed
 * hosts. Rejects non-https schemes, localhost/private-IP literals, and hostnames that
 * resolve to a private address (defense-in-depth against DNS rebinding -- this is a
 * pre-connect check, not a pinned-connection guarantee; see Decisions.md for the
 * documented residual risk). Redirects are followed manually, at most once, and the
 * redirect target is re-validated against the same allowlist before being followed.
 */
export async function fetchRegisteredSource(target: FetchTarget, redirectsRemaining = MAX_REDIRECTS): Promise<FetchOutcome> {
  const validation = validateFetchTarget(target);
  if (!validation.ok) return { ok: false, reason: validation.reason };

  const url = validation.url;
  const dnsCheck = await assertResolvesToPublicAddress(url.hostname);
  if (!dnsCheck.ok) return { ok: false, reason: dnsCheck.reason };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "manual",
      headers: { "User-Agent": INGESTION_USER_AGENT, Accept: "text/html,application/xhtml+xml" },
      signal: controller.signal
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) return { ok: false, reason: `Redirect (HTTP ${response.status}) with no Location header.` };
      if (redirectsRemaining <= 0) return { ok: false, reason: `Redirect limit exceeded following "${url.toString()}" -> "${location}".` };

      const resolvedLocation = new URL(location, url).toString();
      return fetchRegisteredSource({ url: resolvedLocation, allowedHosts: target.allowedHosts }, redirectsRemaining - 1);
    }

    const contentType = response.headers.get("content-type");
    const contentLengthHeader = response.headers.get("content-length");
    if (contentLengthHeader && Number(contentLengthHeader) > MAX_CONTENT_BYTES) {
      return { ok: false, reason: `Content-Length ${contentLengthHeader} exceeds the ${MAX_CONTENT_BYTES}-byte limit.`, status: response.status };
    }

    if (!response.ok) {
      return { ok: false, reason: `Fetch failed with HTTP ${response.status}.`, status: response.status };
    }

    const buffer = await response.arrayBuffer();
    if (buffer.byteLength > MAX_CONTENT_BYTES) {
      return { ok: false, reason: `Response body of ${buffer.byteLength} bytes exceeds the ${MAX_CONTENT_BYTES}-byte limit.`, status: response.status };
    }

    const body = Buffer.from(buffer).toString("utf8");

    if (redirectsRemaining > 0 && contentType?.includes("html")) {
      const metaRefreshTarget = extractMetaRefreshTarget(body);
      if (metaRefreshTarget) {
        const resolvedLocation = new URL(metaRefreshTarget, url).toString();
        return fetchRegisteredSource({ url: resolvedLocation, allowedHosts: target.allowedHosts }, redirectsRemaining - 1);
      }
    }

    return {
      ok: true,
      status: response.status,
      contentType,
      body,
      fetchedAt: new Date(),
      finalUrl: url.toString()
    };
  } catch (error) {
    if (controller.signal.aborted) {
      return { ok: false, reason: `Fetch timed out after ${FETCH_TIMEOUT_MS}ms.` };
    }
    return { ok: false, reason: error instanceof Error ? error.message : "Unknown fetch error." };
  } finally {
    clearTimeout(timeout);
  }
}
