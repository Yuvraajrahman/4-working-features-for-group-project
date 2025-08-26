// frontend/src/pages/institution/I_Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function I_Dashboard() {
  const { idOrName } = useParams();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg]   = useState("");
  const [currentInstructors, setCurrentInstructors] = useState([]);
  const [currentStudents, setCurrentStudents] = useState([]);

  const loadMembers = () => {
    fetch(`http://localhost:5001/api/institutions/${encodeURIComponent(idOrName)}/instructors`)
      .then(res => res.ok ? res.json() : [])
      .then(setCurrentInstructors)
      .catch(() => setCurrentInstructors([]));
      
    fetch(`http://localhost:5001/api/institutions/${encodeURIComponent(idOrName)}/students`)
      .then(res => res.ok ? res.json() : [])
      .then(setCurrentStudents)
      .catch(() => setCurrentStudents([]));
  };

  useEffect(() => {
    if (!idOrName) return;
    fetch(
      `http://localhost:5001/api/institutions/${encodeURIComponent(
        idOrName
      )}/dashboard`
    )
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Error ${res.status}`);
        }
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setErrMsg("Failed to load dashboard data.");
        setLoading(false);
      });
    
    // Load current members
    loadMembers();
    
    // Refresh members every 10 seconds to catch new signups
    const interval = setInterval(loadMembers, 10000);
    return () => clearInterval(interval);
  }, [idOrName]);

  if (loading) return <p>Loading...</p>;
  if (errMsg) return <p>{errMsg}</p>;
  if (!data)  return <p>No data available</p>;

  const addBtnStyle = {
    textDecoration: "none",
    padding: "0.6rem 1.2rem",
    borderRadius: "10px",
    fontWeight: 600,
    color: "#075985",
    background: "#f0f9ff",
    border: "1px solid #7dd3fc",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  };

  // Pencil SVG icon
  const pencilIcon = (
    <svg
      width="16"
      height="16"
      fill="none"
      viewBox="0 0 20 20"
      style={{ verticalAlign: "middle", marginRight: 6 }}
    >
      <path
        d="M14.85 2.85a2.12 2.12 0 0 1 3 3l-9.5 9.5-4 1 1-4 9.5-9.5Zm2.12-2.12a4.12 4.12 0 0 0-5.83 0l-9.5 9.5A2 2 0 0 0 1 11.34l-1 4A2 2 0 0 0 3.66 19l4-1a2 2 0 0 0 1.41-1.41l9.5-9.5a4.12 4.12 0 0 0 0-5.83Z"
        fill="#0284c7"
      />
    </svg>
  );

  return (
    <div className="bg-gray-50 min-h-screen" style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1 className="text-4xl font-bold text-gray-800 mb-8">
        Dashboard
      </h1>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          gap: "3rem",
          marginTop: "2rem",
        }}
      >
        {/* Left Section */}
        <div
          style={{
            background: "#fff",
            borderRadius: "1rem",
            padding: "2rem 1.5rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            minWidth: 320,
            maxWidth: 420,
            width: "fit-content",
          }}
        >
          {/* Stats */}
          <div
            style={{
              background: "#f0f9ff",
              borderRadius: "0.75rem",
              padding: "1rem",
              marginBottom: "1.5rem",
              width: "100%",
              display: "flex",
              gap: "1rem",
              flexWrap: "nowrap",
              justifyContent: "center",
            }}
          >
            {/* Active Rooms */}
            <Link
              to={`/${encodeURIComponent(idOrName)}/rooms`}
              style={{ flex: 1, textDecoration: "none" }}
            >
              <div
                style={{
                  borderRadius: "0.75rem",
                  padding: "1rem 0.5rem",
                  textAlign: "center",
                  background: "#dbeafe",
                  color: "#1e40af",
                  fontWeight: 600,
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  minWidth: 100,
                }}
              >
                <div style={{ fontSize: "1.2rem" }}>
                  {data.totalRooms ?? 0}
                </div>
                <div style={{ fontSize: "0.9rem" }}>Rooms</div>
              </div>
            </Link>

            {/* Active Students */}
            <Link
              to={`/${encodeURIComponent(idOrName)}/students`}
              style={{ flex: 1, textDecoration: "none" }}
            >
              <div
                style={{
                  borderRadius: "0.75rem",
                  padding: "1rem 0.5rem",
                  textAlign: "center",
                  background: "#dbeafe",
                  color: "#1e40af",
                  fontWeight: 600,
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  minWidth: 100,
                }}
              >
                <div style={{ fontSize: "1.2rem" }}>
                  {data.activeStudents ?? 0}
                </div>
                <div style={{ fontSize: "0.9rem" }}>Students</div>
              </div>
            </Link>

            {/* Total Instructors */}
            <Link
              to={`/${encodeURIComponent(idOrName)}/instructors`}
              style={{ flex: 1, textDecoration: "none" }}
            >
              <div
                style={{
                  borderRadius: "0.75rem",
                  padding: "1rem 0.5rem",
                  textAlign: "center",
                  background: "#dbeafe",
                  color: "#1e40af",
                  fontWeight: 600,
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  minWidth: 100,
                }}
              >
                <div style={{ fontSize: "1.2rem" }}>
                  {data.totalInstructors ?? 0}
                </div>
                <div style={{ fontSize: "0.9rem" }}>Instructors</div>
              </div>
            </Link>
          </div>

          {/* Add Buttons */}
          <div
            style={{
              background: "#f1f5f9",
              borderRadius: "0.75rem",
              padding: "1rem",
              marginBottom: "1.5rem",
              width: "100%",
              display: "flex",
              gap: "0.75rem",
              flexWrap: "nowrap",
              justifyContent: "center",
            }}
          >
            <Link
              to={`/${encodeURIComponent(idOrName)}/add-room`}
              style={addBtnStyle}
            >
              Add Room +
            </Link>
            <Link
              to={`/${encodeURIComponent(idOrName)}/add-student`}
              style={addBtnStyle}
            >
              Add Student +
            </Link>
            <Link
              to={`/${encodeURIComponent(idOrName)}/add-instructor`}
              style={addBtnStyle}
            >
              Add Instructor +
            </Link>
          </div>
        </div>

        {/* Right Section */}
        <div
          style={{
            background: "#f8fafc",
            borderRadius: "1rem",
            padding: "2rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            minWidth: 320,
            maxWidth: 420,
            width: "fit-content",
            margin: "0 auto",
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: "1.2rem", fontSize: "1.5rem" }}>
            {data.name}
          </h2>
          <div style={{ marginBottom: "0.8rem" }}>
            <strong>Description:</strong>
            <div style={{ marginLeft: 8, color: "#444" }}>
              {data.description || (
                <span style={{ color: "#aaa" }}>No description</span>
              )}
            </div>
          </div>
          <div style={{ marginBottom: "0.8rem" }}>
            <strong>EIIN:</strong>
            <span style={{ marginLeft: 8 }}>
              {data.eiin || <span style={{ color: "#aaa" }}>N/A</span>}
            </span>
          </div>
          <div style={{ marginBottom: "0.8rem" }}>
            <strong>Address:</strong>
            <span style={{ marginLeft: 8 }}>
              {data.address || <span style={{ color: "#aaa" }}>N/A</span>}
            </span>
          </div>
          <Link
            to={`/${encodeURIComponent(idOrName)}/settings`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "0.6rem 1.2rem",
              borderRadius: "10px",
              fontWeight: 600,
              color: "#fff",
              background: "#2563eb",
              border: "none",
              textDecoration: "none",
              marginTop: "1.5rem",
              alignSelf: "flex-start",
            }}
          >
            {pencilIcon}
            Edit Institution Details
          </Link>

          
          {/* Current Members Lists */}
          <div style={{ marginTop: "1.5rem", width: "100%" }}>
            <h3 style={{ margin: 0, marginBottom: ".5rem" }}>Current Instructors ({currentInstructors.length})</h3>
            <div style={{ maxHeight: "150px", overflowY: "auto", background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: ".5rem", padding: ".5rem" }}>
              {currentInstructors.length === 0 ? (
                <div style={{ color: "#64748b", fontSize: ".875rem" }}>No instructors</div>
              ) : (
                <div style={{ display: 'grid', gap: '.25rem' }}>
                  {currentInstructors.map((i) => (
                    <div key={i._id} style={{ fontSize: '.875rem', color: '#374151' }}>
                      <span style={{ fontWeight: 500 }}>{i.name}</span>
                      {i.email && <span style={{ color: '#64748b', marginLeft: '.5rem' }}>({i.email})</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div style={{ marginTop: "1rem", width: "100%" }}>
            <h3 style={{ margin: 0, marginBottom: ".5rem" }}>Current Students ({currentStudents.length})</h3>
            <div style={{ maxHeight: "150px", overflowY: "auto", background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: ".5rem", padding: ".5rem" }}>
              {currentStudents.length === 0 ? (
                <div style={{ color: "#64748b", fontSize: ".875rem" }}>No students</div>
              ) : (
                <div style={{ display: 'grid', gap: '.25rem' }}>
                  {currentStudents.map((s) => (
                    <div key={s._id} style={{ fontSize: '.875rem', color: '#374151' }}>
                      <span style={{ fontWeight: 500 }}>{s.name}</span>
                      {s.email && <span style={{ color: '#64748b', marginLeft: '.5rem' }}>({s.email})</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}