// frontend/src/pages/institution/InstructorList.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router";

export default function InstructorList() {
  const { idOrName } = useParams();
  const [insts, setInsts]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg]   = useState("");

  const handleRemoveInstructor = async (instructorId) => {
    if (!confirm("Are you sure you want to remove this instructor?")) return;
    
    try {
      const res = await fetch(
        `http://localhost:5001/api/institutions/${encodeURIComponent(idOrName)}/remove-instructor`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ instructorId }),
        }
      );
      
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Status ${res.status}`);
      }
      
      setInsts(prev => prev.filter(i => i._id !== instructorId));
    } catch (err) {
      console.error("Remove instructor failed:", err);
      setErrMsg("Could not remove instructor.");
    }
  };

  useEffect(() => {
    fetch(
      `http://localhost:5001/api/institutions/${encodeURIComponent(
        idOrName
      )}/instructors`
    )
      .then((res) => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setInsts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setErrMsg("Failed to load instructors.");
        setLoading(false);
      });
  }, [idOrName]);

  if (loading) return <p>Loading instructors...</p>;
  if (errMsg)  return <p>{errMsg}</p>;

  return (
    <div>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Instructors</h1>

      {insts.length === 0 ? (
        <p>No instructors found.</p>
      ) : (
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
          }}
        >
          {insts.map((i) => (
            <li
              key={i._id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "0.5rem",
                padding: "1rem",
                marginBottom: "1rem",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                backgroundColor: "#ffffff",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h2
                    style={{
                      fontSize: "1.25rem",
                      margin: 0,
                      marginBottom: "0.5rem",
                      color: "#111827",
                    }}
                  >
                    {i.name}
                  </h2>

                  {/* optional details */}
                  {i.email && (
                    <p style={{ margin: "0.25rem 0", fontSize: "0.9rem" }}>
                      <strong>Email:</strong> {i.email}
                    </p>
                  )}
                  {i.phone && (
                    <p style={{ margin: "0.25rem 0", fontSize: "0.9rem" }}>
                      <strong>Phone:</strong> {i.phone}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleRemoveInstructor(i._id)}
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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}