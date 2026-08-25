import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, API_BASE, formatTime } from "../api.js";
import { EmptyState, Footer, Navbar } from "../components.jsx";

/* ---------------- Stats cards ---------------- */
function LogsStats({ lines }) {
  const [showIps, setShowIps] = useState(false);

  const uniqIps = new Set(
    lines.map((l) => (l.match(/IP:\s*([^\s|]+)/) || [])[1]).filter(Boolean)
  ).size;

  const today = new Date().toISOString().slice(0, 10);
  const todays = lines.filter((l) => l.includes(today)).length;

  // lines are newest-first, so the FIRST hit per IP is its most recent sighting;
  // each log line looks like: IP: x | MAC: yy | Time: iso | METHOD | URL: ...
  const ipRows = (() => {
    const map = {};
    for (const l of lines) {
      const ip = (l.match(/IP:\s*([^\s|]+)/) || [])[1];
      if (!ip) continue;
      if (!map[ip]) {
        const t = (l.match(/Time:\s*([^\s|]+)/) || [])[1];
        const d = t ? new Date(t) : null;
        map[ip] = {
          ip,
          mac: (l.match(/MAC:\s*([^\s|]+)/) || [])[1] || "",
          count: 0,
          lastSeen: d && !isNaN(d.getTime()) ? d.toLocaleString() : "—",
        };
      }
      map[ip].count += 1;
    }
    return Object.values(map).sort((a, b) => b.count - a.count);
  })();

  const cards = [
    ["📋", lines.length, "Logged Requests", null],
    ["🌐", uniqIps, "Unique IPs", () => setShowIps((v) => !v)],
    ["📅", todays, "Requests Today", null],
  ];

  return (
    <>
      <section className="stats-grid">
        {cards.map(([icon, value, label, onClick]) => (
          <div
            className={`stat-card${onClick ? " clickable" : ""}${
              onClick && showIps ? " open" : ""
            }`}
            key={label}
            onClick={onClick}
            title={onClick ? "Click to show these IP addresses" : undefined}
          >
            <span className="stat-icon">{icon}</span>
            <div>
              <p className="stat-value">{value}</p>
              <p className="stat-label">{label}</p>
            </div>
          </div>
        ))}
      </section>

      {/* click the 🌐 Unique IPs card -> drill into the actual addresses */}
      {showIps &&
        (ipRows.length > 0 ? (
          <section className="table-card uniq-ip-panel">
            <div className="table-head-row">
              <h2>🌐 Unique IP Addresses</h2>
              <span className="badge">{ipRows.length} unique</span>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>IP Address</th>
                    <th>Device (MAC)</th>
                    <th>Hits</th>
                    <th>Last Seen</th>
                  </tr>
                </thead>
                <tbody>
                  {ipRows.map((r, i) => (
                    <tr key={r.ip}>
                      <td>{i + 1}</td>
                      <td>
                        <span className="ip-pill">🌐 {r.ip}</span>
                      </td>
                      <td className="muted">{r.mac || "—"}</td>
                      <td>
                        <span className="click-pill">{r.count}</span>
                      </td>
                      <td className="muted">{r.lastSeen}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          <p className="loading">📭 No IP addresses recorded yet.</p>
        ))}
    </>
  );
}

/* ---------------- Log list ---------------- */
function LogList({ lines }) {
  const MAX = 300;
  const shown = lines.slice(0, MAX);

  return (
    <section className="log-card">
      <div className="log-head">
        <span>server_logs.txt</span>
        <span className="hint">
          newest first · showing {shown.length} of {lines.length}
        </span>
      </div>
      <ul className="log-list">
        {shown.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ul>
    </section>
  );
}

/* ---------------- Admin notifications ---------------- */
function NotifList({ notifs }) {
  const MAX = 100;
  const shown = notifs.slice(0, MAX);

  return (
    <section className="log-card notif-card">
      <div className="log-head">
        <span>🔔 Link Creation Alerts</span>
        <span className="hint">
          normal users · newest first · showing {shown.length} of {notifs.length}
        </span>
      </div>
      <ul className="notif-list">
        {shown.map((n) => (
          <li key={n._id} className={`notif-item${n.read ? "" : " unread"}`}>
            <div className="notif-main">
              <span className="notif-user">
                👤 {n.userName || "Unknown"}{" "}
                <span className="notif-email">({n.userEmail})</span>
              </span>{" "}
              created short link{" "}
              <strong className="notif-short">/{n.shortId}</strong> →{" "}
              <a
                className="orig-link"
                href={n.redirectURL}
                target="_blank"
                rel="noopener"
                title={n.redirectURL}
              >
                {n.redirectURL.length > 50
                  ? n.redirectURL.slice(0, 50) + "…"
                  : n.redirectURL}
              </a>
            </div>
            <div className="notif-meta">
              <span title={n.userAgent}>🌐 IP: {n.ip || "unknown"}</span>
              <span>🖥 MAC: {n.mac || "unknown"}</span>
              <span>🕒 {new Date(n.createdAt).toLocaleString()}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------------- Logs page ---------------- */
export default function Logs({ user, onLogout }) {
  const [lines, setLines] = useState([]);
  const [notifs, setNotifs] = useState([]);
  const [adminEmail, setAdminEmail] = useState(user?.email || "");
  const [loading, setLoading] = useState(true);

  const loadLogs = useCallback(() => {
    setLoading(true);
    // server logs + admin notifications in parallel
    Promise.all([api("/api/logs"), api("/api/logs/notifications")])
      .then(([logsData, notifData]) => {
        setLines(logsData.lines || []);
        setAdminEmail(logsData.adminEmail || adminEmail);
        setNotifs(notifData.notifications || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const clearLogs = async () => {
    if (!window.confirm("Delete all server logs? This cannot be undone.")) return;
    try {
      await api("/api/logs/clear");
      loadLogs();
    } catch {
      /* ignore */
    }
  };

  const markNotifsRead = async () => {
    try {
      await api("/api/logs/notifications/read");
      loadLogs();
    } catch {
      /* ignore */
    }
  };

  const clearNotifs = async () => {
    if (!window.confirm("Delete all link creation alerts? This cannot be undone."))
      return;
    try {
      await api("/api/logs/notifications/clear");
      loadLogs();
    } catch {
      /* ignore */
    }
  };

  return (
    <>
      <Navbar user={user} onLogout={onLogout} showLogsLink={false} />
      <main className="container">
        <div className="head-row">
          <h1 className="page-title">📜 Server Logs</h1>
          <div className="actions">
            <button className="btn btn-ghost" type="button" onClick={loadLogs}>
              🔄 Refresh
            </button>
            <a className="btn btn-primary" href={`${API_BASE}/api/logs/download`} download>
              📥 Download Logs
            </a>
            <button className="btn btn-danger" type="button" onClick={clearLogs}>
              🗑 Clear
            </button>
          </div>
        </div>

        {adminEmail && <p className="muted small-note">Signed in as admin: {adminEmail}</p>}

        {/* ---- alerts raised whenever a NORMAL user creates a short link ---- */}
        <div className="head-row notif-head-row">
          <h2 className="section-title">🔔 Link Creation Alerts</h2>
          <div className="actions">
            <button className="btn btn-ghost" type="button" onClick={markNotifsRead}>
              ✅ Mark all read
            </button>
            <button className="btn btn-danger" type="button" onClick={clearNotifs}>
              🗑 Clear Alerts
            </button>
          </div>
        </div>

        {!loading &&
          (notifs.length > 0 ? (
            <NotifList notifs={notifs} />
          ) : (
            <EmptyState
              emoji="🔔"
              title="No alerts yet"
              text="When a normal user creates a short link, their name, email and IP address will appear here."
            />
          ))}

        <LogsStats lines={lines} />

        {loading && <div className="loading">⏳ Loading logs…</div>}

        {!loading &&
          (lines.length > 0 ? (
            <LogList lines={lines} />
          ) : (
            <EmptyState
              emoji="📭"
              title="No logs yet"
              text="Browse the site and requests will start appearing here instantly."
            />
          ))}

        <p className="back-home">
          <Link to="/">← Back to my links</Link>
        </p>
      </main>
      <Footer />
    </>
  );
}

/* keep formatTime referenced for future use of raw timestamps */
void formatTime;
