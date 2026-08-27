import { SHORT_LINK_BASE, formatDate } from "../api.js";
import { CopyButton } from "../components.jsx";

/* ---------------- Links table ---------------- */
export function LinksTable({ urls, onAnalytics, onDelete }) {
  return (
    <section className="table-card">
      <div className="table-head-row">
        <h2>Your Links</h2>
        <span className="badge">
          {urls.length} link{urls.length === 1 ? "" : "s"}
        </span>
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
                    <a
                      className="short-link"
                      href={`${SHORT_LINK_BASE}/${url.shortId}`}
                      target="_blank"
                      rel="noopener"
                    >
                      /{url.shortId}
                    </a>
                    <CopyButton text={`${SHORT_LINK_BASE}/${url.shortId}`} small />
                  </div>
                </td>
                <td>
                  <a
                    className="orig-link"
                    href={url.redirectURL}
                    target="_blank"
                    rel="noopener"
                    title={url.redirectURL}
                  >
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
                  <div className="action-cell">
                    <button
                      className="btn-analytics"
                      type="button"
                      onClick={() => onAnalytics(url.shortId)}
                    >
                      Analytics
                    </button>
                    {onDelete && (
                      <button
                        className="btn-delete-row"
                        type="button"
                        title={`Delete /${url.shortId}`}
                        onClick={() => onDelete(url.shortId)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
