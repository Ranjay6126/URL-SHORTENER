/* ---------------- Analytics panel ---------------- */
function AnalyticsPanel({ shortId, onClose }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!shortId) return;
    let alive = true;
    setLoading(true);
    setError(false);
    setData(null);

    fetch("/url/analytics/" + shortId)
      .then((r) => {
        if (!r.ok) throw new Error("failed");
        return r.json();
      })
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
  }, [shortId]);

  if (!shortId) return null;

  const visits = data?.analytics || [];
  const recent = visits.slice(-10).reverse(); // latest first

  return (
    <section className="analytics-panel">
      <div className="analytics-head">
        <h3>
          Analytics — <span id="analyticsShortId">{shortId}</span>
        </h3>
        <button className="btn-close-panel" type="button" onClick={onClose} title="Close">X</button>
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
                    <span className="visit-time">{formatTime(v.timestamp)}</span>
                  </li>
                ))}
              </ul>
              {visits.length > 10 && (
                <div className="loading">
                  Showing last 10 of {visits.length} visits
                </div>
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

/* ---------------- Links table ---------------- */
function LinksTable({ urls, onAnalytics }) {
  return (
    <section className="table-card">
      <div className="table-head-row">
        <h2>Your Links</h2>
        <span className="badge">{urls.length} link{urls.length === 1 ? "" : "s"}</span>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Short Link</th>
              <th>Original URL</th>
              <th>Clicks</th>
              <th>Created</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {urls.map((url, index) => (
              <tr key={url._id || index}>
                <td>{index + 1}</td>
                <td>
                  <div className="short-cell">
                    <a className="short-link" href={"/" + url.shortId} target="_blank" rel="noopener">
                      /{url.shortId}
                    </a>
                    <CopyButton path={"/" + url.shortId} small />
                  </div>
                </td>
                <td>
                  <a className="orig-link" href={url.redirectURL} target="_blank" rel="noopener" title={url.redirectURL}>
                    {url.redirectURL.length > 45
                      ? url.redirectURL.slice(0, 45) + "…"
                      : url.redirectURL}
                  </a>
                </td>
                <td>
                  <span className="click-pill">{url.visitHistory?.length || 0}</span>
                </td>
                <td className="muted">{formatDate(url.createdAt)}</td>
                <td>
                  <button className="btn-analytics" type="button" onClick={() => onAnalytics(url.shortId)}>
                    Analytics
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* ---------------- Empty state ---------------- */
function EmptyState() {
  return (
    <section className="table-card">
      <div className="empty-state">
        <h3>No links yet</h3>
        <p>Shorten your first URL using the box above - it will show up here.</p>
      </div>
    </section>
  );
}

/* ---------------- App ---------------- */
function App() {
  const [analyticsId, setAnalyticsId] = useState(null);
  const urls = DATA.urls || [];

  return (
    <React.Fragment>
      <SuccessBanner shortId={DATA.newId} />
      <StatsGrid urls={urls} />
      {urls.length > 0 ? (
        <LinksTable urls={urls} onAnalytics={setAnalyticsId} />
      ) : (
        <EmptyState />
      )}
      <AnalyticsPanel shortId={analyticsId} onClose={() => setAnalyticsId(null)} />
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

