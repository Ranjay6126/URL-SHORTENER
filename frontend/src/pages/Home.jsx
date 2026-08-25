import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, SHORT_LINK_BASE, formatDate } from "../api.js";
import {
  Navbar,
  Footer,
  SuccessBanner,
  StatsGrid,
  EmptyState,
} from "../components.jsx";
import { LinksTable } from "./LinksTable.jsx";

/* ---------------- Home page ---------------- */
export default function Home({ user, onLogout }) {
  const navigate = useNavigate();
  const [urls, setUrls] = useState([]);
  const [allUrls, setAllUrls] = useState([]); // admin only: everyone's links
  const [newId, setNewId] = useState(null);
  const [longUrl, setLongUrl] = useState("");
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");

  // ADMIN DASHBOARD — every link created by every user (+ IP address)
  const loadAllUrls = () => {
    if (!user?.isAdmin) return;
    api("/api/url/all")
      .then((d) => setAllUrls(d.urls || []))
      .catch(() => {});
  };

  // load this user's links
  useEffect(() => {
    let alive = true;
    api("/api/url/myurls")
      .then((d) => {
        if (alive) setUrls(d.urls || []);
      })
      .catch((e) => {
        if (alive && e.status === 401) navigate("/signup");
      });
    loadAllUrls();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shorten = async (e) => {
    e.preventDefault();
    if (!longUrl.trim() || creating) return;
    setCreating(true);
    setFormError("");
    try {
      const d = await api("/api/url", {
        method: "POST",
        body: JSON.stringify({ url: longUrl.trim() }),
      });
      setUrls(d.urls || []);
      setNewId(d.id);
      setLongUrl("");
      loadAllUrls(); // keep the admin dashboard fresh
    } catch (err) {
      setFormError(err.message);
    } finally {
      setCreating(false);
    }
  };

  // delete one of this user's own links straight from the table
  const deleteUrl = async (shortId) => {
    if (
      !window.confirm(`Delete /${shortId} permanently? This cannot be undone.`)
    )
      return;
    try {
      await api(`/api/url/${shortId}`, { method: "DELETE" });
      const d = await api("/api/url/myurls");
      setUrls(d.urls || []);
      loadAllUrls();
    } catch (err) {
      setFormError(err.message);
    }
  };

  return (
    <>
      <Navbar user={user} onLogout={onLogout} showLogsLink={user.isAdmin} />
      <main className="container">
        <header className="hero">
          <h1>
            Shorten your <span className="grad">long links</span> ✂️
          </h1>
          <p className="hero-sub">
            Paste any long URL below, get a clean short link — click tracking included.
          </p>

          <form className="shorten-form" onSubmit={shorten} autoComplete="off">
            <input
              type="text"
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
              placeholder="https://example.com/my-really-long-url"
              required
            />
            <button type="submit" disabled={creating}>
              {creating ? "Shortening…" : "Shorten ⚡"}
            </button>
          </form>
          {formError && <div className="alert-error">⚠️ {formError}</div>}
        </header>

        <SuccessBanner shortId={newId} />
        <StatsGrid urls={urls} />

        {/* ---- 👑 ADMIN DASHBOARD: every link made by every user + IP ---- */}
        {user.isAdmin && (
          <section className="table-card admin-card">
            <div className="table-head-row">
              <h2>👑 Admin Dashboard — All Users' Links</h2>
              <div className="head-actions">
                <span className="badge">{allUrls.length} total</span>
                <button
                  className="btn-analytics"
                  type="button"
                  onClick={loadAllUrls}
                >
                  🔄 Refresh
                </button>
              </div>
            </div>

            {allUrls.length > 0 ? (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Created By</th>
                      <th>Short Link</th>
                      <th>Original URL</th>
                      <th>IP Address</th>
                      <th>Clicks</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUrls.map((u, i) => (
                      <tr key={u._id || i}>
                        <td>{i + 1}</td>
                        <td>
                          <div className="creator-cell">
                            <span className="notif-user">
                              {u.creatorName || "Unknown"}
                            </span>
                            <span className="notif-email">
                              {u.creatorEmail || "—"}
                            </span>
                          </div>
                        </td>
                        <td>
                          <a
                            className="short-link"
                            href={`${SHORT_LINK_BASE}/${u.shortId}`}
                            target="_blank"
                            rel="noopener"
                          >
                            /{u.shortId}
                          </a>
                        </td>
                        <td>
                          <a
                            className="orig-link"
                            href={u.redirectURL}
                            target="_blank"
                            rel="noopener"
                            title={u.redirectURL}
                          >
                            {u.redirectURL.length > 40
                              ? u.redirectURL.slice(0, 40) + "…"
                              : u.redirectURL}
                          </a>
                        </td>
                        <td>
                          <span className="ip-pill" title={u.redirectURL}>
                            🌐 {u.creatorIp || "—"}
                          </span>{" "}
                          {u.creatorMac && (
                            <span
                              className="ip-pill mac"
                              title="Creator device id (MAC-style)"
                            >
                              🖥 {u.creatorMac}
                            </span>
                          )}
                        </td>
                        <td>
                          <span className="click-pill">{u.clicks}</span>
                        </td>
                        <td className="muted">{formatDate(u.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="loading">📭 No links created yet by any user.</p>
            )}
          </section>
        )}

        {urls.length > 0 ? (
          <LinksTable
            urls={urls}
            onAnalytics={(shortId) => navigate(`/analytics/${shortId}`)}
            /* only the admin gets a delete button in the Action column */
            onDelete={user?.isAdmin ? deleteUrl : undefined}
          />
        ) : (
          <EmptyState
            title="No links yet"
            text="Shorten your first URL using the box above — it will show up here."
          />
        )}
      </main>
      <Footer />
    </>
  );
}
