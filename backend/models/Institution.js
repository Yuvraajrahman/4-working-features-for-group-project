import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router";  

export default function I_Dashboard() {
  const { idOrName } = useParams();
  const [data, setData]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg]   = useState("");

  useEffect(() => {
    if (!idOrName) return;
    fetch(
      `http://localhost:5001/api/institutions/${encodeURIComponent(
        idOrName
      )}/dashboard`
    )
      .then(async res => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Error ${res.status}`);
        }
        return res.json();
      })
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setErrMsg("Failed to load dashboard data.");
        setLoading(false);
      });
  }, [idOrName]);

  if (loading) return <p>Loading...</p>;
  if (errMsg)   return <p>{errMsg}</p>;
  if (!data)    return <p>No data available</p>;

  const bubbleBase = {
    borderRadius: "1rem",
    padding: "1rem 2rem",
    minWidth: "160px",
    textAlign: "center",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  };

  const addBtnStyle = {
    textDecoration: "none",
    padding: "0.6rem 1.2rem",
    borderRadius: "10px",
    fontWeight: 600,
    color: "#0b1220",
    background: "#e6f7ff",
    border: "1px solid #b3e1ff",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "2.5rem", margin: 0 }}>Dashboard</h1>

      {/* Stats */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap",
          margin: "1.5rem 0",
        }}
      >
        <Link
          to={`/${encodeURIComponent(idOrName)}/rooms`}
          style={{ textDecoration: "none" }}
        >
          <div style={{ ...bubbleBase, background: "#e0f2fe" }}>
            <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
              {data.totalRooms ?? 0}
            </div>
            <div style={{ fontSize: "0.9rem", color: "#333" }}>
              Active Rooms
            </div>
          </div>
        </Link>

        <div style={{ ...bubbleBase, background: "#dcfce7" }}>
          <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
            {data.activeStudents ?? 0}
          </div>
          <div style={{ fontSize: "0.9rem", color: "#333" }}>
            Active Students
          </div>
        </div>

        <div style={{ ...bubbleBase, background: "#fde68a" }}>
          <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
            {data.activeInstructors ?? 0}
          </div>
          <div style={{ fontSize: "0.9rem", color: "#333" }}>
            Active Instructors
          </div>
        </div>
      </div>

      {/* Add Buttons (absolute paths) */}
      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          flexWrap: "wrap",
          marginBottom: "1.5rem",
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
  );
}