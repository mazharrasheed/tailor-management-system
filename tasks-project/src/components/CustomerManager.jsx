// CustomerManager.jsx

import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { FaEdit, FaTrash, FaPlus, FaTimes } from "react-icons/fa";

import StatusModal from "./StatusModal";
import ConfirmModal from "./ConfirmModal";
import ReusableTable from "./ReusableTable";
import CustomerDetailsModal from "./CustomerDetailsModal";

const CustomerManager = () => {
    const { token } = useContext(AuthContext);

    const [customers, setCustomers] = useState([]);
    const [fetch_customer, setCustomer] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState(null);

    const [modalMessage, setModalMessage] = useState("");
    const [modalStatus, setModalStatus] = useState("");

    const [userPerms, setUserPerms] = useState({});

    // NEW → Details modal states
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const initialForm = {
        name: "",
        Phome_number: "",
        Adress: "",
        description: "",
        coller: "",
        tera: "",
        sleve_length: "",
        sleve_hole: "",
        cuff_hole: "",
        cuff_width: "",
        chest: "",
        belly: "",
        shirt_kera: "",
        shirt_length: "",
        shalwar_length: "",
        shalwar_hole: "",
        front_pocket_right: false,
        front_pocket_left: true,
        side_pocket_right: true,
        side_pocket_left: false,
        shirt_kera_round: true,
        shalwar_pocket: true,
    };

    const [formData, setFormData] = useState(initialForm);

    useEffect(() => {
        fetchCustomers();
        fetchPermissions();
    }, []);

    const fetchCustomers = async () => {
        try {
            const res = await axios.get("http://127.0.0.1:8000/api/customers/", {
                headers: { Authorization: `Token ${token}` },
            });
            setCustomers(res.data);
        } catch (err) {
            console.error("Failed to fetch customers:", err);
        }
    };

    const fetchCustomer = async (id) => {
        try {
            const res = await axios.get(`http://127.0.0.1:8000/api/customers/${id}/`, {
                headers: { Authorization: `Token ${token}` },
            });
            return res.data;
        } catch (err) {
            console.error("Failed to fetch customers:", err);
        }
    };

    const fetchPermissions = async () => {
        try {
            const res = await axios.get("http://127.0.0.1:8000/api/users/me/permissions/", {
                headers: { Authorization: `Token ${token}` },
            });
            setUserPerms(res.data);
        } catch (err) {
            console.error("Failed to fetch permissions:", err);
        }
    };

    const resetForm = () => {
        setFormData(initialForm);
        setEditingId(null);
        setShowForm(false);
    };

    // -------------------------------------------------------
    // DETAILS BUTTON → Opens modal with full customer details
    // -------------------------------------------------------
    const handleDetails = async (customer) => {
        const data = await fetchCustomer(customer.id);
        setSelectedCustomer(data);
        setShowDetailsModal(true);
    };

    const handleEdit = (customer) => {
        const safe = { ...initialForm, ...customer };
        setFormData(safe);
        setEditingId(customer.id);
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`http://127.0.0.1:8000/api/customers/${editingId}/`, formData, {
                    headers: { Authorization: `Token ${token}` },
                });
            } else {
                await axios.post("http://127.0.0.1:8000/api/customers/", formData, {
                    headers: { Authorization: `Token ${token}` },
                });
            }
            await fetchCustomers();
            resetForm();
        } catch (err) {
            console.error("Submit error:", err);
            setModalMessage("Failed to save customer");
            setModalStatus("error");
        }
    };

    const confirmDelete = async () => {
        try {
            const res = await axios.delete(`http://127.0.0.1:8000/api/customers/${customerToDelete}/`, {
                headers: { Authorization: `Token ${token}` },
            });
            if (res.status === 204) {
                setCustomers((prev) => prev.filter((c) => c.id !== customerToDelete));
                setModalMessage("Customer deleted successfully.");
                setModalStatus("success");
            } else {
                setModalMessage("Failed to delete customer.");
                setModalStatus("error");
            }
        } catch (err) {
            if (err.response) {
                setModalMessage(`Error: ${err.response.status} - ${err.response.data?.detail || "Server error"}`);
            } else if (err.request) {
                setModalMessage("Error: No response from server.");
            } else {
                setModalMessage(`Error: ${err.message}`);
            }
            setModalStatus("error");
        } finally {
            setShowConfirmModal(false);
            setCustomerToDelete(null);
        }
    };

    const handleDelete = (id) => {
        setCustomerToDelete(id);
        setShowConfirmModal(true);
    };

    const columns = [
        { header: "ID", accessor: "id", sortable: true, center: true },
        { header: "Name", accessor: "name", sortable: true },
        { header: "Phone", accessor: "Phome_number", sortable: true },
        { header: "Address", accessor: "Adress", sortable: true },
        { header: "Collar", accessor: "coller", sortable: true },
        { header: "Chest", accessor: "chest", sortable: true },
        { header: "Belly", accessor: "belly", sortable: true },
        {
            header: "Actions",
            center: true,
            accessor: (row) => (
                <>
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleDetails(row)}>
                        <FaEdit /> Details
                    </button>
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEdit(row)}>
                        <FaEdit /> Edit
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(row.id)}>
                        <FaTrash /> Delete
                    </button>
                </>
            ),
            sortable: false,
        },
    ];

    return (
        <div className="container mt-4">

            {/* Confirm Delete Modal */}
            <ConfirmModal
                show={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={confirmDelete}
                message={modalMessage}
            />

            <StatusModal
                message={modalMessage}
                status={modalStatus}
                onClose={() => setModalMessage("")}
            />

            {/* DETAILS MODAL */}
            <CustomerDetailsModal
                show={showDetailsModal}
                onClose={() => setShowDetailsModal(false)}
                customer={selectedCustomer}
            />

            <h2>Customer Manager</h2>

            {userPerms.permissions?.tasks?.includes("add_customer") && (
                <button className="btn btn-success mb-3 mt-3" onClick={() => setShowForm(true)}>
                    <FaPlus /> Create Customer
                </button>
            )}

            {/* FORM (unchanged logic) */}
            {showForm && (
                <form onSubmit={handleSubmit} className="card p-4 mb-4">
                    <h4  className="mb-4" >Customer Details</h4>
                    <div className="row mb-3">
                        <div className="col-md-3">
                            <label>Name</label>
                            <input className="form-control" value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                        </div>

                        <div className="col-md-3">
                            <label>Phone</label>
                            <input className="form-control" value={formData.Phome_number}
                                onChange={(e) => setFormData({ ...formData, Phome_number: e.target.value })} />
                        </div>

                        <div className="col-md-3">
                            <label>Address</label>
                            <input className="form-control" value={formData.Adress}
                                onChange={(e) => setFormData({ ...formData, Adress: e.target.value })} />
                        </div>

                        <div className="col-md-3">
                            <label>Description</label>
                            <textarea className="form-control" value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                        </div>
                    </div>

                    {/* Measurements */}
                    <div className="row mb-3">
                        <h4  className="mb-4" >Qameez Sizes</h4>
                        <div className="col-md-3">
                            <label>Collar</label>
                            <input className="form-control" value={formData.coller}
                                onChange={(e) => setFormData({ ...formData, coller: e.target.value })} />
                        </div>

                        <div className="col-md-3">
                            <label>Tera</label>
                            <input className="form-control" value={formData.tera}
                                onChange={(e) => setFormData({ ...formData, tera: e.target.value })} />
                        </div>
                    </div>

                    <div className="row mb-3">
                        <div className="col-md-3">
                            <label>Sleeve length</label>
                            <input className="form-control" value={formData.sleve_length}
                                onChange={(e) => setFormData({ ...formData, sleve_length: e.target.value })} />
                        </div>

                        <div className="col-md-3">
                            <label>Sleeve hole</label>
                            <input className="form-control" value={formData.sleve_hole}
                                onChange={(e) => setFormData({ ...formData, sleve_hole: e.target.value })} />
                        </div>

                        <div className="col-md-3">
                            <label>Cuff hole</label>
                            <input className="form-control" value={formData.cuff_hole}
                                onChange={(e) => setFormData({ ...formData, cuff_hole: e.target.value })} />
                        </div>

                        <div className="col-md-3">
                            <label>Cuff width</label>
                            <input className="form-control" value={formData.cuff_width}
                                onChange={(e) => setFormData({ ...formData, cuff_width: e.target.value })} />
                        </div>
                    </div>

                    <div className="row mb-3">
                        <div className="col-md-3">
                            <label>Chest</label>
                            <input className="form-control" value={formData.chest}
                                onChange={(e) => setFormData({ ...formData, chest: e.target.value })} />
                        </div>

                        <div className="col-md-3">
                            <label>Belly</label>
                            <input className="form-control" value={formData.belly}
                                onChange={(e) => setFormData({ ...formData, belly: e.target.value })} />
                        </div>

                        <div className="col-md-3">
                            <label>Shirt kera</label>
                            <input className="form-control" value={formData.shirt_kera}
                                onChange={(e) => setFormData({ ...formData, shirt_kera: e.target.value })} />
                        </div>

                        <div className="col-md-3">
                            <label>Shirt length</label>
                            <input className="form-control" value={formData.shirt_length}
                                onChange={(e) => setFormData({ ...formData, shirt_length: e.target.value })} />
                        </div>
                    </div>

                    <div className="row mb-4">
                         <h4 className="mb-4" >Shalwar Sizes</h4>
                        <div className="col-md-3">
                            <label>Shalwar length</label>
                            <input className="form-control" value={formData.shalwar_length}
                                onChange={(e) => setFormData({ ...formData, shalwar_length: e.target.value })} />
                        </div>

                        <div className="col-md-3">
                            <label>Shalwar hole</label>
                            <input className="form-control" value={formData.shalwar_hole}
                                onChange={(e) => setFormData({ ...formData, shalwar_hole: e.target.value })} />
                        </div>
                    </div>

                    {/* CHECKBOX SECTION */}
                  
                        <div className="row">
                             <h4  className="mb-4" >Pocket Details</h4>
                            <div className="col-md-3">
                                <label>
                                    <input type="checkbox"
                                        checked={formData.front_pocket_left}
                                        onChange={(e) =>
                                            setFormData({ ...formData, front_pocket_left: e.target.checked })
                                        }
                                    /> Front pocket left
                                </label>
                            </div>

                            <div className="col-md-3">
                                <label>
                                    <input type="checkbox"
                                        checked={formData.front_pocket_right}
                                        onChange={(e) =>
                                            setFormData({ ...formData, front_pocket_right: e.target.checked })
                                        }
                                    /> Front pocket right
                                </label>
                            </div>

                            <div className="col-md-3">
                                <label>
                                    <input type="checkbox"
                                        checked={formData.side_pocket_right}
                                        onChange={(e) =>
                                            setFormData({ ...formData, side_pocket_right: e.target.checked })
                                        }
                                    /> Side pocket right
                                </label>
                            </div>

                            <div className="col-md-3">
                                <label>
                                    <input type="checkbox"
                                        checked={formData.side_pocket_left}
                                        onChange={(e) =>
                                            setFormData({ ...formData, side_pocket_left: e.target.checked })
                                        }
                                    /> Side pocket left
                                </label>
                            </div>
                        </div>

                        <div className="row mt-2">
                            <div className="col-md-3">
                                <label>
                                    <input type="checkbox"
                                        checked={formData.shirt_kera_round}
                                        onChange={(e) =>
                                            setFormData({ ...formData, shirt_kera_round: e.target.checked })
                                        }
                                    /> Shirt kera round
                                </label>
                            </div>

                            <div className="col-md-3">
                                <label>
                                    <input type="checkbox"
                                        checked={formData.shalwar_pocket}
                                        onChange={(e) =>
                                            setFormData({ ...formData, shalwar_pocket: e.target.checked })
                                        }
                                    /> Shalwar pocket
                                </label>
                            </div>
                        </div>
                   

                    <div className="d-flex gap-2 mt-5">
                        <button type="submit" className="btn btn-primary">
                            <FaPlus /> {editingId ? "Update" : "Create"}
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={resetForm}>
                            <FaTimes /> Cancel
                        </button>
                    </div>
                </form>
            )}

            <ReusableTable columns={columns} data={customers} />
        </div>
    );
};

export default CustomerManager;
