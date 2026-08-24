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
