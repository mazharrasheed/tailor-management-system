// CustomerManager.jsx

import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { NavLink } from 'react-router-dom';
import { AuthContext } from "../context/AuthContext";
import { FaEdit, FaTrash, FaPlus, FaTimes, FaLandmark, FaEye } from "react-icons/fa";


import StatusModal from "./StatusModal";
import ConfirmModal from "./ConfirmModal";
import ReusableTable from "./ReusableTable";
import CustomerDetailsModal from "./CustomerDetailsModal";
import CustomerFormModal from "./CustomerFormModal";

const CustomerManager = () => {
    const apiBase = "https://anmoltailor.pythonanywhere.com/api";
    const { token, userPerms } = useContext(AuthContext);
    const [customers, setCustomers] = useState([]);
    const [fetch_customer, setCustomer] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState(null);
    const [modalMessage, setModalMessage] = useState("");
    const [modalStatus, setModalStatus] = useState("");
    // const [userPerms, setUserPerms] = useState({});

    // NEW → Details modal states
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const initialForm = {
        name: "",
        Phome_number: "",
        Adress: "",
        description: "",
    };

    const [formData, setFormData] = useState(initialForm);

    useEffect(() => {
        fetchCustomers();
        // fetchPermissions();
    }, []);

    // const fetchPermissions = async () => {
    //     const response = await axios.get(`${apiBase}/users/me/permissions/`, {
    //         headers: { Authorization: `Token ${token}` },
    //     });
    //     const perms = response.data.permissions.map(p => p.codename);
    //     setUserPerms(perms);

    // };

    const fetchCustomers = async () => {
        try {
            const res = await axios.get(`${apiBase}/customers/`, {
                headers: { Authorization: `Token ${token}` },
            });
            setCustomers(res.data);
        } catch (err) {
            console.error("Failed to fetch customers:", err);
        }
    };

    const fetchCustomer = async (id) => {
        try {
            const res = await axios.get(`${apiBase}/customers/${id}/`, {
                headers: { Authorization: `Token ${token}` },
            });
            return res.data;
        } catch (err) {
            console.error("Failed to fetch customers:", err);
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
                await axios.put(`${apiBase}/customers/${editingId}/`, formData, {
                    headers: { Authorization: `Token ${token}` },
                });
            } else {
                await axios.post(`${apiBase}/customers/`, formData, {
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
            const res = await axios.delete(`${apiBase}/customers/${customerToDelete}/`, {
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
        { header: "Phone", accessor: "phone_number", sortable: true },
        { header: "Address", accessor: "address", sortable: true },
        { header: "Description", accessor: "description", sortable: true },

        {
            header: "Actions",
            center: true,
            accessor: (row) => (
                    <div className="d-flex justify-content-center">
                        {Array.isArray(userPerms) && userPerms.includes("view_measurements") && (
                            <div className="p-1">
                                <NavLink className="btn btn-sm btn-outline-primary me-2" to={`/customer-details/${row.id}`}><FaEye style={{ cursor: "pointer" }} className="me-2" />Details</NavLink>
                            </div>
                        )}


                        {Array.isArray(userPerms) && userPerms.includes("change_customer") && (
                            <div className="p-1">
                                <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEdit(row)}>
                                    <FaEdit /> Edit
                                </button>
                            </div>
                        )}

                        {Array.isArray(userPerms) && userPerms.includes("delete_customer") && (
                            <div className="p-1">
                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(row.id)}>
                                    <FaTrash /> Delete
                                </button>
                            </div>
                        )}
                    </div>
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

            {Array.isArray(userPerms) && userPerms.includes("add_customer") && (
                <button className="btn btn-success mb-3 mt-3" onClick={() => setShowForm(true)}>
                    <FaPlus /> Create Customer
                </button>
            )}

            {/* FORM (unchanged logic) */}
            {showForm && (
                <CustomerFormModal
                    show={showForm}
                    onClose={resetForm}
                    onSubmit={handleSubmit}
                    formData={formData}
                    setFormData={setFormData}
                    editingId={editingId}
                />
            )}

            <ReusableTable columns={columns} data={customers} />
        </div>
    );
};

export default CustomerManager;
