import { useState } from "react";
import { Link } from "react-router-dom";
import { SHORT_LINK_BASE } from "./api.js";

/* ---------------- Copy button ---------------- */
export function CopyButton({ text, small }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // clipboard API can fail on http — fallback for older browsers
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button className={`copy-btn${small ? " small" : ""}`} type="button" onClick={copy}>
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

/* ---------------- Success banner ---------------- */
export function SuccessBanner({ shortId }) {
  if (!shortId) return null;
  const full = `${SHORT_LINK_BASE}/${shortId}`;
  return (
    <section className="banner-success">
      <span>Short link created:</span>
      <strong>{full}</strong>
      <CopyButton text={full} />
    </section>
  );
}

/* ---------------- Stats grid (home) ---------------- */
export function StatsGrid({ urls }) {
  const totalLinks = urls.length;
  const totalClicks = urls.reduce(
    (sum, u) => sum + (u.visitHistory?.length || 0),
    0
  );
  const avgClicks =
    totalLinks === 0 ? "0.0" : (totalClicks / totalLinks).toFixed(1);

  const cards = [
    ["", totalLinks, "Total Links"],
    ["", totalClicks, "Total Clicks"],
    ["", avgClicks, "Avg Clicks / Link"],
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

/* ---------------- Empty state ---------------- */
export function EmptyState({ title, text }) {
  return (
    <section className="table-card">
      <div className="empty-state">
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
    </section>
  );
}

/* ---------------- Navbar ---------------- */
export function Navbar({ user, onLogout, showLogsLink }) {
  return (
    <nav className="navbar">
      <Link className="brand" to="/">
        URL Shortener
      </Link>

      <div className="nav-right">
        {user && (
          <>
            <div className="user-chip" title={user.email}>
              <div className="avatar">{(user.email || "?")[0].toUpperCase()}</div>
              <span className="user-email">{user.email}</span>
            </div>
            {showLogsLink && (
              <Link to="/logs" className="btn-logout btn-logs">
                Logs
              </Link>
            )}
            <button className="btn-logout" type="button" onClick={onLogout}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

/* ---------------- Page footer ---------------- */
export function Footer({ text = "Crafted with care by Ranjay" }) {
  return <footer className="footer">{text}</footer>;
}
