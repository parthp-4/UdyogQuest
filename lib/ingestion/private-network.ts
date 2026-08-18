/**
 * Literal-hostname and resolved-IP checks used by the controlled fetch layer to reject
 * localhost, loopback, link-local, and private-range targets before (and after DNS
 * resolution of) any registry-allowlisted host.
 */
export function isDisallowedHostLiteral(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  if (lower === "localhost" || lower === "0.0.0.0" || lower === "::1" || lower === "::") return true;
  return isPrivateOrLoopbackIp(lower);
}

export function isPrivateOrLoopbackIp(address: string): boolean {
  const ipv4 = address.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4) {
    const a = Number(ipv4[1]);
    const b = Number(ipv4[2]);
    if (a === 127) return true; // loopback
    if (a === 10) return true; // private
    if (a === 0) return true; // "this network"
    if (a === 169 && b === 254) return true; // link-local
    if (a === 172 && b >= 16 && b <= 31) return true; // private
    if (a === 192 && b === 168) return true; // private
    if (a === 100 && b >= 64 && b <= 127) return true; // carrier-grade NAT
    return false;
  }

  const lower = address.toLowerCase();
  if (lower === "::1") return true; // loopback
  if (lower.startsWith("fe80:")) return true; // link-local
  if (lower.startsWith("fc") || lower.startsWith("fd")) return true; // unique local
  if (lower.startsWith("::ffff:")) return isPrivateOrLoopbackIp(lower.replace("::ffff:", ""));

  return false;
}
