import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, SHORT_LINK_BASE, formatDate, formatTime } from "../api.js";
import { CopyButton, EmptyState, Footer, Navbar } from "../components.jsx";

/* ---------------- Full-page analytics (opens when a normal user
   clicks 📊 Analytics in "Your Links") ---------------- */
export default function AnalyticsPage({ user, onLogout }) {
  const { shortId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [showIps, setShowIps] = useState(false); // admin: unique-IP drill-down

  // load analytics for this short link
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");
    setData(null);
    setShowIps(false);

    api(`/api/url/analytics/${shortId}`)
      .then((d) => {
        if (alive) {
          setData(d);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (alive) {
          setError(e.message || "Could not load analytics");
          setLoading(false);
        }
      });

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shortId]);

  // delete this link, then return to the links list
  const handleDelete = async () => {
    if (
      !window.confirm(`Delete /${shortId} permanently? This cannot be undone.`)
    )
      return;
    setDeleting(true);
    setDeleteError("");
    try {
      await api(`/api/url/${shortId}`, { method: "DELETE" });
      navigate("/");
    } catch (e) {
      setDeleteError(e.message);
      setDeleting(false);
    }
  };

  const visits = data?.analytics || [];
  const fullLink = `${SHORT_LINK_BASE}/${shortId}`;

  // ADMIN: aggregate the unique visitor IP addresses of THIS link only.
  // Normal users never reach this — the API doesn't send them IPs at all.
  const ipRows = (() => {
    if (!user?.isAdmin) return [];
    const map = {};
    for (const v of visits) {
      const key = v.ip || "unknown";
      if (!map[key]) {
        map[key] = {
          ip: key,
          mac: v.mac || "",
          count: 0,
          lastSeen: v.timestamp || 0,
        };
      }
      map[key].count += 1;
      if ((v.timestamp || 0) > map[key].lastSeen) {
        map[key].lastSeen = v.timestamp || 0;
      }
    }
    return Object.values(map).sort((a, b) => b.count - a.count);
  })();

  return (
    <>
      <Navbar user={user} onLogout={onLogout} showLogsLink={user?.isAdmin} />
      <main className="container">
        <div className="head-row">
          <h1 className="page-title">📊 Analytics</h1>
          {/* actions row: admins may delete from here — normal users only get back */}
          <div className="actions">
            {user?.isAdmin && (
              <button
                className="btn btn-danger"
                type="button"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting…" : "🗑 Delete"}
              </button>
            )}
            <Link className="btn btn-primary btn-back" to="/">
              ← Back to my links
            </Link>
          </div>
        </div>

        <p className="muted small-note">
          Short link:{" "}
          <a className="short-link" href={fullLink} target="_blank" rel="noopener">
            /{shortId}
          </a>
          <CopyButton text={fullLink} small />
        </p>

        {loading && <div className="loading">⏳ Loading analytics…</div>}

        {!loading && error && (
          <EmptyState emoji="⚠️" title="Could not load analytics" text={error} />
        )}

        {!loading && !error && data && (
          <>
            <section className="stats-grid">
              <div className="stat-card">
                <span className="stat-icon">👆</span>
                <div>
                  <p className="stat-value">{data.totalClicks}</p>
                  <p className="stat-label">Total Clicks</p>
                </div>
              </div>
              <div className="stat-card stat-wide">
                <span className="stat-icon">🔗</span>
                <div>
                  <p className="stat-value orig-link" title={fullLink}>
                    /{shortId}
                  </p>
                  <p className="stat-label">Short Link</p>
                </div>
              </div>

              {/* ADMIN ONLY: clickable unique-IP counter for THIS link */}
              {user?.isAdmin && (
                <div
                  className={`stat-card clickable${showIps ? " open" : ""}`}
                  onClick={() => setShowIps((v) => !v)}
                  title="Click to list the IP addresses that visited this link"
                >
                  <span className="stat-icon">🌐</span>
                  <div>
                    <p className="stat-value">{ipRows.length}</p>
                    <p className="stat-label">Unique IPs</p>
                  </div>
                </div>
              )}
            </section>

            {/* ADMIN ONLY: the actual IPs (and devices) behind this link */}
            {user?.isAdmin && showIps && (
              <section className="table-card uniq-ip-panel">
                <div className="table-head-row">
                  <h2>🌐 IP addresses for /{shortId}</h2>
                  <span className="badge">{ipRows.length} unique</span>
                </div>
                {ipRows.length > 0 ? (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>IP Address</th>
                          <th>Device (MAC)</th>
                          <th>Clicks</th>
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
                            <td className="muted">{formatTime(r.lastSeen)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="loading">📭 No clicks recorded yet.</p>
                )}
              </section>
            )}

            <section className="table-card">
              <div className="table-head-row">
                <h2>Visit History</h2>
                <span className="badge">
                  {visits.length} click{visits.length === 1 ? "" : "s"}
                </span>
              </div>

              {visits.length > 0 ? (
                <ul className="visits-list">
                  {[...visits].reverse().map((v, i) => (
                    <li key={v._id || i}>
                      <span className="visit-idx">#{visits.length - i}</span>
                      <span className="visit-time">
                        🕒 {formatTime(v.timestamp)} ({formatDate(v.timestamp)})
                      </span>
                      {/* visitor IPs are visible to the admin only */}
                      {user?.isAdmin && (
                        <span className="visit-ip" title="Visitor IP address">
                          🌐 {v.ip || "ip not recorded"}
                        </span>
                      )}
                      {user?.isAdmin && v.mac && (
                        <span
                          className="visit-mac"
                          title="Visitor device id (MAC-style)"
                        >
                          🖥 {v.mac}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="loading">🙈 No clicks yet — share your link!</p>
              )}
            </section>
          </>
        )}

        {deleteError && (
          <div className="alert-error">⚠️ {deleteError}</div>
        )}
      </main>
      <Footer />
    </>
  );
}