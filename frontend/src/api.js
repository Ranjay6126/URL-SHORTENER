// ================================================================
// Tiny fetch wrapper for the SnapURL JSON API.
// - VITE_API_URL comes from frontend/.env ("http://localhost:8000")
// - If it's empty, relative /api paths hit the Vite dev proxy.
// - credentials:"include" sends/receives the JWT `uid` cookie.
// ================================================================

export const API_BASE = (
  import.meta.env.VITE_API_URL || ""
).replace(/\/$/, "");

// base used when sharing short links — they redirect on the backend
export const SHORT_LINK_BASE =
  API_BASE || `${window.location.protocol}//${window.location.host}`;

/* ---------------- device id (MAC-style) ----------------
   Browsers never expose the visitor's physical network-card MAC address,
   so we generate a persistent, MAC-formatted device id instead and keep it
   in localStorage + a cookie. The cookie (cookies ignore ports) travels to
   the API origin even when someone opens a bare short link, so every click
   can be tied to one "device" and stored next to the IP address. */
export function ensureDeviceId() {
  try {
    let id = window.localStorage.getItem("snapurl_device_id");
    if (!id || !/^([0-9A-F]{2}:){5}[0-9A-F]{2}$/.test(id)) {
      const hex = () =>
        Math.floor(Math.random() * 256)
          .toString(16)
          .padStart(2, "0")
          .toUpperCase();
      // starts with 02 -> "locally administered" MAC, e.g. 02:4F:1A:9C:33:B7
      id = ["02", ...Array.from({ length: 5 }, hex)].join(":");
      window.localStorage.setItem("snapurl_device_id", id);
    }
    document.cookie = `deviceId=${encodeURIComponent(
      id
    )}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    return id;
  } catch {
    return "";
  }
}
ensureDeviceId();

export async function api(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  let data = {};
  try {
    data = await res.json();
  } catch {
    /* no body */
  }

  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }

  return data;
}

/* ---------------- formatting helpers ---------------- */

export function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
