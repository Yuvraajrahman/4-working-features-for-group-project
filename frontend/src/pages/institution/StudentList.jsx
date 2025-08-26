// frontend/src/pages/institution/StudentList.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

export default function StudentList() {
  const { idOrName } = useParams();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleRemoveStudent = async (studentId) => {
    if (!confirm("Are you sure you want to remove this student?")) return;
    
    try {
      const res = await fetch(
        `http://localhost:5001/api/institutions/${encodeURIComponent(idOrName)}/remove-student`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentId }),
        }
      );
      
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Status ${res.status}`);
      }
      
      // Remove student from local state
      setStudents(prev => prev.filter(s => s._id !== studentId));
    } catch (err) {
      console.error("Remove student failed:", err);
      setError("Could not remove student.");
    }
  };

  useEffect(() => {
    if (!idOrName) return;
    
    fetch(`http://localhost:5001/api/institutions/${encodeURIComponent(idOrName)}/students`)
      .then(res => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then(json => {
        setStudents(json);
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch students failed:", err);
        setError("Could not load students.");
        setLoading(false);
      });
  }, [idOrName]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1>Students</h1>
        <Link
          to={`/${encodeURIComponent(idOrName)}/add-student`}
          style={{
            padding: "0.6rem 1.2rem",
            borderRadius: "10px",
            fontWeight: 600,
            color: "#fff",
            background: "#10b981",
            textDecoration: "none",
            border: "none",
          }}
        >
          Add Student +
        </Link>
      </div>

      {students.length === 0 ? (
        <p>No students found.</p>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {students.map(student => (
            <div
              key={student._id}
              style={{
                background: "#fff",
                borderRadius: "0.5rem",
                padding: "1rem",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                border: "1px solid #e5e7eb",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ margin: 0, marginBottom: "0.5rem" }}>{student.name}</h3>
                  <p style={{ margin: 0, color: "#666" }}>{student.email}</p>
                </div>
                <button
                  onClick={() => handleRemoveStudent(student._id)}
                  style={{
                    padding: "0.4rem 0.8rem",
                    borderRadius: "6px",
                    fontWeight: 500,
                    color: "#fff",
                    background: "#dc2626",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: "2rem" }}>
        <Link
          to={`/${encodeURIComponent(idOrName)}/dashboard`}
          style={{ color: "#2563eb", textDecoration: "none" }}
        >
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}