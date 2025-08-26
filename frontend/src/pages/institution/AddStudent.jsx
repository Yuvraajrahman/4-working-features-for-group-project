// frontend/src/pages/institution/AddStudent.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";

export default function AddStudent() {
  const { idOrName }               = useParams();
  const navigate                   = useNavigate();

  // search + selection state
  const [searchQuery, setSearchQuery]           = useState("");
  const [allStudents, setAllStudents]           = useState([]);
  const [filtered, setFiltered]                 = useState([]);
  const [selectedStudent, setSelectedStudent]   = useState(null);
  const [error, setError]                       = useState("");

  // 1) load all students from your global collection
  useEffect(() => {
    fetch(`http://localhost:5001/api/students`)
      .then(res => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then(json => setAllStudents(json))
      .catch(err => {
        console.error("Fetch all students failed:", err);
        setError("Could not load students.");
      });
  }, []);

  // 2) filter by email as user types
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setFiltered([]);
      return;
    }
    setFiltered(
      allStudents.filter(stu =>
        stu.email.toLowerCase().includes(q)
      )
    );
  }, [searchQuery, allStudents]);

  // 3) submit handler: POST to your institution’s add-student endpoint
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!selectedStudent) {
      setError("Please select a student first.");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5001/api/institutions/${encodeURIComponent(idOrName)}/add-student`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId: selectedStudent._id
          }),
        }
      );
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Status ${res.status}`);
      }

      // on success, go back to the student list
      navigate(`/${encodeURIComponent(idOrName)}/students`);
    } catch (err) {
      console.error("Add student failed:", err);
      setError("Could not add student to institution.");
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Add Student to Institution</h1>

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
              placeholder="Type student’s email…"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedStudent(null);
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
                filtered.map(stu => (
                  <li
                    key={stu._id}
                    onClick={() => {
                      setSelectedStudent(stu);
                      setSearchQuery("");
                    }}
                    style={{
                      padding: "0.5rem",
                      cursor: "pointer",
                      background:
                        selectedStudent?._id === stu._id
                          ? "#def"
                          : "#fff",
                    }}
                  >
                    {stu.email}
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

        {/* Show selected student */}
        {selectedStudent && (
          <div style={{ marginBottom: "1.5rem" }}>
            Selected: <strong>{selectedStudent.name}</strong>{" "}
            (<em>{selectedStudent.email}</em>){" "}
            <button
              type="button"
              onClick={() => setSelectedStudent(null)}
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
            disabled={!selectedStudent}
          >
            Add to Institution
          </button>

          <Link
            to={`/${encodeURIComponent(idOrName)}/students`}
            style={{ alignSelf: "center", color: "#555" }}
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}