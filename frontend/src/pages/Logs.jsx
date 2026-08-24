import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, API_BASE, formatTime } from "../api.js";
import { EmptyState, Footer, Navbar } from "../components.jsx";

/* ---------------- Stats cards ---------------- */
function LogsStats({ lines }) {
  const uniqIps = new Set(
    lines.map((l) => (l.match(/IP:\s*([^\s|]+)/) || [])[1]).filter(Boolean)
  ).size;

  const today = new Date().toISOString().slice(0, 10);
  const todays = lines.filter((l) => l.includes(today)).length;

  const cards = [
    ["📋", lines.length, "Logged Requests"],
    ["🌐", uniqIps, "Unique IPs"],
    ["📅", todays, "Requests Today"],
  ];

  return (
    <section className="stats-grid">
      {cards.map(([icon, value, label]) => (
        <div className="stat-card" key={label}>
          <span className="stat-icon">{icon}</span>
          <div>
            <p className="stat-value">{value}</p>
            <p className="stat-label">{label}</p>
          </div>
        </div>
      ))}
    </section>
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

/* ---------------- Logs page ---------------- */
export default function Logs({ user, onLogout }) {
  const [lines, setLines] = useState([]);
  const [adminEmail, setAdminEmail] = useState(user?.email || "");
  const [loading, setLoading] = useState(true);

  const loadLogs = useCallback(() => {
    setLoading(true);
    api("/api/logs")
      .then((d) => {
        setLines(d.lines || []);
        setAdminEmail(d.adminEmail || adminEmail);
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
