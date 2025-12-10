// CustomerFormModal.jsx

import React from "react";
import { FaPlus, FaTimes } from "react-icons/fa";

const CustomerFormModal = ({ show, onClose, onSubmit, formData, setFormData, editingId }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4>{editingId ? "Edit Customer" : "Create Customer"}</h4>
          <button className="btn btn-sm btn-danger" onClick={onClose}><FaTimes /></button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="row mb-3">
            <div className="col-md-6">
              <label>Name</label>
              <input className="form-control"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="col-md-6">
              <label>Phone</label>
              <input className="form-control"
                value={formData.Phome_number}
                onChange={(e) => setFormData({ ...formData, Phome_number: e.target.value })}
              />
            </div>

            <div className="col-md-6 mt-3">
              <label>Address</label>
              <input className="form-control"
                value={formData.Adress}
                onChange={(e) => setFormData({ ...formData, Adress: e.target.value })}
              />
            </div>

            <div className="col-md-6 mt-3">
              <label>Description</label>
              <textarea className="form-control"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-primary">
              <FaPlus /> {editingId ? "Update" : "Create"}
            </button>

            <button type="button" className="btn btn-secondary" onClick={onClose}>
              <FaTimes /> Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CustomerFormModal;
