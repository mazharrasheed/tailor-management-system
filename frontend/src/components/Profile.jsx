import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';

const Profile = () => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    // Change password modal state
    const [showModal, setShowModal] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword1, setNewPassword1] = useState('');
    const [newPassword2, setNewPassword2] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');

    const token = localStorage.getItem('access_token');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(
                    'https://anmoltailor.pythonanywhere.com/api/profile/',
                    { headers: { Authorization: `Token ${token}` } }
                );
                setUsers(response.data);
            } catch (err) {
                setError('Failed to fetch users');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [token]);

    // -----------------------------
    // Change password handler
    // -----------------------------

const getCSRFToken = async () => {
    await axios.get(
        'http://127.0.0.1:8000/api/auth/csrf/',
        { withCredentials: true }
    );
};

const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword1 !== newPassword2) {
        setPasswordError('New passwords do not match');
        return;
    }

    try {
        // ✅ 1. Get CSRF cookie
        await getCSRFToken();

        // ✅ 2. Read CSRF token from cookie
        const csrfToken = document.cookie
            .split('; ')
            .find(row => row.startsWith('csrftoken='))
            ?.split('=')[1];

        // ✅ 3. Make secure request
        await axios.post(
            'http://127.0.0.1:8000/api/auth/password/change/',
            {
                old_password: oldPassword,
                new_password1: newPassword1,
                new_password2: newPassword2,
            },
            {
                headers: {
                    Authorization: `Token ${token}`,
                    'X-CSRFToken': csrfToken,
                },
                withCredentials: true,
            }
        );

        setPasswordSuccess('Password changed successfully');
        setTimeout(() => setShowModal(false), 1500);

    } catch (err) {
        setPasswordError(
            err.response?.data?.old_password?.[0] ||
            err.response?.data?.new_password2?.[0] ||
            'Failed to change password'
        );
    }
};



    return (
        <div className="container p-4">
            <h2>User Profile</h2>

            {error && <p className="text-danger">{error}</p>}

            {loading ? (
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            ) : (
                users.map((user) => (
                    <div key={user.id} className="mb-3">
                        <h5>User Name: {user.username}</h5>
                        <p>Email: {user.email}</p>
                    </div>
                ))
            )}

            <Button variant="warning" onClick={() => setShowModal(true)}>
                Change Password
            </Button>

            {/* Change Password Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Change Password</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {passwordError && <p className="text-danger">{passwordError}</p>}
                    {passwordSuccess && <p className="text-success">{passwordSuccess}</p>}

                    <div className="mb-3">
                        <label className="form-label">Current Password</label>
                        <input
                            type="password"
                            className="form-control"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">New Password</label>
                        <input
                            type="password"
                            className="form-control"
                            value={newPassword1}
                            onChange={(e) => setNewPassword1(e.target.value)}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Confirm New Password</label>
                        <input
                            type="password"
                            className="form-control"
                            value={newPassword2}
                            onChange={(e) => setNewPassword2(e.target.value)}
                        />
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleChangePassword}>
                        Change Password
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Profile;
