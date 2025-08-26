import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaPencilAlt } from "react-icons/fa";

export default function InstitutionSettings() {
  const { idOrName } = useParams();
  const navigate = useNavigate();

  const [fields, setFields] = useState({
    phone: "",
    address: "",
    description: "",
  });
  const [edit, setEdit] = useState({});
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const editableFields = ["phone", "address", "description"];

  useEffect(() => {
    if (!idOrName) return;
    fetch(
      `http://localhost:5001/api/institutions/${encodeURIComponent(
        idOrName
      )}/dashboard`
    )
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => {
        setFields({
          phone: data.phone || "",
          address: data.address || "",
          description: data.description || "",
        });
        setLoading(false);
      })
      .catch(() => {
        setErrMsg("Failed to load institution data.");
        setLoading(false);
      });
  }, [idOrName]);

  const handleEdit = (key) => setEdit((e) => ({ ...e, [key]: true }));
  const handleChange = (key, value) =>
    setFields((f) => ({ ...f, [key]: value }));

  const handleSave = () => {
    setErrMsg("");
    setSuccessMsg("");

    const payload = {
      phone: fields.phone,
      address: fields.address,
      description: fields.description,
    };

    fetch(
      `http://localhost:5001/api/institutions/${encodeURIComponent(
        idOrName
      )}/settings`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    )
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());

        // show message, clear edit flags
        setSuccessMsg("Changes saved successfully.");
        setEdit({});

        // redirect after 1.5s
        setTimeout(() => {
          navigate(
            `/${encodeURIComponent(idOrName)}/dashboard`
          );
        }, 1500);
      })
      .catch(() => setErrMsg("Failed to save changes."));
  };

  const handleCancel = () => {
    navigate(`/${encodeURIComponent(idOrName)}/dashboard`);
  };

  if (loading) return <p>Loading...</p>;
  if (errMsg) return <p style={{ color: "red" }}>{errMsg}</p>;

  return (
    <div style={{ padding: "2rem", maxWidth: 600, margin: "auto" }}>
      <h2>Institution Settings</h2>

      {editableFields.map((key) => (
        <div key={key} style={{ marginBottom: "1.2rem" }}>
          <label style={{ fontWeight: 600, display: "block" }}>
            {key.charAt(0).toUpperCase() + key.slice(1)}:
          </label>

          {edit[key] ? (
            key === "description" ? (
              <textarea
                value={fields[key]}
                onChange={(e) => handleChange(key, e.target.value)}
                rows={3}
                style={{ width: "100%" }}
              />
            ) : (
              <input
                type="text"
                value={fields[key]}
                onChange={(e) => handleChange(key, e.target.value)}
                style={{ width: "100%" }}
              />
            )
          ) : (
            <span>
              {fields[key] || <span style={{ color: "#aaa" }}>Not set</span>}
              <button
                onClick={() => handleEdit(key)}
                style={{
                  marginLeft: 12,
                  padding: "4px 8px",
                  border: "1px solid #ccc",
                  borderRadius: 4,
                  background: "transparent",
                  display: "inline-flex",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                <FaPencilAlt style={{ marginRight: 4 }} />
                Edit
              </button>
            </span>
          )}
        </div>
      ))}

      <div style={{ marginTop: 20, display: "flex", gap: "1rem" }}>
        <button
          onClick={handleSave}
          style={{
            padding: "0.6rem 1.5rem",
            borderRadius: 8,
            background: "#2563eb",
            color: "#fff",
            border: "none",
            fontWeight: 600,
          }}
        >
          Save Changes
        </button>

        <button
          onClick={handleCancel}
          style={{
            padding: "0.6rem 1.5rem",
            borderRadius: 8,
            background: "#e5e7eb",
            color: "#111827",
            border: "none",
            fontWeight: 600,
          }}
        >
          Cancel
        </button>
      </div>

      {successMsg && (
        <p style={{ color: "green", marginTop: 12 }}>{successMsg}</p>
      )}
    </div>
  );
}