// CustomerMeasurements.jsx
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Modal, Button } from "react-bootstrap";
import { AuthContext } from "../context/AuthContext";
import { useParams } from "react-router-dom";

// Define measurement types, API endpoints, and fields
const TYPES = {
    "shalwar-qameez": {
        label: "Shalwar Qameez",
        endpoint: "shalwar-qameez",
        fields: [
            "front_pocket_right",
            "front_pocket_left",
            "side_pocket_right",
            "side_pocket_left",
            "coller",
            "sholder_width",
            "sleve_length",
            "sleve_hole",
            "cuff_hole",
            "cuff_width",
            "chest",
            "belly",
            "shirt_kera_round",
            "shirt_kera",
            "shirt_length",
            "shalwar_length",
            "shalwar_hole",
            "shalwar_pocket",
        ],
    },
    shirt: {
        label: "Shirt",
        endpoint: "shirt",
        fields: [
            "front_pocket_right",
            "front_pocket_left",
            "coller",
            "tera",
            "sleve_length",
            "sleve_hole",
            "cuff_hole",
            "cuff_width",
            "chest",
            "belly",
            "shirt_length",
        ],
    },
    trouser: {
        label: "Trouser",
        endpoint: "trouser",
        fields: [
            "waist",
            "hips",
            "thigh",
            "calf",
            "length",
            "knee",
            "sitting_crotch_depth",
            "outseam",
        ],
    },
    "vase-coat": {
        label: "Vase Coat",
        endpoint: "vase-coat",
        fields: ["coller", "waist", "chest", "length"],
    },
    "sheer-vani": {
        label: "Sheer Vani",
        endpoint: "sheer-vani",
        fields: [
            "coller",
            "waist",
            "chest",
            "length",
            "sleve_length",
            "sleve_hole",
            "sholder_width",
        ],
    },
    coat: {
        label: "Coat",
        endpoint: "coat",
        fields: ["waist", "chest", "sleve_length", "sleve_hole"],
    },
};

