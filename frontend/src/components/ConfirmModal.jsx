import React from 'react';
import { FaTimes, FaTrash } from 'react-icons/fa';

const ConfirmModal = ({ show, onClose, onConfirm, message }) => {
  if (!show) return null;

  return (
    <div className="modal d-block" tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header bg-danger">
            <h5 className="modal-title text-white">Confirm Deletion</h5>
          </div>
          <div className="modal-body">
            <p>{message || "Are you sure you want to delete this item?"}</p>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              <FaTimes /> Cancel
            </button>
            <button className="btn btn-danger" onClick={onConfirm}>
              <FaTrash /> Yes, Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;