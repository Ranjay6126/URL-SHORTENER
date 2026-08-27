import { useEffect, useState } from "react";
import { api, formatDate } from "../api.js";

/* ---------------- Analytics panel ---------------- */
export function AnalyticsPanel({ shortId, onClose }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!shortId) return;
    let alive = true;
    setLoading(true);
    setError(false);
    setData(null);

    api(`/api/url/analytics/${shortId}`)
      .then((d) => {
        if (alive) {
          setData(d);
          setLoading(false);
        }
      })
      .catch(() => {
        if (alive) {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shortId]);

  if (!shortId) return null;

  const visits = data?.analytics || [];
  const recent = visits.slice(-10).reverse(); // latest first

  return (
    <section className="analytics-panel">
      <div className="analytics-head">
        <h3>
          Analytics — <span>{shortId}</span>
        </h3>
        <button className="btn-close-panel" type="button" onClick={onClose} title="Close">
          X
        </button>
      </div>

      {loading && <div className="loading">Loading analytics...</div>}

      {error && (
        <div className="load-error">Could not load analytics. Please try again.</div>
      )}

      {!loading && !error && data && (
        <div>
          <div className="analytics-summary">
            <span className="analytics-total">{data.totalClicks}</span>
            <span className="analytics-total-label">
              total click{data.totalClicks === 1 ? "" : "s"} on this link
            </span>
          </div>

          {recent.length > 0 ? (
            <>
              <ul className="visits-list">
                {recent.map((v, i) => (
                  <li key={v._id || i}>
                    <span className="visit-idx">#{visits.length - i}</span>
                    <span className="visit-time">{formatDate(v.timestamp)}</span>
                  </li>
                ))}
              </ul>
              {visits.length > 10 && (
                <div className="loading">Showing last 10 of {visits.length} visits</div>
              )}
            </>
          ) : (
            <div className="loading">No clicks yet - share your link!</div>
          )}
        </div>
      )}
    </section>
  );
}
