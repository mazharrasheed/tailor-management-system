import React from "react";
import { Modal, Button } from "react-bootstrap";

const CustomerDetailsModal = ({ show, onClose, customer }) => {
    if (!customer) return null;

    const bool = (value) => (value ? "Yes" : "No");

    return (
        <Modal show={show} onHide={onClose} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Customer Details</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <div className="container">

                    {/* WARNING: This row will be 1 column on mobile, 2 columns on md+ */}

                    <div className="row">
                        <div className="col-md-3 mb-3">
                            <p><strong>Name:</strong> {customer.name}</p>
                        </div>
                        <div className="col-md-3 mb-3">
                            <p><strong>Phone:</strong> {customer.Phome_number}</p>
                        </div>
                        <div className="col-md-3 mb-3">
                            <p><strong>Address:</strong> {customer.Adress}</p>
                        </div>
                        <div className="col-md-3 mb-3">
                            <p><strong>Description:</strong> {customer.description}</p>
                        </div>
                    </div>

                        {/* row 1 */}
                         <div className="row"> 

                    

                            <p><strong>Front Pocket Right:</strong> {bool(customer.front_pocket_right)}</p>
                            <p><strong>Front Pocket Left:</strong> {bool(customer.front_pocket_left)}</p>

                            <p><strong>Side Pocket Right:</strong> {bool(customer.side_pocket_right)}</p>
                            <p><strong>Side Pocket Left:</strong> {bool(customer.side_pocket_left)}</p>

                            <p><strong>Shirt Kera Round:</strong> {bool(customer.shirt_kera_round)}</p>
                            <p><strong>Shalwar Pocket:</strong> {bool(customer.shalwar_pocket)}</p>
                      
                        {/* COLUMN 2 */}
                        <div className="col-12 col-md-6 mb-3">
                            <p><strong>Collar:</strong> {customer.coller}</p>
                            <p><strong>Tera:</strong> {customer.tera}</p>

                            <p><strong>Sleeve Length:</strong> {customer.sleve_length}</p>
                            <p><strong>Sleeve Hole:</strong> {customer.sleve_hole}</p>
                            <p><strong>Cuff Hole:</strong> {customer.cuff_hole}</p>
                            <p><strong>Cuff Width:</strong> {customer.cuff_width}</p>

                            <p><strong>Chest:</strong> {customer.chest}</p>
                            <p><strong>Belly:</strong> {customer.belly}</p>

                            <p><strong>Shirt Kera:</strong> {customer.shirt_kera}</p>
                            <p><strong>Shirt Length:</strong> {customer.shirt_length}</p>
                            <p><strong>Shalwar Length:</strong> {customer.shalwar_length}</p>
                            <p><strong>Shalwar Hole:</strong> {customer.shalwar_hole}</p>

                            <p><strong>Created At:</strong> {new Date(customer.created_at).toLocaleString()}</p>
                        </div>

                    </div>
                </div>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default CustomerDetailsModal;
