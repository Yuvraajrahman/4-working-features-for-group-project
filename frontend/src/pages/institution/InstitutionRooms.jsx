// frontend/src/pages/institution/InstitutionRooms.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function InstitutionRooms() {
  const { idOrName }         = useParams();
  const [rooms, setRooms]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg]   = useState("");
  const BAR_COLOR = "hsla(193, 47%, 76%, 1.00)";

  useEffect(() => {
    if (!idOrName) return;

    fetch(
      `http://localhost:5001/api/institutions/${encodeURIComponent(
        idOrName
      )}/rooms`
    )
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((json) => {
        console.log("=== ROOMS DATA ===");
        console.log("Rooms received:", json);
        json.forEach((room, index) => {
          console.log(`Room ${index}:`, {
            id: room._id,
            name: room.room_name,
            idLength: room._id?.length
          });
        });
        setRooms(json);
        setLoading(false);
      })
      .catch(async (err) => {
        // try to pull the real error text
        let msg = err.message;
        if (err.response) {
          msg = await err.response.text();
        }
        console.error("Error loading rooms:", msg);
        setErrMsg(msg);
        setLoading(false);
      });


  }, [idOrName]);

  if (loading) return <p>Loading rooms…</p>;
  if (errMsg)  return <p>{errMsg}</p>;

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Rooms</h1>

      {rooms.length === 0 ? (
        <p>No rooms found.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {rooms.map((room) => {
            const studentCount    = Array.isArray(room.students)
              ? room.students.length
              : 0;
            const instructorCount = Array.isArray(room.instructors)
              ? room.instructors.length
              : 0;

            const formattedTime = room.createdAt
              ? new Date(room.createdAt).toLocaleString()
              : "N/A";

            return (
              <li
                key={room._id}
                style={{
                  display:        "flex",
                  flexDirection:  "column",
                  padding:        "0.75rem 1rem",
                  marginBottom:   "0.75rem",
                  borderRadius:   "0.5rem",
                  background:     BAR_COLOR,
                  color:          "#0b1220",
                }}
              >
                <div
                  style={{
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <strong style={{ fontSize: "1.1rem" }}>
                      {room.room_name}
                    </strong>
                    <div
                      style={{
                        fontSize:  "0.9rem",
                        color:     "#333",
                        marginTop: "0.25rem",
                      }}
                    >
                      {studentCount} student
                      {studentCount !== 1 ? "s" : ""} &bull;{" "}
                      {instructorCount} instructor
                      {instructorCount !== 1 ? "s" : ""}
                    </div>
                  </div>
                  <Link
                    to={`/${encodeURIComponent(idOrName)}/rooms/${room._id}/edit`}
                    style={{
                      fontSize:       "0.9rem",
                      textDecoration: "none",
                      color:          "#fff",
                      fontWeight:     600,
                      padding:        "0.4rem 0.8rem",
                      background:     "#10b981",
                      border:         "1px solid #10b981",
                      borderRadius:   "4px",
                    }}
                  >
                    Edit
                  </Link>
                </div>

                {/* createdTime display */}
                <div
                  style={{
                    fontSize:  "0.8rem",
                    color:     "#555",
                    marginTop: "0.5rem",
                  }}
                >
                  Created: {formattedTime}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}