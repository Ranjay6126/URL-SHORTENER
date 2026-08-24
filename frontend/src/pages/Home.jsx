import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";
import {
  Navbar,
  Footer,
  SuccessBanner,
  StatsGrid,
  EmptyState,
} from "../components.jsx";
import { AnalyticsPanel } from "./AnalyticsPanel.jsx";
import { LinksTable } from "./LinksTable.jsx";

/* ---------------- Home page ---------------- */
export default function Home({ user, onLogout }) {
  const navigate = useNavigate();
  const [urls, setUrls] = useState([]);
  const [newId, setNewId] = useState(null);
  const [longUrl, setLongUrl] = useState("");
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");
  const [analyticsId, setAnalyticsId] = useState(null);

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
    } catch (err) {
      setFormError(err.message);
    } finally {
      setCreating(false);
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
        {urls.length > 0 ? (
          <LinksTable urls={urls} onAnalytics={setAnalyticsId} />
        ) : (
          <EmptyState
            title="No links yet"
            text="Shorten your first URL using the box above — it will show up here."
          />
        )}
        <AnalyticsPanel shortId={analyticsId} onClose={() => setAnalyticsId(null)} />
      </main>
      <Footer />
    </>
  );
}
