// frontend/src/pages/institution/AddRoom.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

export default function AddRoom() {
  const { idOrName }         = useParams();
  const navigate             = useNavigate();

  // form state
  const [roomName, setRoomName]           = useState("");
  const [description, setDescription]     = useState("");
  const [maxCapacity, setMaxCapacity]     = useState(30);
  const [searchQuery, setSearchQuery]     = useState("");
  const [instructors, setInstructors]     = useState([]);
  const [filtered, setFiltered]           = useState([]);
  const [selectedInstructor, setSelectedInstructor] = useState(null);

  // load all instructors for this institution
  useEffect(() => {
    if (!idOrName) return;
    fetch(
      `http://localhost:5001/api/institutions/${encodeURIComponent(
        idOrName
      )}/instructors`
    )
      .then((res) => res.json())
      .then(setInstructors)
      .catch((err) => console.error("Fetch instructors:", err));
  }, [idOrName]);

  // live‐filter instructor list
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return setFiltered([]);
    setFiltered(
      instructors.filter((t) =>
        t.name.toLowerCase().includes(q)
      )
    );
  }, [searchQuery, instructors]);

  // capacity controls
  const decrement = () =>
    setMaxCapacity((n) => Math.max(0, n - 1));
  const increment = () =>
    setMaxCapacity((n) => Math.min(10000, n + 1));

  // submit handler
  const handleCreate = async (e) => {
    e.preventDefault();
    const payload = {
      room_name:   roomName,
      description,
      maxCapacity,
      instructors: selectedInstructor
        ? [selectedInstructor._id]
        : [],
      institution: idOrName,
    };

    try {
      const res = await fetch(
        `http://localhost:5001/api/institutions/${encodeURIComponent(
          idOrName
        )}/rooms`,
        {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(payload),
        }
      );
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to create room");
      }
      // redirect back to your dashboard or rooms list
      navigate(`/${encodeURIComponent(idOrName)}/dashboard`);
    } catch (err) {
      console.error("Error creating room:", err);
      alert("Error: " + err.message);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Add New Room</h1>
      <form onSubmit={handleCreate}>
        {/* Room Name */}
        <div style={{ marginBottom: "1rem" }}>
          <label>
            Room Name<br />
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              required
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </label>
        </div>

        {/* Description */}
        <div style={{ marginBottom: "1rem" }}>
          <label>
            Description<br />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </label>
        </div>

        {/* Maximum Capacity */}
        <div style={{ marginBottom: "1rem" }}>
          <label>
            Maximum Capacity<br />
            <button type="button" onClick={decrement} style={{ marginRight: "0.5rem" }}>
              −
            </button>
            <span>{maxCapacity}</span>
            <button type="button" onClick={increment} style={{ marginLeft: "0.5rem" }}>
              +
            </button>
          </label>
        </div>

        {/* Assign Instructor */}
        <div style={{ marginBottom: "1rem", position: "relative" }}>
          <label>
            Assign Instructor<br />
            <input
              type="text"
              placeholder="Search instructors…"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedInstructor(null);
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
                maxHeight: "150px",
                overflowY: "auto",
                border: "1px solid #ccc",
                background: "#fff",
                zIndex: 10,
              }}
            >
              {filtered.length > 0 ? (
                filtered.map((tutor) => (
                  <li
                    key={tutor._id}
                    onClick={() => {
                      setSelectedInstructor(tutor);
                      setSearchQuery("");
                    }}
                    style={{
                      padding: "0.5rem",
                      cursor: "pointer",
                      background:
                        selectedInstructor?._id === tutor._id
                          ? "#def"
                          : "#fff",
                    }}
                  >
                    {tutor.name}
                  </li>
                ))
              ) : (
                <li style={{ padding: "0.5rem", color: "#888" }}>
                  No instructors found
                </li>
              )}
            </ul>
          )}

          {selectedInstructor && (
            <div style={{ marginTop: "0.5rem" }}>
              Assigned to: <strong>{selectedInstructor.name}</strong>{" "}
              <button type="button" onClick={() => setSelectedInstructor(null)}>
                ×
              </button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            type="submit"
            style={{
              padding: "0.6rem 1.2rem",
              background: "#4f46e5",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Create Room
          </button>
          <Link
            to={`/${encodeURIComponent(idOrName)}/dashboard`}
            style={{ alignSelf: "center", color: "#555" }}
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}