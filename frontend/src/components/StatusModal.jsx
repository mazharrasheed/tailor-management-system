import React from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';

const StatusModal = ({ message, status, onClose }) => {
  if (!message) return null;

  return (
    <div className="modal d-block" tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className={`modal-header ${status === 'success' ? 'bg-success' : 'bg-danger'}`}>
            <h5 className="modal-title text-white">Status</h5>
          </div>
          <div className="modal-body">
            <p>{message}</p>
          </div>
          <div className="modal-footer">
            <button
              className={`btn btn-outline-${status === 'success' ? 'success' : 'danger'}`}
              onClick={onClose}
            >
              {status === 'success' ? <FaCheck /> : <FaTimes />} OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusModal;