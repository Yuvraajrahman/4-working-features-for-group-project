// frontend/src/pages/institution/AddInstructor.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";

export default function AddInstructor() {
  const { idOrName }             = useParams();
  const navigate                 = useNavigate();

  // search + selection state
  const [searchQuery, setSearchQuery]           = useState("");
  const [allInstructors, setAllInstructors]     = useState([]);
  const [filtered, setFiltered]                 = useState([]);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [error, setError]                       = useState("");

  // 1) load all instructors from your global collection
  useEffect(() => {
    fetch(`http://localhost:5001/api/instructors`)
      .then(res => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then(json => setAllInstructors(json))
      .catch(err => {
        console.error("Fetch all instructors failed:", err);
        setError("Could not load instructors.");
      });
  }, []);

  // 2) filter by email as user types
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return setFiltered([]);
    setFiltered(
      allInstructors.filter(ins =>
        ins.email.toLowerCase().includes(q)
      )
    );
  }, [searchQuery, allInstructors]);

  // 3) submit handler: POST to your institution’s add-instructor endpoint
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!selectedInstructor) {
      setError("Please select an instructor first.");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5001/api/institutions/${encodeURIComponent(idOrName)}/add-instructor`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            instructorId: selectedInstructor._id
          }),
        }
      );
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Status ${res.status}`);
      }

      // on success, go back to the instructor list
      navigate(`/${encodeURIComponent(idOrName)}/instructors`);
    } catch (err) {
      console.error("Add instructor failed:", err);
      setError("Could not add instructor to institution.");
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Add Instructor to Institution</h1>

      {error && (
        <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>
      )}

      <form onSubmit={handleAdd}>
        {/* Search by Email */}
        <div style={{ marginBottom: "1.5rem", position: "relative" }}>
          <label>
            Search by Email<br />
            <input
              type="text"
              placeholder="Type instructor’s email…"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedInstructor(null);
                setError("");
              }}
              style={{ width: "100%", padding: "0.5rem" }}
              autoComplete="off"
            />
          </label>

          {searchQuery && (
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: "4px 0 0",
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                maxHeight: "200px",
                overflowY: "auto",
                border: "1px solid #ccc",
                background: "#fff",
                zIndex: 10,
              }}
            >
              {filtered.length > 0 ? (
                filtered.map(ins => (
                  <li
                    key={ins._id}
                    onClick={() => {
                      setSelectedInstructor(ins);
                      setSearchQuery("");
                    }}
                    style={{
                      padding: "0.5rem",
                      cursor: "pointer",
                      background:
                        selectedInstructor?._id === ins._id
                          ? "#def"
                          : "#fff",
                    }}
                  >
                    {ins.email}
                  </li>
                ))
              ) : (
                <li style={{ padding: "0.5rem", color: "#888" }}>
                  No matches
                </li>
              )}
            </ul>
          )}
        </div>

        {/* Show selected instructor */}
        {selectedInstructor && (
          <div style={{ marginBottom: "1.5rem" }}>
            Selected: <strong>{selectedInstructor.name}</strong>{" "}
            (<em>{selectedInstructor.email}</em>){" "}
            <button
              type="button"
              onClick={() => setSelectedInstructor(null)}
              style={{
                marginLeft: "0.5rem",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: "1.2rem",
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            type="submit"
            style={{
              padding: "0.6rem 1.2rem",
              background: "#10b981",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
            disabled={!selectedInstructor}
          >
            Add to Institution
          </button>

          <Link
            to={`/${encodeURIComponent(idOrName)}/instructors`}
            style={{ alignSelf: "center", color: "#555" }}
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}