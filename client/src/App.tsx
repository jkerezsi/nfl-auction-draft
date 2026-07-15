import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import {
  useEffect,
  useState
} from "react";

import PlayerPage from "./pages/PlayerPage";
import AdminPage from "./pages/AdminPage";

import AdminLogin from "./components/admin/AdminLogin";

import {
  isLoggedIn,
  validateSession
} from "./services/adminAuthService";


function AdminRoute() {
  const [
    authenticated,
    setAuthenticated
  ] = useState(false);

  const [
    checkingSession,
    setCheckingSession
  ] = useState(true);


  useEffect(() => {
    async function checkSession() {
      if (!isLoggedIn()) {
        setCheckingSession(false);

        return;
      }

      const valid =
        await validateSession();

      setAuthenticated(
        valid
      );

      setCheckingSession(
        false
      );
    }

    void checkSession();
  }, []);


  if (checkingSession) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#111827",
          color: "white",
          fontSize: "24px"
        }}
      >
        Loading...
      </div>
    );
  }


  if (!authenticated) {
    return (
      <AdminLogin
        onLogin={() =>
          setAuthenticated(
            true
          )
        }
      />
    );
  }


  return (
    <AdminPage />
  );
}


export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={
            <PlayerPage />
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}