export default function CustomerMeasurements() {
    const { token } = useContext(AuthContext);
    const { id } = useParams(); // customer id from route
    const CustId = parseInt(id, 10);
    const [customer, setCustomer] = useState(null);

    const apiBase = "https://anmoltailor.pythonanywhere.com/api";

    const [measurements, setMeasurements] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [activeType, setActiveType] = useState(null);
    const [form, setForm] = useState({});
    const [editingId, setEditingId] = useState(null);

    // -----------------------
    // Load all measurements
    // -----------------------

    useEffect(() => {
        setMeasurements(null); // clear old data
        console.log("Customer ID changed, reloading measurements:", CustId);
    }, [CustId]);

    useEffect(() => {
          const fetchCustomer = async (id) => {
        try {
            const res = await axios.get(`${apiBase}/customers/${id}/`, {
                headers: { Authorization: `Token ${token}` },
            });
            console.log(res.data)
            setCustomer(res.data) ;
        } catch (err) {
            console.error("Failed to fetch customers:", err);
        }
    };
        fetchCustomer(CustId);
    }, [CustId]);


    useEffect(() => {
        if (!CustId) return;
        let canceled = false;
        console.log("Loading measurements for customer ID:", CustId);
        const loadAll = async () => {
            setLoading(true);
            setError(null);
            const result = {};

            await Promise.all(
                Object.keys(TYPES).map(async (key) => {
                    const ep = TYPES[key].endpoint;
                    try {
                        const res = await axios.get(`${apiBase}/${ep}/?customer=${CustId}`, {
                            headers: { Authorization: `Token ${token}` },
                        });
                        if (canceled) return;

                        const data = Array.isArray(res.data) ? res.data : res.data.results || [];
                        console.log(`Fetched ${data.length} records for ${ep}:`, data);
                        result[key] = data.length > 0 ? { exists: true, record: data[0] } : { exists: false, record: null };
                    } catch (err) {
                        if (!canceled) {
                            console.error(`Error fetching ${ep}`, err?.response?.data || err.message);
                            result[key] = { exists: false, record: null };
                        }
                    }
                })
            );

            if (!canceled) {
                setMeasurements(result);
                setLoading(false);
            }
        };

        loadAll();

        return () => {
            canceled = true; // cancel stale fetches
        };
    }, [CustId, token]);

    // -----------------------
    // Modal helpers
    // -----------------------
    const openModal = (typeKey) => {
        setActiveType(typeKey);

        const existing = measurements[typeKey]?.record || null;
        const defaults = {};

        TYPES[typeKey].fields.forEach((f) => {
            if (existing && existing[f] !== undefined && existing[f] !== null) {
                defaults[f] = existing[f];
            } else {
                // default booleans for pockets/rounds
                defaults[f] = f.includes("pocket") || f.includes("round") ? false : "";
            }
        });

        setForm(defaults);
        setEditingId(existing?.id || null);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setActiveType(null);
        setForm({});
        setEditingId(null);
    };

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const save = async () => {
        if (!activeType) return;
        const meta = TYPES[activeType];
        const url = `${apiBase}/${meta.endpoint}/` + (editingId ? `${editingId}/` : "");
        const method = editingId ? "put" : "post";

        // ✅ use lowercase 'customer'
        const payload = { ...form, customer: CustId };

        try {
            await axios({ method, url, headers: { Authorization: `Token ${token}` }, data: payload });

            // reload this type only
            const res = await axios.get(`${apiBase}/${meta.endpoint}/?customer=${CustId}`, {
                headers: { Authorization: `Token ${token}` },
            });

            const newRecord =
                (Array.isArray(res.data) && res.data[0]) ||
                (res.data.results && res.data.results[0]) ||
                null;

            setMeasurements((prev) => ({
                ...prev,
                [activeType]: { exists: !!newRecord, record: newRecord },
            }));

            closeModal();
        } catch (err) {
            console.error("Save error:", err?.response?.data || err.message);
            setError("Failed to save measurement. Check console for details.");
        }
    };

    const renderFieldInput = (field) => {
        const val = form[field];
        const isBooleanField =
            typeof val === "boolean" ||
            field.includes("pocket") ||
            field.includes("round") ||
            field.startsWith("front_") ||
            field.startsWith("side_");

        if (isBooleanField) {
            return (
                <div className="form-check mb-2">
                    <input
                        id={field}
                        className="form-check-input"
                        type="checkbox"
                        checked={!!val}
                        onChange={(e) => handleChange(field, e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor={field}>
                        {field}
                    </label>
                </div>
            );
        }

        return (
            <div className="mb-2">
                <label className="form-label">{field}</label>
                <input
                    type="text"
                    className="form-control"
                    value={val ?? ""}
                    onChange={(e) => handleChange(field, e.target.value)}
                />
            </div>
        );
    };

    const handlePrint = (typeKey) => {
        const meta = TYPES[typeKey];
        const entry = measurements[typeKey];
        if (!entry?.exists) {
            alert(`No ${meta.label} measurement to print`);
            return;
        }

        // Create printable content
        const printable = `
    <h2>Customer Name: ${customer.name}</h2>
    <h2>Phone Number: ${customer.Phome_number}</h2>
    <h2>${meta.label} </h2>
    <ul>
      ${meta.fields.map(f => {
            const val = entry.record?.[f];
            const display = typeof val === "boolean" ? (val ? "Yes" : "No") : (val ?? "—");
            return `<li><strong>${f}:</strong> ${display}</li>`;
        }).join("")}
    </ul>
  `;

        const printWindow = window.open("", "_blank");
        printWindow.document.write(`<html><head><title>${meta.label}</title></head><body>${printable}</body></html>`);
        printWindow.document.close();
        printWindow.print();
    };


    // -----------------------
    // Render
    // -----------------------
    if (loading) return <div className="container mt-3">Loading measurements…</div>;
    if (error) return <div className="container mt-3 text-danger">{error}</div>;

    return (
        <div className="container mt-3">
            {customer ? <h3 className="m-3">Customer Name: {customer.name}</h3> : <p>Loading…</p>}
            <h3 className="m-3">Measurements</h3>
          
            {Object.keys(TYPES).map((key) => {
                const meta = TYPES[key];
                const entry = measurements[key] || { exists: false, record: null };
                const exists = entry.exists;

                return (
                    <div className="card mb-3" key={key}>
                        <div className="card-body d-flex justify-content-between align-items-start">
                            <div>
                                <h5 className="card-title">{meta.label}</h5>
                                {exists ? (
                                    <div style={{ maxWidth: 800 }}>
                                        <div className="row">
                                            {meta.fields.map((f) => (
                                                <div className="col-6 mb-1" key={f}>
                                                    <strong style={{ textTransform: "capitalize" }}>{f}:</strong>{" "}
                                                    <span>{typeof entry.record?.[f] === "boolean" ? (entry.record?.[f] ? "Yes" : "No") : entry.record?.[f] ?? "—"}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                  
                                    <p className="text-muted">No measurement yet.</p>
                                   
                                )}
                            </div>
                            <div className="d-flex flex-column gap-2">
                                <button
                                    className={exists ? "btn btn-outline-primary" : "btn btn-success"}
                                    onClick={() => openModal(key)}
                                >
                                    {exists ? "Edit" : "Create"}
                                </button>

                                {exists && (
                                    <button className="btn btn-outline-secondary" onClick={() => handlePrint(key)}>
                                        Print
                                    </button>
                                )}
                            </div>

                        </div>
                    </div>
                );
            })}

            {/* Modal */}
            <Modal key={`${activeType}-${editingId || "new"}-${CustId}`} show={showModal} onHide={closeModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{editingId ? "Edit" : "Create"} {activeType ? TYPES[activeType].label : ""}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {activeType ? (
                        <form>
                            <div className="row">
                                {TYPES[activeType].fields.map((field) => (
                                    <div className="col-md-6" key={field}>
                                        {renderFieldInput(field)}
                                    </div>
                                ))}
                            </div>
                        </form>
                    ) : (
                        <p>No type selected</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeModal}>Cancel</Button>
                    <Button variant="primary" onClick={save}>Save</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
