// ================================================================
// SnapURL — SERVER LOGS PAGE (React 18)
// Data comes from the EJS shell via <script id="__DATA__">.
// Components: ActionsBar, StatsGrid, LogList, LogsApp
// ================================================================
const { useState } = React;

const DATA = (() => {
  try {
    return JSON.parse(document.getElementById("__DATA__").textContent);
  } catch (e) {
    return { lines: [], total: 0 };
  }
})();

/* ---------------- Actions ---------------- */
function ActionsBar() {
  const clear = () => {
    if (window.confirm("Delete all server logs? This cannot be undone.")) {
      window.location.href = "/logs/clear";
    }
  };

  return (
    <div className="actions">
      <a className="btn btn-ghost" href="/logs">🔄 Refresh</a>
      <a className="btn btn-primary" href="/download" download>📥 Download Logs</a>
      <button className="btn btn-danger" type="button" onClick={clear}>🗑 Clear</button>
    </div>
  );
}

/* ---------------- Stats cards ---------------- */
function StatsGrid({ lines }) {
  const uniqIps = new Set(
    lines
      .map((l) => (l.match(/IP:\s*([^\s|]+)/) || [])[1])
      .filter(Boolean)
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

/* ---------------- Empty state ---------------- */
function EmptyState() {
  return (
    <section className="empty-state">
      <div className="empty-emoji">📭</div>
      <h3>No logs yet</h3>
      <p>Browse the site and requests will start appearing here instantly.</p>
    </section>
  );
}

/* ---------------- App (stats + list) ---------------- */
function Main() {
  const [lines] = useState(DATA.lines || []);

  return (
    <React.Fragment>
      <StatsGrid lines={lines} />
      {lines.length > 0 ? <LogList lines={lines} /> : <EmptyState />}
    </React.Fragment>
  );
}

// actions live inside .head-row, everything else below
ReactDOM.createRoot(document.getElementById("root-actions")).render(<ActionsBar />);
ReactDOM.createRoot(document.getElementById("root")).render(<Main />);
