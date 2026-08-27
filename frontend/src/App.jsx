import { useEffect, useState } from "react";
import { Navigate, useNavigate, Routes, Route } from "react-router-dom";
import { api } from "./api.js";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Logs from "./pages/Logs.jsx";
import AnalyticsPage from "./pages/AnalyticsPage.jsx";

export default function App() {
  const [user, setUser] = useState(null); // {_id,name,email,isAdmin}
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // session restore — ask the backend who we are
  const refreshMe = () =>
    api("/api/user/me")
      .then((d) => setUser({ ...d.user, isAdmin: d.isAdmin }))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));

  useEffect(() => {
    refreshMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    try {
      await api("/api/user/logout");
    } catch {
      /* ignore */
    }
    setUser(null);
    navigate("/login");
  };

  if (loading) {
    return <div className="boot-loading">Loading SnapURL...</div>;
  }

  return (
    <Routes>
      {/* default landing: signup when logged out (per project spec) */}
      <Route
        path="/"
        element={
          user ? (
            <Home user={user} onLogout={handleLogout} />
          ) : (
            <Navigate to="/signup" replace />
          )
        }
      />
      <Route
        path="/signup"
        element={user ? <Navigate to="/" replace /> : <Signup onAuth={refreshMe} />}
      />
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <Login onAuth={refreshMe} />}
      />
      <Route
        path="/logs"
        element={
          user && user.isAdmin ? (
            <Logs user={user} onLogout={handleLogout} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      {/* full-page analytics — opens when a user clicks Analytics */}
      <Route
        path="/analytics/:shortId"
        element={
          user ? (
            <AnalyticsPage user={user} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      {/* unknown paths that look like short ids -> send to the backend redirector */}
      <Route path="*" element={<ShortJump />} />
    </Routes>
  );
}

/* visiting /abc123 on the frontend forwards to the API redirect */
function ShortJump() {
  const id = window.location.pathname.replace(/^\//, "").split("/")[0];
  useEffect(() => {
    if (!id || [""].includes(id)) return;
    import("./api.js").then(({ API_BASE }) => {
      if (API_BASE) {
        window.location.href = `${API_BASE}/${id}`;
      }
    });
  }, [id]);
  return <div className="boot-loading">Redirecting...</div>;
}
