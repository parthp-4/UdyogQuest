/**
 * Normalises a URL for deduplication: strips the fragment, lower-cases the host, drops
 * default ports, sorts query parameters, and removes a trailing slash from non-root paths.
 * Two URLs that canonicalise to the same string are treated as the same source.
 */
export function canonicalizeUrl(rawUrl: string): string {
  const url = new URL(rawUrl);
  url.hash = "";
  url.hostname = url.hostname.toLowerCase();

  if ((url.protocol === "https:" && url.port === "443") || (url.protocol === "http:" && url.port === "80")) {
    url.port = "";
  }

  url.searchParams.sort();

  if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
    url.pathname = url.pathname.slice(0, -1);
  }

  return url.toString();
}
