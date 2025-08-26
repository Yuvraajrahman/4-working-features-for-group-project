// frontend/src/pages/institution/EditRoom.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

export default function EditRoom() {
  const { idOrName, roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [instructorEmail, setInstructorEmail] = useState("");
  const [studentResults, setStudentResults] = useState([]);
  const [instructorResults, setInstructorResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedInstructor, setSelectedInstructor] = useState(null);

  useEffect(() => {
    if (!idOrName || !roomId) return;
    
    const url = `http://localhost:5001/api/institutions/${encodeURIComponent(idOrName)}/rooms/${roomId}`;
    console.log("=== FRONTEND ROOM FETCH ===");
    console.log("Fetching URL:", url);
    console.log("idOrName:", idOrName);
    console.log("roomId:", roomId);
    
    fetch(url)
      .then(res => {
        console.log("Response status:", res.status);
        if (!res.ok) {
          return res.text().then(text => {
            console.log("Error response:", text);
            throw new Error(`Status ${res.status}: ${text}`);
          });
        }
        return res.json();
      })
      .then(json => {
        console.log("Room data received:", json);
        setRoom(json);
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch room failed:", err);
        setError("Could not load room details.");
        setLoading(false);
      });
  }, [idOrName, roomId]);

  const handleRemoveStudent = async (studentId) => {
    if (!confirm("Are you sure you want to remove this student from the room?")) return;
    
    try {
      const res = await fetch(
        `http://localhost:5001/api/institutions/${encodeURIComponent(idOrName)}/rooms/${roomId}/remove-student`,
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
      
      setRoom(prev => ({
        ...prev,
        students: prev.students.filter(s => s._id !== studentId)
      }));
    } catch (err) {
      console.error("Remove student failed:", err);
      setError("Could not remove student from room.");
    }
  };

  const handleRemoveInstructor = async (instructorId) => {
    if (!confirm("Are you sure you want to remove this instructor from the room?")) return;
    
    try {
      const res = await fetch(
        `http://localhost:5001/api/institutions/${encodeURIComponent(idOrName)}/rooms/${roomId}/remove-instructor`,
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
      
      setRoom(prev => ({
        ...prev,
        instructors: prev.instructors.filter(i => i._id !== instructorId)
      }));
    } catch (err) {
      console.error("Remove instructor failed:", err);
      setError("Could not remove instructor from room.");
    }
  };

  const searchStudents = async (query) => {
    if (!query.trim()) {
      setStudentResults([]);
      return;
    }
    
    try {
      const res = await fetch(`http://localhost:5001/api/students`);
      const students = await res.json();
      const filtered = students.filter(s => 
        s.email.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);
      setStudentResults(filtered);
    } catch (err) {
      console.error("Search students failed:", err);
    }
  };

  const searchInstructors = async (query) => {
    if (!query.trim()) {
      setInstructorResults([]);
      return;
    }
    
    try {
      const res = await fetch(`http://localhost:5001/api/instructors`);
      const instructors = await res.json();
      const filtered = instructors.filter(i => 
        i.email.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);
      setInstructorResults(filtered);
    } catch (err) {
      console.error("Search instructors failed:", err);
    }
  };

  const handleAddStudent = async () => {
    if (!selectedStudent) return;
    
    try {
      const res = await fetch(
        `http://localhost:5001/api/institutions/${encodeURIComponent(idOrName)}/rooms/${roomId}/add-student`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: selectedStudent.email }),
        }
      );
      
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Status ${res.status}`);
      }
      
      setSelectedStudent(null);
      setStudentEmail("");
      setStudentResults([]);
      window.location.reload();
    } catch (err) {
      console.error("Add student failed:", err);
      setError("Could not add student to room.");
    }
  };

  const handleAddInstructor = async () => {
    if (!selectedInstructor) return;
    
    try {
      const res = await fetch(
        `http://localhost:5001/api/institutions/${encodeURIComponent(idOrName)}/rooms/${roomId}/add-instructor`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: selectedInstructor.email }),
        }
      );
      
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Status ${res.status}`);
      }
      
      setSelectedInstructor(null);
      setInstructorEmail("");
      setInstructorResults([]);
      window.location.reload();
    } catch (err) {
      console.error("Add instructor failed:", err);
      setError("Could not add instructor to room.");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!room) return <p>Room not found</p>;

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "2.5rem", color: "#2563eb", marginBottom: "2rem" }}>Edit Room: {room.room_name}</h1>
      
      <div style={{ display: "flex", gap: "2rem" }}>
        {/* Students Section */}
        <div style={{ flex: 1 }}>
          <h2>Students ({room.students?.length || 0})</h2>
          
          {/* Add Student */}
          <div style={{ marginBottom: "1rem", padding: "1rem", background: "#f8f9fa", borderRadius: "0.5rem", position: "relative" }}>
            <input
              type="email"
              placeholder="Search student by email"
              value={studentEmail}
              onChange={(e) => {
                setStudentEmail(e.target.value);
                searchStudents(e.target.value);
                setSelectedStudent(null);
              }}
              style={{
                width: "70%",
                padding: "0.5rem",
                marginRight: "0.5rem",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
            <button
              onClick={handleAddStudent}
              disabled={!selectedStudent}
              style={{
                padding: "0.5rem 1rem",
                background: selectedStudent ? "#10b981" : "#ccc",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: selectedStudent ? "pointer" : "not-allowed",
              }}
            >
              Add to Room
            </button>
            
            {/* Search Results */}
            {studentResults.length > 0 && (
              <div style={{
                position: "absolute",
                top: "100%",
                left: "1rem",
                right: "1rem",
                background: "white",
                border: "1px solid #ccc",
                borderRadius: "4px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                zIndex: 10,
                maxHeight: "200px",
                overflowY: "auto"
              }}>
                {studentResults.map(student => (
                  <div
                    key={student._id}
                    onClick={() => {
                      setSelectedStudent(student);
                      setStudentEmail(student.email);
                      setStudentResults([]);
                    }}
                    style={{
                      padding: "0.5rem",
                      cursor: "pointer",
                      borderBottom: "1px solid #eee",
                      background: selectedStudent?._id === student._id ? "#e3f2fd" : "white"
                    }}
                  >
                    <div style={{ fontWeight: "bold" }}>{student.name}</div>
                    <div style={{ fontSize: "0.9rem", color: "#666" }}>{student.email}</div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Selected Student */}
            {selectedStudent && (
              <div style={{ marginTop: "0.5rem", padding: "0.5rem", background: "#e3f2fd", borderRadius: "4px" }}>
                Selected: <strong>{selectedStudent.name}</strong> ({selectedStudent.email})
              </div>
            )}
          </div>
          
          {room.students?.length === 0 ? (
            <p>No students assigned to this room.</p>
          ) : (
            <div style={{ display: "grid", gap: "1rem" }}>
              {room.students.map(student => (
                <div
                  key={student._id}
                  style={{
                    background: "#fff",
                    borderRadius: "0.5rem",
                    padding: "1rem",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    border: "1px solid #e5e7eb",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
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
              ))}
            </div>
          )}
        </div>

        {/* Instructors Section */}
        <div style={{ flex: 1 }}>
          <h2>Instructors ({room.instructors?.length || 0})</h2>
          
          {/* Add Instructor */}
          <div style={{ marginBottom: "1rem", padding: "1rem", background: "#f8f9fa", borderRadius: "0.5rem", position: "relative" }}>
            <input
              type="email"
              placeholder="Search instructor by email"
              value={instructorEmail}
              onChange={(e) => {
                setInstructorEmail(e.target.value);
                searchInstructors(e.target.value);
                setSelectedInstructor(null);
              }}
              style={{
                width: "70%",
                padding: "0.5rem",
                marginRight: "0.5rem",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
            <button
              onClick={handleAddInstructor}
              disabled={!selectedInstructor}
              style={{
                padding: "0.5rem 1rem",
                background: selectedInstructor ? "#10b981" : "#ccc",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: selectedInstructor ? "pointer" : "not-allowed",
              }}
            >
              Add to Room
            </button>
            
            {/* Search Results */}
            {instructorResults.length > 0 && (
              <div style={{
                position: "absolute",
                top: "100%",
                left: "1rem",
                right: "1rem",
                background: "white",
                border: "1px solid #ccc",
                borderRadius: "4px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                zIndex: 10,
                maxHeight: "200px",
                overflowY: "auto"
              }}>
                {instructorResults.map(instructor => (
                  <div
                    key={instructor._id}
                    onClick={() => {
                      setSelectedInstructor(instructor);
                      setInstructorEmail(instructor.email);
                      setInstructorResults([]);
                    }}
                    style={{
                      padding: "0.5rem",
                      cursor: "pointer",
                      borderBottom: "1px solid #eee",
                      background: selectedInstructor?._id === instructor._id ? "#e3f2fd" : "white"
                    }}
                  >
                    <div style={{ fontWeight: "bold" }}>{instructor.name}</div>
                    <div style={{ fontSize: "0.9rem", color: "#666" }}>{instructor.email}</div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Selected Instructor */}
            {selectedInstructor && (
              <div style={{ marginTop: "0.5rem", padding: "0.5rem", background: "#e3f2fd", borderRadius: "4px" }}>
                Selected: <strong>{selectedInstructor.name}</strong> ({selectedInstructor.email})
              </div>
            )}
          </div>
          
          {room.instructors?.length === 0 ? (
            <p>No instructors assigned to this room.</p>
          ) : (
            <div style={{ display: "grid", gap: "1rem" }}>
              {room.instructors.map(instructor => (
                <div
                  key={instructor._id}
                  style={{
                    background: "#fff",
                    borderRadius: "0.5rem",
                    padding: "1rem",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    border: "1px solid #e5e7eb",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <h3 style={{ margin: 0, marginBottom: "0.5rem" }}>{instructor.name}</h3>
                    <p style={{ margin: 0, color: "#666" }}>{instructor.email}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveInstructor(instructor._id)}
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
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <Link
          to={`/${encodeURIComponent(idOrName)}/rooms`}
          style={{ color: "#2563eb", textDecoration: "none" }}
        >
          ← Back to Rooms
        </Link>
      </div>
    </div>
  );
}