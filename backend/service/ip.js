// ================= PUBLIC IP HELPER =================
// When the app runs on localhost / LAN, req.socket.remoteAddress is just
// 127.0.0.1 or a private address — useless for the admin dashboard.
// This helper resolves THIS MACHINE'S public IPv4 (while developing, the
// browser and the server share the same public IP behind the home router)
// and caches it, so the admin sees a meaningful "proper" IP address.
//
// Behind a real proxy / cloud host, x-forwarded-for already carries the
// TRUE visitor IP — that is always preferred and returned untouched.

let cachedPublicIp = null;
let cachedAt = 0;
let inFlight = null;
const CACHE_TTL = 10 * 60 * 1000; // re-resolve every 10 minutes

const IPV4_RE = /^(\d{1,3}\.){3}\d{1,3}$/;

function normalizeIp(ip) {
  let out = String(ip || "").trim();
  if (out === "::1") out = "127.0.0.1";
  if (out.startsWith("::ffff:")) out = out.slice(7);
  return out;
}

function isPrivateOrLocal(ip) {
  const v = normalizeIp(ip);
  if (!v || v === "unknown" || v === "127.0.0.1") return true;
  // non-IPv4 (IPv6): treat link-local / ULA as private
  if (!IPV4_RE.test(v)) return /^(f|fe80)/.test(v);
  return (
    v.startsWith("10.") ||
    v.startsWith("192.168.") ||
    v.startsWith("169.254.") ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(v)
  );
}

async function fetchPublicIp() {
  const sources = [
    { url: "https://api.ipify.org?format=json", json: true },
    { url: "https://ifconfig.me/ip", json: false },
    { url: "https://icanhazip.com", json: false },
  ];
  for (const src of sources) {
    try {
      const res = await fetch(src.url, {
        headers: { "User-Agent": "SnapURL/1.0" },
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) continue;
      let ip = src.json ? (await res.json()).ip : (await res.text()).trim();
      ip = normalizeIp(ip);
      if (IPV4_RE.test(ip)) {
        cachedPublicIp = ip;
        cachedAt = Date.now();
        console.log(`[ip] public IP resolved: ${ip}`);
        return ip;
      }
    } catch {
      /* try the next source */
    }
  }
  console.log("[ip] could not resolve public IP (offline?)");
  return null;
}

// kick off a fetch if the cache is stale (fire-and-forget)
function ensurePublicIpCached(force = false) {
  const fresh = cachedPublicIp && Date.now() - cachedAt < CACHE_TTL;
  if ((fresh && !force) || inFlight) return;
  inFlight = fetchPublicIp().finally(() => {
    inFlight = null;
  });
}

// Best IP to display for a request:
// - the genuine public client IP (proxy headers / public socket address),
// - otherwise this machine's public IP (localhost / LAN dev mode).
async function resolveDisplayIp(directIp) {
  const direct = normalizeIp(directIp);
  if (!isPrivateOrLocal(direct)) return direct;

  const fresh = cachedPublicIp && Date.now() - cachedAt < CACHE_TTL;
  if (fresh) return cachedPublicIp;

  ensurePublicIpCached();
  if (inFlight) {
    // wait briefly for the first resolution instead of saving 127.0.0.1
    await Promise.race([
      inFlight.catch(() => {}),
      new Promise((r) => setTimeout(r, 6000)),
    ]);
  }
  return cachedPublicIp || direct || "unknown";
}

// Synchronous variant for the hot logging path — cache when warm,
// otherwise the direct IP plus a background refresh.
function quickDisplayIp(directIp) {
  const direct = normalizeIp(directIp);
  if (!isPrivateOrLocal(direct)) return direct;
  if (cachedPublicIp) return cachedPublicIp;
  ensurePublicIpCached();
  return direct || "unknown";
}

module.exports = {
  normalizeIp,
  isPrivateOrLocal,
  resolveDisplayIp,
  quickDisplayIp,
  ensurePublicIpCached,
};