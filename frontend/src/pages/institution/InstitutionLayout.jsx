// frontend/src/pages/institution/InstitutionLayout.jsx
import React, { useEffect, useState } from "react";
import { useParams, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import Navbar from "../../components/Navbar.jsx";

export default function InstitutionLayout() {
  const { idOrName } = useParams();
  const { user } = useAuth();
  const [instName, setInstName] = useState("");

  useEffect(() => {
    if (!idOrName) return;
    fetch(
      `http://localhost:5001/api/institutions/${encodeURIComponent(
        idOrName
      )}/dashboard`
    )
      .then((res) => res.json())
      .then((json) => setInstName(json.name))
      .catch((err) => console.error("Failed to load institution name:", err));
  }, [idOrName]);

  return (
    <div style={{ fontFamily: "sans-serif" }}>
      {/* Use unified navbar */}
      <Navbar />

      {/* Main content */}
      <main style={{ padding: "2rem" }}>
        <Outlet />
      </main>
    </div>
  );
}